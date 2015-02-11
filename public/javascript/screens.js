Game.Screen = {};

Game.Screen.startScreen = {
	enter: function() { console.log("Entered start screen");	},
	exit: function() { console.log("Exited start screen."); },
	render: function(display) {
		display.drawText(24,10, "%c{red}Javascript Roguelike Dungeon");
		display.drawText(20,12, "%c{yellow}Press [Enter] to start your descent!");
	},
	handleInput: function(inputType, inputData) {
		if (inputType === 'keydown') {
			//if enter is pressed go to playScreen
			if (inputData.keyCode === ROT.VK_RETURN) {
				
				Game.switchScreen(Game.Screen.playScreen);
			}
		}
	}
}
Game.Screen.playScreen = {
	_map: null,
	_player: null,
	_gameEnded: false,
	_subScreen: null,
	enter: function() {	

		var width = 100;
		var height = 48;
		var depth = 2;

		//greate map from tiles and player
		var tiles = new Game.Builder(width, height, depth).getTiles();
		
		//create player and set position
		this._player = new Game.Entity(Game.PlayerTemplate);
		
		var map = new Game.Map.Cave(tiles, this._player);

		//start map engine
		this._player.getMap().getEngine().start();

		
	},
	exit: function() { console.log("Exited play screen");	
	},
	render: function(display) {

		//render subscreen if there is one
		if (this._subScreen) {
			this._subScreen.render(display);
			return;
		}

		var screenWidth = Game.getScreenWidth();
		var screenHeight = Game.getScreenHeight();
		//x-axis doesn't go beyond left bound
		var topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
		topLeftX = Math.min(topLeftX, this._player.getMap().getWidth() - screenWidth);
		//y-axis doesn't go beyong top boundary
		var topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
		topLeftY = Math.min(topLeftY, this._player.getMap().getHeight() - screenHeight);
		
		var visibleCells = {};
		//store this._map and player z to remember it.
		var map = this._player.getMap();
		var currentDepth = this._player.getZ();
		//find visible cells and update object
		map.getFov(currentDepth).compute(
			this._player.getX(), this._player.getY(),
			this._player.getSightRadius(),
			function(x, y, radius, visibility) {
				visibleCells[x + "," + y] = true;
				//mark cell as explored
				map.setExplored(x, y, currentDepth, true);
			});

		//render explored map cells
		for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
			for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
				if (map.isExplored(x, y, currentDepth)) {
					//fetch glyph for tile and render it
					var glyph  = map.getTile(x, y, currentDepth);
					//color is dark gray is explored, but not visible
					var foreground = glyph.getForeground();
					if (visibleCells[x + ',' + y]) {
						var items = map.getItemsAt(x, y, currentDepth);
						//if we have items, we want to render top-most
						if (items) {
							glyph = items[items.length - 1];
						}
						//check if we have entity at position
						if (map.getEntityAt(x, y, currentDepth)) {
							glyph = map.getEntityAt(x, y, currentDepth);
						}
						//update foreground color in case glyph changed
						foreground = glyph.getForeground();
					} else {
						//change explored to dark grey
						foreground = 'darkgray';
					}	
						display.draw(
							x - topLeftX,
							y - topLeftY,
							glyph.getChar(),
							foreground,
							glyph.getBackground()
							);
				}
			}
		}

		//get messages in player's queue and render
		var messages = this._player.getMessages();
		var messageY = 0;
		for (var i = 0; i < messages.length; i++) {
			//render message, adding lines
			messageY += display.drawText(
				0,
				messageY,
				'%c{white}%b{black}' + messages[i]
				);
		}

		//render player HP
		var stats = "%c{white}%b{black}";
		stats += vsprintf('HP: %d/%d L: %d XP %d', 
			[this._player.getHp(), this._player.getMaxHp(),
			 this._player.getLevel(), this._player.getExperience()]);
		display.drawText(0, screenHeight, stats);

		//render entities
		var entities = this._player.getMap().getEntities();
		for (var key in entities) {
			var entity = entities[key];
			//only render entity if they show in screen
			if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
					entity.getX() < topLeftX + screenWidth &&
					entity.getY() < topLeftY + screenHeight &&
					entity.getZ() == this._player.getZ()) {
					if (visibleCells[entity.getX() + ',' + entity.getY()]) {
						display.draw(
						entity.getX() - topLeftX,
						entity.getY() - topLeftY,
						entity.getChar(),
						entity.getForeground(),
						entity.getBackground()
					);
				}
			}
		}

		//render hunger state
		var hungerState = this._player.getHungerState();
		display.drawText(screenWidth - hungerState.length, screenHeight, hungerState);

	},

	handleInput: function(inputType, inputData) {
		//if game is over, enter will trigger losing screen
		if (this._gameEnded) {
			if (inputType === 'keydown' && 
						inputData.keyCode === ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.loseScree);
			}
			//return to make sure user can't still play
			return;
		}
		//handle subscreen input if there is one
		if (this._subScreen) {
			this._subScreen.handleInput(inputType, inputData);
			return;
		}

		if (inputType === 'keydown') {
				//movement
				if (inputData.keyCode === ROT.VK_LEFT) {
					this.move(-1, 0, 0);
				} else if (inputData.keyCode === ROT.VK_RIGHT) {
					this.move(1, 0, 0);
				} else if (inputData.keyCode === ROT.VK_UP) {
					this.move(0, -1, 0);
				} else if (inputData.keyCode === ROT.VK_DOWN) {
					this.move(0, 1, 0);
				} else if (inputData.keyCode === ROT.VK_I) {
						//show inventory
						this.showItemsSubScreen(Game.Screen.inventoryScreen, this._player.getItems(),
							'You are not carrying anything.');
						return;
				} else if (inputData.keyCode === ROT.VK_D) {
						//show the drop screen
						this.showItemsSubScreen(Game.Screen.dropScreen, this._player.getItems(),
							'You have nothing to drop.');
						return;
				} else if (inputData.keyCode === ROT.VK_E) {
						//show drop screen
						this.showItemsSubScreen(Game.Screen.eatScreen, this._player.getItems(),
							'You have nothing to eat.');
						return;
				} else if (inputData.keyCode === ROT.VK_W) {
					if (inputData.shiftKey) {
						//show the wear screen
						this.showItemsSubScreen(Game.Screen.wearScreen, this._player.getItems(),
							'You have nothing to wear.');
					} else {
						//show wield screen
						this.showItemsSubScreen(Game.Screen.wieldScreen, this._player.getItems(),
							'You have nothing to wield.');
					}
					return;
				} else if (inputData.keyCode == ROT.VK_COMMA) {
						var items = this._player.getMap().getItemsAt(this._player.getX(),
																												 this._player.getY(), 
																												 this._player.getZ());
						//if there are no items, show a message
						if (items && items.length === 1) {
							var item = items[0];
							//if only one item, pick up that ish, playa!
							if (this._player.pickupItems([0])) {
								Game.sendMessage(this._player, "You pick up %s.", [item.describeA()]);
							} else {
								Game.sendMessage(this._player, "Your inventory is full. Nothing was picked up.")
							}	
						} else {
							this.showItemsSubScreen(Game.Screen.pickupScreen, items,
								"There is nothing here to pick up.");
						}	
				} else {
					//not a valid key
					return;
				}
				//unlock engine on move
				this._player.getMap().getEngine().unlock();
		} else if (inputType === 'keypress') {
			var keyChar = String.fromCharCode(inputData.charCode);
			if (keyChar === ">") {
				this.move(0,0,1);
			} else if (keyChar === '<') {
				this.move(0,0,-1);
			} else {
				//not a valid key
				return;
			}
			//unlock engine on move
			this._player.getMap().getEngine().unlock();			
		}

	},
	move: function(dX, dY, dZ) {
		var newX = this._player.getX() + dX;
		var newY = this._player.getY() + dY;
		var newZ = this._player.getZ() + dZ;
		//try to move to new cell

		this._player.tryMove(newX, newY, newZ, this._player.getMap());
	},
	setGameEnded: function(gameEnded) {
		this._gameEnded = gameEnded;
	},
	setSubScreen: function(subScreen) {
		this._subScreen = subScreen;
		//refresh screen on change to subscreen
		Game.refresh();
	},
	showItemsSubScreen: function(subScreen, items, emptyMessage) {
		if (items && subScreen.setup(this._player, items) > 0) {
			this.setSubScreen(subScreen);
		} else {
			Game.sendMessage(this._player, emptyMessage);
			Game.refresh();
		}
	}
};



