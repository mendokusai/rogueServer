//create mixins namespace
Game.EntityMixins = {};

Game.EntityMixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		//detect if game is over
		if (this.getHp() < 1 ) {
			Game.Screen.playScreen.setGameEnded(true);
			Game.sendMessage(this, 'You dead! Press [Enter] to continue.');
		}
		//rerender the screen
		Game.refresh();
		//lock engine and wait for player to press key
		this.getMap().getEngine().lock();
		//clear messages queue
		this.clearMessages();
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
			if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
				this.act();
			} else {
				this.getMap().removeEntity(this);
			}
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