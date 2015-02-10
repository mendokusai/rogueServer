Game.Screen = {};

Game.Screen.startScreen = {
	enter: function() { console.log("Entered start screen");	},
	exit: function() { console.log("Exited start screen."); },
	render: function(display) {
		display.drawText(1,1, "%c{red}Javascript Roguelike");
		display.drawText(1,2, "Press [Enter] to start your descent!");
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
		var depth = 6;

		//greate map from tiles and player
		var tiles = new Game.Builder(width, height, depth).getTiles();
		//create player and set position
		this._player = new Game.Entity(Game.PlayerTemplate);
		//create map from tiles and player
		this._map = new Game.Map(tiles, this._player);
		//start map engine
		this._map.getEngine().start();

		
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
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
		//y-axis doesn't go beyong top boundary
		var topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
		
		var visibleCells = {};
		//store this._map and player z to remember it.
		var map = this._map;
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
					var glyph  = this._map.getTile(x, y, currentDepth);
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
		stats += vsprintf('HP: %d/%d ', [this._player.getHp(), this._player.getMaxHp()]);
		display.drawText(0, screenHeight, stats);

		//render entities
		var entities = this._map.getEntities();
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
			if (inputData.keyCode === ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.winScreen);
			} else if (inputData.keyCode === ROT.VK_ESCAPE) {
				Game.switchScreen(Game.Screen.loseScreen);
			} else {
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
						if (this._player.getItems().filter(function(x) {return x;}).length === 0) {
						 //if player has no items, send message && no turn
						 Game.sendMessage(this._player, 'You are not carrying anything!');
						 Game.refresh();
						} else {
							//show inventory
							Game.Screen.inventoryScreen.setup(this._player, this._player.getItems());
							this.setSubScreen(Game.Screen.inventoryScreen);
						}
						return;
				} else if (inputData.keyCode === ROT.VK_D) {
						if (this._player.getItems().filter(function(x){return x;}).length === 0) {
							//if player has no items, send message and no turn
							Game.sendMessage(this._player, "You have nothing to drop.");
							Game.refresh();
						} else {
							//show the drop screen
							Game.Screen.dropScreen.setup(this._player, this._player.getItems());
							this.setSubScreen(Game.Screen.dropScreen);
						}
						return;
				} else if (inputData.keyCode == ROT.VK_COMMA) {
						var items = this._map.getItemsAt(this._player.getX(), 
																						 this._player.getY(), 
																						 this._player.getZ());
						//if there are no items, show a message
						if (!items) {
							Game.sendMessage(this._player, "There is nothing here to pick up.");
						} else if (items.length === 1) {
							//if only one item, pick up that ish, playa!
							var item = items[0];
							if (this._player.pickupItems([0])) {
								Game.sendMessage(this._player, "You pick up %s.", [item.describeA()]);
							} else {
								Game.sendMessage(this._player, "Your inventory is full. Nothing was picked up.");
							}
					} else {
							//show pickup screen if there are items
							Game.Screen.pickupScreen.setup(this._player, items);
							this.setSubScreen(Game.Screen.pickupScreen);
							return;
					}
				} else {
					//not a valid key
					return;
				}
				//unlock engine on move
				this._map.getEngine().unlock();
			}
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
			this._map.getEngine().unlock();			
		}

	},
	move: function(dX, dY, dZ) {
		var newX = this._player.getX() + dX;
		var newY = this._player.getY() + dY;
		var newZ = this._player.getZ() + dZ;
		//try to move to new cell

		this._player.tryMove(newX, newY, newZ, this._map);
	},
	setSubScreen: function(subScreen) {
		this._subScreen = subScreen;
		//refresh screen on change to subscreen
		Game.refresh();
	}
};

Game.Screen.ItemListScreen = function(template) {
	//set up based on template
	this._caption = template['caption'];
	this.okFunction = template['ok'];
	//whether user can select items
	this._canSelectItem = template['canSelect'];
	//whether user can select multiple items
	this._canSelectMultipleItems = template['_canSelectMultipleItems'];
};

Game.Screen.ItemListScreen.prototype.setup = function(player, items) {
	this._player = player;
	//call before switching screen
	this._items = items;
	//clean set of selected indices
	this._selectedIndices = {};
};

Game.Screen.ItemListScreen.prototype.render = function(display) {
	var letters = 'abcdefghijklmnopqrstuvwxyz';
	//render the caption in top row
	display.drawText(0, 0, this._caption);
	var row = 0; 
	for (var i = 0; i < this._items.length; i++) {
		//if we have an item, render
		if (this._items[i]) {
			//get the letter matching item's index
			var letter = letters.substring(i, i, + 1);
			//for selected item, show a +, else a dash and item's name
			var selectionState = (this._canSelectItem && this._canSelectMultipleItems &&
				this._selectedIndices[i]) ? "+" : "-";
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
		// handle pressing a letter if we can select
		} else if (this._canSelectItem && inputData.keyCode >= ROT.VK_A && 
			inputData.keycode <= ROT.VK_Z) {
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

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
	caption: 'Choose the item you wish to drop',
	canSeect: true,
	canSelectMultipleItems: false,
	ok: function(selectedItems) {
		//drop item
		this._player.dropItem(Object.keys(selectedItems)[0]);
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