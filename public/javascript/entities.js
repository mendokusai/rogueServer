

//Player Template
Game.PlayerTemplate = {
	character: "$",
	foreground: 'yellow',
	background: 'black',
	maxHp: 40,
	attackValue: 10,
	sightRadius: 7,
	inventorySlots: 22,
	mixins: [
			Game.EntityMixins.PlayerActor,
			Game.EntityMixins.Attacker, 
			Game.EntityMixins.Destructable,
			Game.EntityMixins.InventoryHolder,
			Game.EntityMixins.FoodConsumer,
			Game.EntityMixins.Sight, 
			Game.EntityMixins.MessageRecipient,
			Game.EntityMixins.Equipper
			]
};

//central entity repo
Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
	name: 'fungus',
	character: 'F',
	foreground: 'green',
	maxHp: 5,
	speed: 250,
	mixins: [
			Game.EntityMixins.FungusActor, 
			Game.EntityMixins.Destructable
			]
});

Game.EntityRepository.define('bat', {
	name: 'bat',
	character: 'B',
	foreground: 'brown',
	maxHp: 5,
	speed: 2000,
	attackValue: 4,
	mixins: [
			Game.EntityMixins.TaskActor,
			Game.EntityMixins.Attacker, 
			Game.EntityMixins.Destructable,
			Game.EntityMixins.CorpseDropper
			]
});

Game.EntityRepository.define('newt', {
	name: 'newt',
	character: '%',
	foreground: 'blue',
	maxHp: 3,
	attackValue: 2,
	mixins: [
			Game.EntityMixins.TaskActor,
			Game.EntityMixins.Attacker,
			Game.EntityMixins.Destructable,
			Game.EntityMixins.CorpseDropper
			]
});

Game.EntityRepository.define('kobold', {
	name: 'kobold',
	character: 'K',
	foreground: 'lightGreen',
	maxHp: 6,
	attackValue: 4,
	sightRadius: 5,
	tasks: ['hunt', 'wander'],
	mixins: [
			Game.EntityMixins.TaskActor,
			Game.EntityMixins.Sight,
			Game.EntityMixins.Attacker,
			Game.EntityMixins.Destructable,
			Game.EntityMixins.CorpseDropper
			]
});









