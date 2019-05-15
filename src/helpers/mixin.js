import _ from 'underscore';

function mixWithObject(ClassDefinition, mixin){
	let MixedClass = class extends ClassDefinition{
		constructor(...args){
			super(...args);
		}
	};
	_.extend(MixedClass.prototype, mixin);
	return MixedClass;
}

function mixWithOne(ClassDefinition, mixin)
{
	if(typeof mixin === 'function')
		return mixin(ClassDefinition);
	else if(typeof mixin === 'object')
		return mixWithObject(ClassDefinition, mixin);
	else
		return ClassDefinition;
}


function mixWith(...mixins){
	
	let MixedClass = this;

	if(!mixins || !mixins.length) return this;


	while(mixins.length){
		let mixin = mixins.shift();
		MixedClass = mixWithOne(MixedClass, mixin);
	}

	delete this.with;

	return MixedClass;
}

function mixin(Base){
	return class extends Base {
		constructor(...args){
			super(...args);
		}
		static with(...mixins){
			return mixWith.apply(this, mixins);
		} 
	};
}



export default mixin;
