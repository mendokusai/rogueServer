Game.Map.Cave = function(tiles, player) {
	//call map constructor
	Game.Map.call(this, tiles);
	//Add player
	this.addEntityAtRandomPosition(player, 0);
	//all the zombies!
	for (var x = 0; x < this._depth; x++) {
		//40 per floor! 60$$!!
		for (var i = 0; i < 20; i++) {
			var zombies = Game.EntityRepository.create('zombie');
			this.addEntityAtRandomPosition(zombies, z);
			if (zombies.hasMixin('ExperienceGainer')) {
				for (var level = 0; level < x; level++) {
					zombies.giveExperience(zombies.getNextLevelExperience() - 
						zombies.getExperience());
				}
			}
		}
	}
	

	for (var x = 0; x < this._depth; x++) {
		//40 per floor! 60$$!!
		for (var i = 0; i < 20; i++) {
			var zombies2 = Game.EntityRepository.create('fasterZombie');
			this.addEntityAtRandomPosition(zombies, z);
			if (zombies2.hasMixin('ExperienceGainer')) {
				for (var level = 0; level < x; level++) {
					zombies2.giveExperience(zombies.getNextLevelExperience() - 
						zombies2.getExperience());
				}
			}
		}
	}

	for (var x = 0; x < this._depth; x++) {
		//40 per floor! 60$$!!
		for (var i = 0; i < 10; i++) {
			var zombies3 = Game.EntityRepository.create('fastZombie');
			this.addEntityAtRandomPosition(zombies, z);
			if (zombies3.hasMixin('ExperienceGainer')) {
				for (var level = 0; level < x; level++) {
					zombies3.giveExperience(zombies.getNextLevelExperience() - 
						zombies3.getExperience());
				}
			}
		}
	}

	//add random entites and items to each floor
	for (var z = 0; z < this._depth; z++) {
		//15 per floor
		for (var i = 0; i < 15; i++) {
			var entity = Game.EntityRepository.createRandom();
			//add random entity
			this.addEntityAtRandomPosition(entity, z);
			//level up entity based on floor
			if (entity.hasMixin('ExperienceGainer')) {
				for (var level = 0; level < z; level++) {
					entity.giveExperience(entity.getNextLevelExperience() - 
						entity.getExperience());
				}
			}
		}
		//15 items per floor
		for (var i = 0; i < 15; i++) {
			//add a random entity
			this.addItemAtRandomPosition(Game.ItemRepository.createRandom(), z);
		}
	}
	//Add weapons and armor to the map in random places
	var templates = ['dagger', 'sword', 'staff', 'tunic', 'chainmail', 'platemail'];
	for (var i = 0; i < templates.length; i++) {
		this.addItemAtRandomPosition(Game.ItemRepository.create(templates[i]),
		Math.floor(this._depth * Math.random()));
	}
	//Add a hole to the final cavern on last level.
	var holePosition = this.getRandomFloorPosition(this._depth - 1);
	this._tiles[this._depth - 1][holePosition.x][holePosition.y] =
	Game.Tile.holeToCavernTile;
};
Game.Map.Cave.extend(Game.Map);