Game.Screen.ItemListScreen = function(template) {
	//set up based on template
	this._caption = template['caption'];
	this._okFunction = template['ok'];
	//by default, we use the itentity function
	this._isAcceptableFunction = template['isAcceptable'] || function(x) {
		return x;
	}
	//whether user can select items
	this._canSelectItem = template['canSelect'];
	//whether the user can select multiple items
	this._canSelectMultipleItems = template['canSelectMultipleItems'];

	//whether a 'no item' option should appear
	this._hasNoItemOption = template['hasNoItemOption'];
};

Game.Screen.ItemListScreen.prototype.setup = function(player, items) {
	this._player = player;
	//call before switching screen
	var count = 0;
	var that = this;

	this._items = items.map(function(item) {
		//transform item to null if not acceptable
		if (that._isAcceptableFunction(item)) {
			count++;
			return item;
		} else {
			return null;
		}
	});
	//clean set of selected indices
	this._selectedIndices = {};
	return count;
};

Game.Screen.ItemListScreen.prototype.render = function(display) {
	var letters = 'abcdefghijklmnopqrstuvwxyz';
	//render the caption in top row
	display.drawText(0, 0, this._caption);
	if (this._hasNoItemOption) {
		display.drawText(0, 1, '0 - no item');
	}
	var row = 0; 
	for (var i = 0; i < this._items.length; i++) {
		//if we have an item, render
		if (this._items[i]) {
			//get the letter matching item's index
			var letter = letters.substring(i, i + 1);
			//for selected item, show a +, else a dash and item's name
			var selectionState = (this._canSelectItem && this._canSelectMultipleItems &&
				this._selectedIndices[i]) ? "+" : "-";
			var suffix = '';
			if (this._items[i] === this._player.getArmor()) {
				suffix = ' (wearing)';
			} else if (this._items[i] === this._player.getWeapon()) {
				suffix = ' (wielding)';
			}
			//render at correct row and add 2
			display.drawText(0, 2 + row, letter + ' ' + selectionState +
				' ' + this._items[i].describe());
			row++;
		}
	}
};

