//create mixins namespace
Game.EntityMixins = {};

Game.EntityMixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		if (this._acting) {
			return;
		}
		this._acting = true;
		this.addTurnHunger();
		//detect if game is over
		if (!this.isAlive()) {
			Game.Screen.playScreen.setGameEnded(true);
			//send a last message
			Game.sendMessage(this, 'Press [Enter] to continue.');
		}
		//rerender the screen
		Game.refresh();
		//lock engine and wait for player to press key
		this.getMap().getEngine().lock();
		//clear messages queue
		this.clearMessages();
		this._acting = false;
	}
};


Game.EntityMixins.FungusActor = {
	name: 'FungusActor',
	groupName: 'Actor',
	init: function() {
		this._growthsRemaining = 5;
	},
	act: function() {

		//check to see if spawn child
		if (this._growthsRemaining > 0) {
			if (Math.random() <= 0.02) {
				//generate coordinates of random adjuacent square
				//generate offset [-1,0,1] for x & y
				//generate number 0-2, subtract 1
				var xOffset = Math.floor(Math.random() * 3) - 1;
				var yOffset = Math.floor(Math.random() * 3) - 1;
				//check to make sure spawn on same tile
				if (xOffset != 0 || yOffset != 0) {
					//check if we can actualy spawn at location
					if (this.getMap().isEmptyFloor(this.getX() + xOffset,
																				 this.getY() + yOffset,
																				 this.getZ())) {
						var entity = Game.EntityRepository.create('fungus');
						entity.setPosition(this.getX() + xOffset, 
															 this.getY() + yOffset, 
															 this.getZ());
						this.getMap().addEntity(entity);
						this._growthsRemaining--;
						//send message to nearby
						Game.sendMessageNearby(this.getMap(),
																	 entity.getX(), 
																	 entity.getY(), 
																	 entity.getZ(),
							"The fungi are growing!");
					}
				}
			}
		}
	}
}

Game.EntityMixins.WanderActor = {
	name: 'WanderActor',
	groupName: 'Actor',
	act: function() {
		// flip coint o determine if moving by 1
		var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
		// 50/50 towards x or y
		if (Math.round(Math.random()) === 1) {
			this.tryMove(this.getX() + moveOffset, 
									 this.getY(), this.getZ());
		} else {
			this.tryMove(this.getX(), 
									 this.getY() + moveOffset, 
									 this.getZ());
		}
	}
};

Game.EntityMixins.Attacker = {
	name: 'Attacker',
	groupName: 'Attacker',
	init: function(template) {
		this._attackValue = template['attackValue'] || 1;
	},
	getAttackValue: function() {
		return this._attackValue;
	},
	attack: function(target) {
		//remove entity if attackable
		if (target.hasMixin('Destructable')) {
			var attack = this.getAttackValue();
			var defense = target.getDefenseValue();
			var max = Math.max(0, attack - defense);
			var damage = 1 + Math.floor(Math.random() * max);

			Game.sendMessage(this, 'You strike the %s for %d damage.',
				[target.getName(), damage]);
			Game.sendMessage(target, 'The %s strikes you for %d damange.',
				[this.getName(), damage]);
			target.takeDamage(this, damage);
		}
	}
}

Game.EntityMixins.Destructable = {
	name: 'Destructable',
	init: function(template) {
		this._maxHp = template['maxHp'] || 10;
		this._hp = template['hp'] || this._maxHp;
		this._defenseValue = template['defenseValue'] || 0;
	},
	getDefenseValue: function() {
		return this._defenseValue;
	},
	getHp: function() {
		return this._hp;
	},
	getMaxHp: function() {
		return this._maxHp;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		//if 0 or less, remove
		if (this._hp <= 0) {
			Game.sendMessage(attacker, 'In a rage, you kill the %s.', 
				[this.getName()]);
			if (this.hasMixin(Game.EntityMixins.CorpseDropper)) {
				this.tryDropCorpse();
			}
			this.kill();
		}
	}
};

//messaging
Game.EntityMixins.MessageRecipient = {
	name: 'MessageRecipient',
	init: function(template) {
		this._messages = [];
	},
	receiveMessage: function(message) {
		this._messages.push(message);
	},
	getMessages: function() {
		return this._messages;
	},
	clearMessages: function() {
		this._messages = [];
	}
}

Game.EntityMixins.Sight = {
	name: 'Sight',
	groupName: 'Sight',
	init: function(template) {
		this._sightRadius = template['sightRadius'] || 5;
	},
	getSightRadius: function() {
		return this._sightRadius;
	}
}

