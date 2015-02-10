Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.ItemRepository.define('apple', {
	name: 'apple',
	character: 'a',
	foreground: 'red',
	foodValue: 50,
	mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('melon', {
	name: 'melon',
	character: 'o',
	foreground: 'orange',
	foodValue: 35,
	consumptions: 4,
	mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('rock', {
	name: 'rock',
	character: '*',
	foreground: 'white'
});

Game.ItemRepository.define('corpse', {
	name: 'corpse',
	character: '&',
	foodValue: 75,
	consumptions: 1,
	mixins: [Game.ItemMixins.Edible]
}, {
	disableRandomCreation: true
});