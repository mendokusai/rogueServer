Game.Map.Cave = function(tiles, player) {
	//call map constructor
	Game.Map.call(this, tiles);
	//Add player
	this.addEntityAtRandomPosition(player, 0);
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