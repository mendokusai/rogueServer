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
		this._growthsRemaining = 10; //was 5
	},
	act: function() {

		//check to see if spawn child
		if (this._growthsRemaining > 0) {
			if (Math.random() <= 0.05) {  					//was 2.
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

Game.EntityMixins.Attacker = {
	name: 'Attacker',
	groupName: 'Attacker',
	init: function(template) {
		this._attackValue = template['attackValue'] || 1;
	},
	getAttackValue: function() {
		var modifier = 0;
		//if we can equip items, take into accoutn weapons and _armor
		if (this.hasMixin(Game.EntityMixins.Equipper)) {
			if (this.getWeapon()) {
				modifier += this.getWeapon().getAttackValue();
			}
			if (this.getArmor()) {
				modifier += this.getArmor().getAttackValue();
			}
		}
		return this._attackValue + modifier;
	},
	increaseAttackValue: function(value) {
		//if no value passe,d default to 2
		value = value || 2;
		//add to attack value
		this._attackValue += value;
		Game.sendMessage(this, 'You look like you bench, bro.');
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
		var modifier = 0;
		//if we can equip items consider weapon and armor
		if (this.hasMixin(Game.EntityMixins.Equipper)) {
			if (this.getWeapon()) {
				modifier += this.getWeapon().getDefenseValue();
			}
			if (this.getArmor()) {
				modifier += this.getArmor().getDefenseValue();
			}
		}
		return this._defenseValue + modifier;
	},
	getHp: function() {
		return this._hp;
	},
	getMaxHp: function() {
		return this._maxHp;
	},
	setHp: function(hp) {
		this._hp = hp;
	},
	increaseDefenseValue: function(value) {
		//if no value passed, default to 2
		value = value || 2;
		//add to the defense value
		this._defenseValue += value;
		Game.sendMessage(this, 'You look tougher.');
	},
	increaseMaxHp: function(value) {
		//if no value passed, default to 10
		value = value | 10;
		//add to both maxHP and Hp
		this._maxHp += value;
		this._hp += value;
		Game.sendMessage(this, 'You\'re the image of health.');
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		//if 0 or less, remove
		if (this._hp <= 0) {
			Game.sendMessage(attacker, 'In a rage, you kill the %s.', 
				[this.getName()]);
			this.raiseEvent('onDeath', attacker);
			attacker.raiseEvent('onKill', this);
			this.kill();
		}
	},
	listeners: {
		onGainLevel: function() {
			//heal entity
			this.setHp(this.getMaxHp());
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
	},
	increaseSightRadius: function(value) {
		//if no value passed, default to 1
		value = value || 1;
		//add to sight radius
		this._sightRadius += value;
		Game.sendMessage(this, 'Your eyes have become more adjusted to the dark.');
	},
	canSee: function(entity) {
		//if not on same map, exit early
		if (!entity || this._map !== entity.getMap() || this._z !== entity.getZ()) {
			return false;
		}
		var otherX = entity.getX();
		var otherY = entity.getY();
		//if not in a fieled view, then we won't be seen
		if ((otherX - this._x) * (otherX - this._x) +
			(otherY - this._y) * (otherY - this._y) >
			this._sightRadius * this._sightRadius) {
			return false;
		}

		//comput FOV, check coordinates
		var found = false;
		this.getMap().getFov(this.getZ()).compute(
			this.getX(), this.getY(),
			this.getSightRadius(),
			function(x, y, radius, visibility) {
				if (x === otherX && y === otherY) {
					found = true;
				}
			});
		return found;
	}
};

Game.EntityMixins.TaskActor = {
	name: 'TaskActor',
	groupName: 'Actor',
	init: function(template) {
		//load tasks
		this._tasks = template['tasks'] || ['wander'];
	},
	act: function() {
		//iterate through all our tasks
		for (var i = 0; i < this._tasks.length; i++) {
			if (this.canDoTask(this._tasks[i])) {
				//if we can perform the task, execute the function
				this[this._tasks[i]]();
				return;
			}
		}
	},
	canDoTask: function(task) {
		if (task === 'hunt') {
			return this.hasMixin('Sight') && this.canSee(this.getMap().getPlayer());
		} else if (task === 'wander') {
			return true;
		} else {
			throw new Error('Tried to perform undefined task ' + task);
		}
	},
	hunt: function() {
		var player = this.getMap().getPlayer();
		//if we are adjacent to the player, then attack instead of hunting
		var offsets = Math.abs(player.getX() - this.getX()) +
		Math.abs(player.getY() - this.getY());
		if (offsets === 1) {
			if (this.hasMixin('Attacker')) {
				this.attack(player);
				return;
			}
		}
		//generate path and move to tile
		var source = this;
		var z = source.getZ();
		var path = new ROT.Path.AStar(player.getX(), player.getY(), function(x, y) {
			//if an entity is present at tile, can't move there
			var entity = source.getMap().getEntityAt(x, y, z);
			if (entity && entity !== player && entity !== source) {
				return false;
			}
			return source.getMap().getTile(x, y, z).isWalkable();
		}, {topology: 4});
		//once we've got the path, move to second cell
		//passed in callback
		var count = 0;
		path.compute(source.getX(), source.getY(), function(x, y) {
			if (count == 1) {
				source.tryMove(x, y, z);
			}
			count++;
		});
	},
	wander: function() {
		//50/50 to determine moving by 1 in + /- direction
		var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
		//flip coin for x or y direction
		if (Math.round(Math.random()) === 1) {
			this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
		} else {
			this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
		}
	}
};

Game.EntityMixins.ExperienceGainer = {
	name: 'ExperienceGainer',
	init: function(template) {
		this._level = template['level'] || 1;
		this._experience = template['experience'] || 0;
		this._statPointsPerLevel = template['statPointsPerLevel'] || 1;
		this._statPoints = 0;
		//dtermine what stats can be leveled up
		this._statOptions = [];
		if (this.hasMixin('Attacker')) {
			this._statOptions.push(['Increase attack value', this.increaseAttackValue]);
		}
		if (this.hasMixin('Destructable')) {
			this._statOptions.push(['Increase defense value', this.increaseDefenseValue]);
			this._statOptions.push(['Increase max health', this.increaseMaxHp]);
		}
		if (this.hasMixin('Sight')) {
			this._statOptions.push(['Increase sight range', this.increaseSightRadius]);
		}
	},
	getLevel: function() {
		return this._level;
	},
	getExperience: function() {
		return this._experience;
	},
	getNextLevelExperience: function() {
		return (this._level * this._level) * 10;
	},
	getStatPoints: function() {
		return this._statPoints;
	},
	setStatPoints: function(statPoints) {
		this._statPoints = statPoints;
	},
	getStatOptions: function() {
		return this._statOptions;
	},
	giveExperience: function(points) {
		var statPointsGained = 0;
		var levelsGained = 0;
		//loop until we've allocated all points
		while (points > 0) {
			//check if adding in points wil surpass level 
			if (this._experience + points >= this.getNextLevelExperience()) {
				//fill our exp till next threshold
				var usedPoints = this.getNextLevelExperience() - this._experience;
				points -= usedPoints;
				this._experience += usedPoints;
				//level up entity!
				this._level++;
				levelsGained++;
				this._statPoints += this._statPointsPerLevel;
				statPointsGained += this._statPointsPerLevel;
			} else {
				//simple case -- give exp
				this._experience += points;
				points = 0;
			}
		}
		if (levelsGained > 0) {
			Game.sendMessage(this, 'Your skills have increased to level %d.', [this._level]);
			this.raiseEvent('onGainLevel');
		}
	},
	listeners: {
		onKill: function(victim) {
			var exp = victim.getMaxHp() + victim.getDefenseValue();
			if (victim.hasMixin('Attacker')) {
				exp += victim.getAttackValue();
			}
			//account for level difference
			if (victim.hasMixin('ExperienceGainer')) {
				exp -= (this.getLevel() - victim.getLevel()) * 3;
			}
			//only give exp if more than 0.
			if (exp > 0) {
				this.giveExperience(exp);
			}
		}
	}
};

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
		//if we can equip items, unequip item removing..
		if (this._items[i] && this.hasMixin(Game.EntityMixins.Equipper)) {
			this.unequip(this._items[i]);
		}
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
		this._maxFullness = template['maxFullness'] || 1000;
		//start halfway to max fullness 
		this._fullness = template['fullness'] || (this._maxFullness / 2);
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
			this.kill("You hunger for food unravels you connection to life.");
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
			//25% of max = hungry;
		} else if (this._fullness <= perPercent * 50) {
			return 'Hungry.'
		//95% of max = oversatiated
		} else if (this._fullness >= perPercent * 95) {
			return 'Stuffed. I couldn\'t eat a wafer.';
		//75% of max = full
		} else if (this._fullness >= perPercent * 75) {
			return 'Full';
		//Anything else = nothungy
		} else {
			return 'Not Hungry';
		}
	}
};

Game.EntityMixins.CorpseDropper = {
	name: 'CorpseDropper',
	init: function(template) {
		//chance of dropping a corpse
		this._corpseDropRate = template['corpseDropRate'] || 100;
	},
	listeners: {
		onDeath: function(attacker) {
			//check if corpse should drop
			if (Math.round(Math.random() * 100) <= this._corpseDropRate) {
				//create new corpse and drop that ish!
				this._map.addItem(this.getX(), this.getY(), this.getZ(),
					Game.ItemRepository.create('corpse', {
						name: this._name + ' corpse',
						foreground: this._foreground
					}));
			}
		}
	}
};

Game.EntityMixins.GiantZombieActor = Game.extend(Game.EntityMixins.TaskActor, {
	init: function(template) {
		//call the task actor init with the right tasks
		Game.EntityMixins.TaskActor.init.call(this, Game.extend(template, {
			'tasks' : ['growArm', 'spawnSlime', 'hunt', 'wander']
		}));
		//we only want to grow the arm once
		this._hasGrownArm = false;
	},
	canDoTask: function(task) {
		//if we haven't already grown arm, and HP <= 20, do it!
		if (task === 'growArm') {
			return this.getHp() <= 20 && !this._hasGrownArm;
		//spawn a slime only a 10% of turns
		} else if (task === 'spawnSlime') {
			return Math.round(Math.random() * 100) <= 10;
		//call parent canDotask
		} else {
			return Game.EntityMixins.TaskActor.canDoTask.call(this, task);
		}
	},
	growArm: function() {
		this._hasGrownArm = true;
		this.increaseAttackValue(5);
		//send message saying zombie grew arm
		Game.sendMessageNearby(this.getMap(),
			this.getX(), this.getY(), this.getZ(),
			'The zombie mutates, spawning an extra head.');
	},
	spawnSlime: function() {
		//generate random position nearby
		var xOffset = Math.floor(Math.random() * 3) - 1;
		var yOffset = Math.floor(Math.random() * 3) - 1;

		//check if we can spawn there.
		if (!this.getMap().isEmptyFloor(this.getX() + xOffset,
																		this.getY() + yOffset,
																		this.getZ())) {
			//if we can't do nothing
			return;
		}
		//create the entity
		var slime = Game.EntityRepository.create('slime');
		slime.setX(this.getX() + xOffset);
		slime.setY(this.getY() + yOffset);
		slime.setZ(this.getZ());
		this.getMap().addEntity(slime);
	},
	listeners: {
		onDeath: function(attacker) {
			//switch to win screen when killed!
			Game.switchScreen(Game.Screen.winScreen);
		}
	}
});

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

Game.EntityMixins.Equipper = {
	name: 'Equipper',
	init: function(template) {
		this._weapon = null;
		this._armor = null;
	},
	wield: function(item) {
		this._weapon = item;
	},
	unwield: function() {
		this._weapon = null;
	},
	wear: function(item) {
		this._armor = item;
	},
	takeOff: function() {
		this._armor = item;
	},
	getWeapon: function() {
		return this._weapon;
	},
	getArmor: function() {
		return this._armor;
	},
	unequip: function(item) {
		//helper function before getting rid of item
		if (this._weapon == item) {
			this.unwield();
		}
		if (this._armor === item) {
			this.takeOff();
		}
	}
};

Game.EntityMixins.RandomStatGainer = {
	name: 'RandomStatGainer',
	groupName: 'StatGainer',
	listeners: {
		onGainLevel: function(){
			var statOptions = this.getStatOptions();

			//randomly select stat and execute callback for each point
			while (this.getStatPoints() > 0) {
				//call stat increase function with this context
				statOptions.random()[1].call(this);
				this.setStatPoints(this.getStatPoints() - 1);
			}
		}
	}
};

Game.EntityMixins.PlayerStatGainer = {
	name: 'PlayerStatGainer',
	groupName: 'StatGainer',
	listeners: {
		onGainLevel: function() {
			//setup gain stat screen and show
			Game.Screen.gainStatScreen.setup(this);
			Game.Screen.playScreen.setSubScreen(Game.Screen.gainStatScreen);
		}
	}
};