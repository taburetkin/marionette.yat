import _ from 'underscore';

export default (Base) => {
	
	const CHILDREN_FIELD = '_children';

	let Mixin = Base.extend({
		constructor(...args) {
			Base.apply(this, args);
			this.initializeChildrenable(...args);
		},

		initializeChildrenable(options = {}){
			this._initializeParrent(options);
			this._initializeChildren(options);
		},

		hasChildren(){
			let children = this.getChildren();
			return this[CHILDREN_FIELD].length > 0;
		},

		getChildren(opts = {startable:true}){
			let all = this[CHILDREN_FIELD] || [];
			if(!opts.startable){
				return all;
			}else{
				return all.filter((c) => !c.getProperty('isStartNotAllowed'));
			}
		},

		hasParent(){
			let parent = this.getParent();
			return _.isObject(parent);
		},

		getParent(){
			return this.getProperty('parent', {deep:false});
		},

		_initializeChildren(){
			let _children = this.getProperty('children');
			let children = [];
			_(_children).each((child) => {

				let childContext = this._normalizeChildContext(child);
				let initialized = this._initializeChild(childContext);
				if(initialized) children.push(initialized);

			});
			this[CHILDREN_FIELD] = children;
		},
		_initializeChild(childContext)
		{
			if(childContext == null || !_.isFunction(childContext.Child)) return;

			let Child = childContext.Child;
			let opts = this._normalizeChildOptions(childContext);
			return this.buildChild(Child, opts);
		},

		_normalizeChildContext(child){
			let childContext = {};

			if(_.isFunction(child) && child.Childrenable){
				_.extend(childContext, { Child: child });
			}else if(_.isFunction(child)){
				childContext = this._normalizeChildContext(child.call(this));
			}
			else if(_.isObject(child)){
				childContext = child;
			}
			return childContext;
		},

		_normalizeChildOptions(options){
			let opts = _.extend({}, options);
			if(this.getOption('passToChildren') === true){
				_.extend(opts, this.options);
			}
			opts.parent = this;
			delete opts.Child;
			return this._buildChildOptions(opts);
		},

		_buildChildOptions: function(def){
			return _.extend(def, this.getProperty('childOptions'));
		},

		buildChild(ChildClass, options){
			return new ChildClass(options);
		},

		_initializeParrent(opts){
			if(this.parent == null && opts.parent != null)
				this.parent = opts.parent;
		},

	});

	Mixin.Childrenable = true;

	return Mixin;
}
