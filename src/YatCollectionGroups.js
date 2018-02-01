import _ from 'underscore';
import YatObject from './YatObject';
import Collection from './models/collection';

var CollectionGroups = YatObject.extend({

	collection: undefined,
	groupBy: undefined,

	getGroups(){ return this.groups; },
	getGroup(name){
		let groups = this.getGroups();
		return groups[name];
	},
	isGroupExists(name){ return name in this.getGroups(); },
	addGroup(name, models) {
		if(this.isGroupExists(name)) return;
		let groups = this.getGroups();
		groups[name] = this._createGroup(name, models);
		return groups[name];
	},
	removeGroup(name){
		let group = this.getGroup(name);
		
		if(!group) return;

		if(_.isFunction(group.destroy))
			group.destroy();
		else if(_.isFunction(group.stopListening))
			group.stopListening();

		delete this.groups[name];
	},	


	group() {
		let result = {};
		let colGroups = this.collection.groupBy(this.groupBy);
		let optionGroups = this.getOption('groups');
		_(optionGroups).each((name) => {
			if (name in colGroups){
				result[name] = colGroups[name];
				delete colGroups[name];
			}
			else result[name] = [];
		});
		_(colGroups).each((models, name) => result[name] = models);
		return result;
	},

	constructor: function(options) {
		YatObject.apply(this, arguments);
		this._initializeGrouppedCollection(options);
	},
	_initializeGrouppedCollection(options) {
		if (this._initializedGC == true) return;

		options || {};
		this.mergeOptions(options, ['collection', 'groupBy']);
		this._ensureOptions();
		this._initializeGroups();
		this._initializeEventHandlers();

		this._initializedGC == true
	},
	_ensureOptions() {
		if (!this.collection)
			throw new Error('collection must be set');

		if (!this.groupBy)
			throw new Error('groupBy must be set');

		if (typeof this.groupBy === 'string') {
			var propertyName = this.getOption('groupBy');
			this.groupBy = (model) => model.get(propertyName);
		}

	},
	_initializeGroups() {
		this.groups = {};
		var groups = this.group();
		_(groups).each((models, name) => this.addGroup(name, models));
	},
	_createGroup(name,models){
		var groupBy = this.groupBy;
		var groupCol = new Collection(models);
		groupCol.on('change', (model) => {
			if (groupBy(model) !== name)
				groupCol.remove(model);
		});
		groupCol.name = name;
		return groupCol;
	},

	_initializeEventHandlers() {
		this.listenTo(this.collection, 'update', this._onCollectionUpdate);
		this.listenTo(this.collection, 'change', this._onModelChange);
	},
	_onCollectionUpdate(col, opts) {

		var toAdd = _(opts.changes.added).groupBy(this.groupBy);
		var toRemove = _(opts.changes.removed).groupBy(this.groupBy);

		var groups = this.groups;
		var addOutOfGroup = {};
		_(toAdd).each((models, groupName) => {
			if (groupName in groups)
				groups[groupName].add(models);
			else if(this.getOption('autoCreateNewGroups'))
				this.addGroup(groupName, models);
		});
		
		_(toRemove).each((models, groupName) => {
			if (groupName in groups)
				groups[groupName].remove(models);
		});
	},
	_onModelChange(model) {
		var groupName = this.groupBy(model);
		if (this.groups[groupName])
			this.groups[groupName].add(model);
		else {
			console.warn('model is out of groupping', model, groupName);
		}
	},
	destroy() {

		_(this.groups).each((group) => {
			group.stopListening();
			if (_.isFunction(group.destroy))
				group.destroy();
		});
		delete this.groups;

		if(_.isFunction(YatObject.prototype.destroy))
			YatObject.prototype.destroy.apply(this, arguments);


		if (_.isFunction(this.collection.destroy))
			this.collection.destroy();

		delete this.collection;

	}
});

export default CollectionGroups;
