Game.Item = function(properties) {
	properties = properties || {};
	//call the glyph's constructor with our set
	Game.Glyph.call(this, properties);
	//instantiate properties from passed object
	this._name = properties['name'] || '';
};

Game.Item.extend(Game.Glyph);

