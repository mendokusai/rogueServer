//repo has a name and a constructor.
//constructor is used to create items in repo
Game.Repository = function(name, ctor) {
	this._name = name;
	this._templates = {};
	this._ctor = ctor;
};

//define a new named _templates
Game.Repository.prototype.define = function(name, template) {
	this._templates[name] = template;
};

//define new named template
Game.Repository.prototype.create = function(name) {
	//make sure template has name
	var template = this._templates[name];

	if (!template) {
		throw new Error ('No template named"' + name + '" in repository "' +
				this._name + '"');
	}
	//create object, using template
	return new this._ctor(template);
};

Game.Repository.prototype.createRandom = function() {
	//pick random key and create object
	return this.create(Object.keys(this._templates).random());
};