Game.DynamicGlyph = function(properties) {
	properties = properties || {};
	// call the glyph's constructor with our set of properties
	Game.Glyph.call(this, properties);
	//instantiate any properties form the passed object
	this._name = properties['name'] || '';
	//Create an object to keep track of mixins attached to entity
	//based on name property
	this._attachedMixins = {};
	//create a similar object for groups
	this._attachedMixinGroups = {};
	//set up object for listeners
	this._listeners = {};
	
	//set up object mixins
	var mixins = properties['mixins'] || [];
	for (var i = 0; i < mixins.length; i++) {
		//copy properties of mixins except init, don't override
		for (var key in mixins[i]) {
			if (key != 'init' && key != 'name' && key != 'listeners'
				&& !this.hasOwnProperty(key)) {
				this[key] = mixins[i][key];
			}
		}
		//add the name of mixin to our attched mixins
		this._attachedMixins[mixins[i].name] = true;
		//if a group name is present, add it
		if (mixins[i].groupName) {
			this._attachedMixinGroups[mixins[i].groupName] = true;
		}	
		//add listeners
		if (mixins[i].listeners) {
			for (var key in mixins[i].listeners) {
				//add, if we don't already have a key for this event in listeners
				if (!this._listeners[key]) {
					this._listeners[key] = [];
				}
				//add listener
				this._listeners[key].push(mixins[i].listeners[key]);
			}
		}
		//if call the init function if there is one
		if (mixins[i].init) {
			mixins[i].init.call(this, properties);
		}
	}
};
//Make dynampic glyphs inherit all the functionality from glyphs
Game.DynamicGlyph.extend(Game.Glyph);

Game.DynamicGlyph.prototype.hasMixin = function(obj) {
	//allow passing the mixin itself or the name / group name as a string
	
	if (typeof obj === 'object') {
		return this._attachedMixins[obj.name];
	} else {
		return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
	}
};

Game.DynamicGlyph.prototype.raiseEvent = function(event) {
	//make sure we have at least one listener
	if (!this._listeners[event]) {
		return;
	}
	//extract any argument passed, removing the event name
	var args = Array.prototype.slice.call(arguments, 1)
	//involke each listener, with this entity as context and args
	for (var i = 0; i < this._listeners[event].length; i++) {
		this._listeners[event][i].apply(this, args);
	}
};

Game.DynamicGlyph.prototype.setName = function(name) {
	this._name = name;
};

Game.DynamicGlyph.prototype.getName = function() {
	return this._name;
};

Game.DynamicGlyph.prototype.describe = function() {
	return this._name;
};

Game.DynamicGlyph.prototype.describeA = function(capitalize) {
	//optional param to capitalize a/an
	var prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
	var string = this.describe();
	var firstLetter = string.charAt(0).toLowerCase();
	//if word starts by a vowel use an else a
	var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;

	return prefixes[prefix] + ' ' + string;
};

Game.DynamicGlyph.prototype.describeThe = function(capitalize) {
	var prefix = capitalize ? 'The' : 'the';
	return prefix + ' ' + this.describe();
};