Game.Screen.ItemListScreen.prototype.executeOKFunction = function() {
	//gather selected items
	var selectedItems = {};
	for (var key in this._selectedIndices) {
		selectedItems[key] = this._items[key];
	}
	//switch back to play screen
	Game.Screen.playScreen.setSubScreen(undefined);
	//call okay functiona nd end the player's turn if return true
	if (this._okFunction(selectedItems)) {
		this._player.getMap().getEngine().unlock();
	}
};

Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
	if (inputType === 'keydown') {
		//if escape/ enter, && can't select item, cancel
		if (inputData.keyCode === ROT.VK_ESCAPE || 
			(inputData.keyCode === ROT.VK_RETURN &&
				(!this._canSelectItem || Object.keys(this._selectedIndices).length === 0))) {
			Game.Screen.playScreen.setSubScreen(undefined);
		//handle pressing return when items are selected
		} else if (inputData.keyCode === ROT.VK_RETURN) {
			this.executeOKFunction();
		} else if (this._canSelectItem && this._hasNoItemOption && inputData.keyCode === ROT.VK_0) {
			this._selectedIndices = {};
			this.executeOKFunction();
		// handle pressing a letter if we can select
		} else if (this._canSelectItem && inputData.keyCode >= ROT.VK_A && 
			inputData.keyCode <= ROT.VK_Z) {
			//check keydown maps to valid item by subtracting 'a'
			//check what letter of alpha used
			var index = inputData.keyCode - ROT.VK_A;
			if (this._items[index]) {
				//if multiple selection is allowed, toggle selection status
				//else select item and exit screen
				if (this._canSelectMultipleItems) {
					if (this._selectedIndices[index]) {
						delete this._selectedIndices[index];
					} else {
						this._selectedIndices[index] = true;
					}
					//redraw screen
					Game.refresh();
				} else {
					this._selectedIndices[index] = true;
					this.executeOKFunction();
				}
			}
		}
	}
};

Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
	caption: 'Inventory',
	canSelect: false
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
	caption: 'Choose item(s) to pickup',
	canSelect: true,
	canSelectMultipleItems: true,
	ok: function(selectedItems) {
		//pickup all items, message player if couldn't be picked up
		if (!this._player.pickupItems(object.keys(selectedItems))) {
			Game.sendMessage(this._player, 'Your inventory is full. Not all items were picked up.');
		}
		return true;
	}
});

Game.Screen.wieldScreen = new Game.Screen.ItemListScreen({
	caption: 'Choose the item you wish to wield.',
	canSelect: true,
	canSelectMultipleItems: false,
	hasNoItemsOption: true,
	isAcceptable: function(item) {
		return item && item.hasMixin('Equippable') && item.isWieldable();
	},
	ok: function(selectedItems) {
		//check if we selected no item'
		var keys = Object.keys(selectedItems);
		if (keys.length === 0) {
			this._player.unwield();
			Game.sendMessage(this._player, 'You are empty handed.')
		} else {
			//make sure to unequip item first if armor
			var item = selectedItems[keys[0]];
			this._player.unequip(item);
			this._player.wield(item);
			Game.sendMessage(this._player, 'You are wielding %s.', [item.describeA()]);
		}
		return true;
	}
});

