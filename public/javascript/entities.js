

//Player Template
Game.PlayerTemplate = {
	character: "$",
	foreground: 'yellow',
	background: 'black',
	maxHp: 40,
	attackValue: 10,
	sightRadius: 6,
	inventorySlots: 22,
	mixins: [
			Game.EntityMixins.PlayerActor,
			Game.EntityMixins.Attacker, 
			Game.EntityMixins.Destructable,
			Game.EntityMixins.InventoryHolder,
			Game.EntityMixins.FoodConsumer,
			Game.EntityMixins.Sight, 
			Game.EntityMixins.MessageRecipient,
			Game.EntityMixins.Equipper,
			Game.EntityMixins.ExperienceGainer,
			Game.EntityMixins.PlayerStatGainer
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
			Game.EntityMixins.Destructable,
			Game.EntityMixins.ExperienceGainer,
			Game.EntityMixins.RandomStatGainer
			]
});

Game.EntityRepository.define('fasterZombie', {
	name: 'fasterZombie',
	character: 'z',
	foreground: 'red',
	maxHp: 6,
	speed: 500,
	mixins: [
		Game.EntityMixins.TaskActor,
		Game.EntityMixins.Destructable,
		Game.EntityMixins.Attacker,
		Game.EntityMixins.CorpseDropper,
		Game.EntityMixins.RandomStatGainer,
		Game.EntityMixins.ExperienceGainer
		]
});

Game.EntityRepository.define('fastZombie', {
	name: 'fastZombie',
	character: 'z',
	foreground: 'yellow',
	maxHp: 6,
	speed: 1500,
	mixins: [
		Game.EntityMixins.TaskActor,
		Game.EntityMixins.Destructable,
		Game.EntityMixins.Attacker,
		Game.EntityMixins.CorpseDropper,
		Game.EntityMixins.RandomStatGainer,
		Game.EntityMixins.ExperienceGainer
		]
});

Game.EntityRepository.define('zombie', {
	name: 'zombie',
	character: 'z',
	foreground: 'pink',
	maxHp: 5,
	speed: 250,
	mixins: [
		Game.EntityMixins.TaskActor,
		Game.EntityMixins.Destructable,
		Game.EntityMixins.Attacker,
		Game.EntityMixins.CorpseDropper,
		Game.EntityMixins.RandomStatGainer,
		Game.EntityMixins.ExperienceGainer
		]
})

Game.EntityRepository.define('bat', {
	name: 'bat',
	character: '~',
	foreground: 'brown',
	maxHp: 5,
	speed: 2000,
	attackValue: 4,
	mixins: [
			Game.EntityMixins.TaskActor,
			Game.EntityMixins.Attacker, 
			Game.EntityMixins.Destructable,
			Game.EntityMixins.CorpseDropper,
			Game.EntityMixins.ExperienceGainer,
			Game.EntityMixins.RandomStatGainer
			]
});

Game.EntityRepository.define('newt', {
	name: 'newt',
	character: '±',
	foreground: 'blue',
	maxHp: 3,
	attackValue: 2,
	mixins: [
			Game.EntityMixins.TaskActor,
			Game.EntityMixins.Attacker,
			Game.EntityMixins.Destructable,
			Game.EntityMixins.CorpseDropper,
			Game.EntityMixins.ExperienceGainer,
			Game.EntityMixins.RandomStatGainer
			]
});

Game.EntityRepository.define('kobold', {
	name: 'Angry Zombie',
	character: 'z',
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
			Game.EntityMixins.CorpseDropper,
			Game.EntityMixins.ExperienceGainer,
			Game.EntityMixins.RandomStatGainer
			]
});

Game.EntityRepository.define('giant zombie', {
	name: 'giant zombie',
	character: 'Ж',
	foreground: 'teal',
	maxHp: 30,
	attackValue: 10,
	defenseValue: 5,
	level: 5,
	sightRadius: 6,
	mixins: [
				Game.EntityMixins.GiantZombieActor,
				Game.EntityMixins.Sight,
				Game.EntityMixins.Attacker,
				Game.EntityMixins.Destructable,
				Game.EntityMixins.CorpseDropper,
				Game.EntityMixins.ExperienceGainer
				]
}, {
	disableRandomCreation: true
});

Game.EntityRepository.define('slime', {
	name: 'slime', 
	character: 'ů',
	foreground: 'lightGreen',
	maxHp: 10,
	attackValue: 5,
	sightRadius: 3,
	tasks: ['hunt', 'wander'],
	mixins: [
				Game.EntityMixins.TaskActor,
				Game.EntityMixins.Sight,
				Game.EntityMixins.Attacker,
				Game.EntityMixins.Destructable,
				Game.EntityMixins.CorpseDropper,
				Game.EntityMixins.ExperienceGainer,
				Game.EntityMixins.RandomStatGainer
				]
});








