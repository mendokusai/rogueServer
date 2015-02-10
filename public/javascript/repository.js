//repo has a name and a constructor.
//constructor is used to create items in repo
Game.Repository = function(name, ctor) {
	this._name = name;
	this._templates = {};
	this._ctor = ctor;
	this._randomTemplates = {};
};

//define a new named _templates
Game.Repository.prototype.define = function(name, template, options) {
	this._templates[name] = template;
	//apply any options
	var disableRandomCreation = options && options['disableRandomCreation'];
	if (!disableRandomCreation) {
		this._randomTemplates[name] = template;
	}
};

//define new named template
Game.Repository.prototype.create = function(name, extraProperties) {
	if (!this._templates[name]) {
		throw new Error('No template name "' + name + '" in repository "' + this._name + '"');
	}
	//copy template
	var template = Object.create(this._templates[name]);

	//apply extra properties
	if (extraProperties) {
		for (var key in extraProperties) {
			template[key] = extraProperties[key];
		}
	}
	//create object, using template
	return new this._ctor(template);
};

Game.Repository.prototype.createRandom = function() {
	//pick random key and create object
	return this.create(Object.keys(this._randomTemplates).random());
};