Game.EntityMixins.InventoryHolder = {
	name: 'InventoryHolder',
	init: function(template) {
		//default to 10 slots.
		var inventorySlots = template['inventorySlots'] || 10;
		//set up empty inventory
		this._items = new Array(inventorySlots);
	},
	getItems: function() {
		return this._items;
	},
	getItem: function(i) {
		return this._items[i];
	},
	addItem: function(item) {
		//try to find a slot returning true if item added
		for (var i = 0; i < this._items.length; i++) {
			if (!this._items[i]) {
				this._items[i] = item;
				return true;
			}
		}
		return false;
	},
	removeItem: function(i) {
		//clear inventory slot
		this._items[i] = null;
	},
	canAddItem: function() {
		//check for empty slot
		for (var i = 0; i < this._items.length; i++) {
			if (!this._items[i]){
				return true;
			}
		}
		return false;
	},
	pickupItems: function(indices) {
		//allow user to pickup items from map at location
		//indicies for array from map.getItemsAt
		var mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getZ());
		var added = 0;
		//iterate through all indices
		for (var i = 0; i < indices.length; i++) {
			//add item. if inventory has room, splice item out of list
			//offset number of items to fetch correct item
			if (this.addItem(mapItems[indices[i] - added])) {
				mapItems.splice(indices[i] - added, 1);
				added++;
			}	else {
				//inventory is full
				break;
			}
		}
		//update map items
		this._map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
		//return true only if added all items
		return added === indices.length;
	},
	dropItem: function(i) {
		//drop item to current map tile
		if (this._items[i]) {
			if (this._map) {
				this._map.addItem(this.getX(), this.getY(), this.getZ(), this._items[i]);
			}
			this.removeItem(i);
		}
	}
};

Game.EntityMixins.FoodConsumer = {
	name: 'FoodConsumer',
	init: function(template) {
		this._maxFullness = template['maxFullness'] || 100;
		//start halfway to max fullness 
		this._fullness = template['fullness'] || (this._maxFullness /2);
		//number of points to decrease fullness by every turn
		this._fullnessDepletionRate = template['fullnessDepletionRate'] || 1;	
	},
	addTurnHunger: function() {
		//remove standard depletion points
		this.modifyFullnessBy(-this._fullnessDepletionRate);
	},
	modifyFullnessBy: function(points) {
		this._fullness = this._fullness + points;
		if (this._fullness <= 0) {
			this.kill("You hunger for food proves to unhinge you need for life.");
		} else if (this._fullness > this._maxFullness) {
			this.kill("Your gluttony proves your undoing. You choke and gurgle a final sad noise.");
		}
	},
	getHungerState: function() {
		//fullness points percent of max
		var perPercent = this._maxFullness / 100;
		//5% of max = starving
		if (this._fullness <= perPercent * 5) {
			return 'Starving!';
		//25% of max = hungry;
		} else if (this._fullness <= perPercent * 25) {
			return 'Very hungry.';
		//95% of max = oversatiated
		} else if (this._fullness >= perPercent * 95) {
			return 'Stuffed. I couldn\'t eat a wafer.';
		//75% of max = full
		} else if (this._fullness >= perPercent * 75) {
			return 'Full';
		//Anything else = nothungy
		} else {
			return 'Content';
		}
	}
};

Game.EntityMixins.CorpseDropper = {
	name: 'CorpseDropper',
	init: function(template) {
		//chance of dropping a corpse
		this._corpseDropRate = template['corpseDropRate'] || 100;
	},
	tryDropCorpse: function() {
		if (Math.round(Math.random() * 100) < this._corpseDropRate) {
			//create a new corpse item and drop it
			this._map.addItem(this.getX(), this.getY(), this.getZ(),
				Game.ItemRepository.create('corpse', {
					name: this._name + ' corpse',
					foreground: this._foreground
				}));
		}
	}
};

Game.sendMessage = function(recipient, message, args) {
	//check recipient can receive message
	if (recipient.hasMixin(Game.EntityMixins.MessageRecipient)) {
		//if args, format message, else no probz
		if (args) {
			message = vsprintf(message, args);
		}
		recipient.receiveMessage(message);
	}
}

Game.sendMessageNearby = function(map, centerX, centerY, centerZ, message, args) {
	//if args, format message, else not necessary
	if (args) {
		message = vsprintf(message, args);
	}
	//get nearby entities
	entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
	//iterate through entities, sending messages if there
	for (var i = 0; i < entities.length; i++) {
		if (entities[i].hasMixin(Game.EntityMixins.MessageRecipient)) {
			entities[i].receiveMessage(message);
		}
	}
}