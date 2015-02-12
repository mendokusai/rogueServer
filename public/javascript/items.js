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
	foreground: 'lightGreen',
	foodValue: 35,
	consumptions: 4,
	mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('pumpkin', {
	name: 'pumpkin',
	character: 'o',
	foreground: 'orange',
	foodValue: 50,
	attackValue: 2,
	defenseValue: 2,
	wearable: true,
	wieldable: true,
	mixins: [Game.ItemMixins.Edible, 
					 Game.ItemMixins.Equippable]
});

Game.ItemRepository.define('rock', {
	name: 'rock',
	character: '*',
	foreground: 'white',
    attackValue: 2,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable]
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


// Weapons
Game.ItemRepository.define('dagger', {
    name: 'dagger',
    character: 'í',
    foreground: 'gray',
    attackValue: 5,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('sword', {
    name: 'sword',
    character: 'ļ',
    foreground: 'white',
    attackValue: 10,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('staff', {
    name: 'staff',
    character: 'ԇ',
    foreground: 'yellow',
    attackValue: 5,
    defenseValue: 3,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

// Wearables
Game.ItemRepository.define('tunic', {
    name: 'tunic',
    character: 'ӿ',
    foreground: 'green',
    defenseValue: 2,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('chainmail', {
    name: 'chainmail',
    character: 'ѫ',
    foreground: 'white',
    defenseValue: 4,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('platemail', {
    name: 'platemail',
    character: 'ѫ',
    foreground: 'aliceblue',
    defenseValue: 6,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});