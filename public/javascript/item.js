Game.Item = function(properties) {
	properties = properties || {};
	//call the glyph's constructor with our set
	Game.Glyph.call(this, properties);
	//instantiate properties from passed object
	this._name = properties['name'] || '';
};

Game.Item.extend(Game.Glyph);

Game.Item.prototype.describe = function() {
	return this._name;
};

Game.Item.prototype.describeA = function(capitalize) {
	//optional parameter to capitalize the a/an.
	var prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
	var string = this.describe();
	var firstLetter = string.charAt(0).toLowerCase();
	//if word stars with a vowel, use an, else a
	var prefix = 'aeious'.indexOf(firstLetter) >= 0 ? 1 : 0;

	return prefixes[prefix] + " " + string;
};