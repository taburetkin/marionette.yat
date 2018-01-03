import _ from 'underscore';

const CHILDREN_FIELD = '_children';

export default (Base) => {
	class Mixin extends Base {
		constructor(...args) {
			super(...args);
			this.initializeChildrenable(...args);
		}
	

		//static get Childrenable() {return true;};

		initializeChildrenable(options = {}){
			this._initializeParrent(options);
			this._initializeChildren(options);
		}
		
		getName(){
			return this.getProperty('name') || this.cid;
		}
		getLabel(){
			return this.getProperty('label') || this.getName();
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
				
				let opts = _.extend({parent:this}, childContext);
				delete opts.Child;

				return new childContext.Child(opts);

			}).filter((f) => f != null);
		}
		_normalizeChildContext(child){
			if(_.isFunction(child) && child.Childrenable){
				return { Child: child };
			}else if(_.isFunction(child)){
				return this._normalizeChildContext(child.call(this));
			}
			else if(_.isObject(child))
				return child;
		}

		_initializeParrent(opts){
			if(this.parent == null && opts.parent != null)
				this.parent = opts.parent;
		}
	}

	Mixin.Childrenable = true;

	return Mixin;
}