Game.Screen.wearScreen = new Game.Screen.ItemListScreen({
	caption: 'Choose the item you wish to wear',
	canSelect: true,
	canSelectMultipleItems: false,
	hasNoItemsOption: true,
	isAcceptable: function(item) {
		return item && item.hasMixin('Equippable') && item.isWearable();
	},
	ok: function(selectedItems) {
		//check if we selected 'no item
		var keys = Object.keys(selectedItems);
		if (keys.length === 0) {
			this._player.unwield();
			Game.sendMessage(this._player, 'You are not wearing anything.')
		} else {
			//make sure to unequip item first if weapon
			var item = selectedItems[keys[0]];
			this._player.unequip(item);
			this._player.wear(item);
			Game.sendMessage(this._player, 'You are wearing %s.', [item.describeA()]);
		}
		return true;
	}
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
	caption: 'Choose the item you wish to drop',
	canSelect: true,
	canSelectMultipleItems: false,
	ok: function(selectedItems) {
		//drop item
		this._player.dropItem(Object.keys(selectedItems)[0]);
		return true;
	}
});

Game.Screen.eatScreen = new Game.Screen.ItemListScreen({
	caption: 'Choose an item to eat',
	canSelect: true,
	canSelectMultipleItems: false,
	isAcceptable: function(item) {
		console.log(item);
		return item && item.hasMixin('Edible');
	},
	ok: function(selectedItems) {
		//eat the item, removing if no parts left
		var key = Object.keys(selectedItems)[0];
		var item = selectedItems[key];
		Game.sendMessage(this._player, 'You eat %s.', [item.describeThe()]);
		item.eat(this._player);
		if (!item.hasRemainingConsumptions()) {
			this._player.removeItem(key);
		}
		return true;
	}

});

Game.Screen.winScreen = {
	enter: function() {	console.log("Entered win screen.");	},
	exit: function() { console.log("Exited win screen.");	},
	render: function(display) {
		for (var i = 0; i < 22; i++) {
			var r = Math.round(Math.random() * 255);
			var g = Math.round(Math.random() * 255);
			var b = Math.round(Math.random() * 255);
			var background = ROT.Color.toRGB([r, g, b]);
			display.drawText(2, i + 1, "%b{" + background + "}You Win!");
		}
	},
	handleInput: function(inputType, inputData) {
		///nothing to do here
	}
}

//define losing screen
Game.Screen.loseScreen = {
	enter: function() {	console.log("Entered lose screen."); },
	exit: function(){	console.log("Exited lose screen"); },
	render: function(display) {
		for (var i = 0; i < 22; i++) {
			var r = Math.round(Math.random() * 255);
			var g = Math.round(Math.random() * 255);
			var b = Math.round(Math.random() * 255);
			var background = ROT.Color.toRGB([r,g,b]);
			display.drawText(2, i+1, "%b{" + background + "}You Lose!");
		}
	},
	handleInput: function(inputType, inputData) {
		///nothing to do here
	}
}

Game.Screen.gainStatScreen = {
	setup: function(entity) {
		//must be called before rendering
		this._entity = entity;
		this._options = entity.getStatOptions();
	},
	render: function(display) {
		var letters = 'abcdefghijklmnopqrstuvwxyz';
		display.drawText(0, 0, 'Choose a stat to increase: ');
		//iterate through each of our options
		for (var i = 0; i < this._options.length; i++) {
			display.drawText(0, 2 + i,
				letters.substring(i, i + 1) + ' - ' + this._options[i][0]);
		}
		//render remaining stat points
		display.drawText(0, 4 + this._options.length,
			'Remaining points: ' + this._entity.getStatPoints());
	},
	handleInput: function(inputType, inputData) {
		if (inputType === 'keydown') {
			//if a letter was pressed, check if it matches valid option
			if (inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z) {
				//check if it maps to valid item by subtracting 'a' from character
				//to kow what letter of alphabet we used
				var index = inputData.keyCode - ROT.VK_A;
				if (this._options[index]) {
					//call the stat increasing function
					this._options[index][1].call(this._entity);
					//decrease stat points
					this._entity.setStatPoints(this._entity.getStatPoints() - 1);
					//if we have no stat points left, exit screen, else refresh
					if (this._entity.getStatPoints() == 0) {
						Game.Screen.playScreen.setSubScreen(undefined);
					} else {
						Game.refresh();
					}
				}
			}
		}
	}
};