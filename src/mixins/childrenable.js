import _ from 'underscore';

const CHILDREN_FIELD = '_children';

export default (Base) => {
	class Mixin extends Base {
		constructor(...args) {
			super(...args);
			this.initializeChildrenable(...args);
		}
		initializeChildrenable(options = {}){
			this._initializeParrent(options);
			this._initializeChildren(options);
		}

		hasChildren(){
			let children = this.getChildren();
			return this[CHILDREN_FIELD].length > 0;
		}
		getChildren(){
			return this[CHILDREN_FIELD] || [];
		}
		hasParent(){
			let parent = this.getParent();
			return _.isObject(parent);
		}
		getParent(){
			return this.getProperty('parent', {deep:false});
		}

		_initializeChildren(){
			let _children = this.getProperty('children');
			this[CHILDREN_FIELD] = _(_children).map((child) => {

				let childContext = this._normalizeChildContext(child);
				if(childContext == null || !_.isFunction(childContext.Child)) return;
				
				let opts = _.extend({}, childContext);
				if(this.getOption('passToChildren') === true){
					_.extend(opts, this.options);
				}
				opts.parent = this;
					
				delete opts.Child;

				return new childContext.Child(opts);

			}).filter((f) => f != null);
		}
		_normalizeChildContext(child){
			let childOptions = this.getChildOptions();
			let childContext = {};

			if(_.isFunction(child) && child.Childrenable){
				_.extend(childContext, { Child: child }, childOptions);
			}else if(_.isFunction(child)){
				childContext = this._normalizeChildContext(child.call(this));
			}
			else if(_.isObject(child)){
				childContext = child;
			}

			return childContext;
		}
		getChildOptions(){
			let opts = this.getProperty('childOptions');
			return opts;
		}
		_initializeParrent(opts){
			if(this.parent == null && opts.parent != null)
				this.parent = opts.parent;
		}
	}

	Mixin.Childrenable = true;

	return Mixin;
}