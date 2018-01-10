import _ from 'underscore'
import Mn from 'backbone.marionette';

function smartExtend(Src, Dst){
	if(_.isFunction(Dst)){
		return Dst(Src);
	}
	else if(_.isObject(Dst)){
		return Src.extend(Dst);
	}
	else throw new YatError('Mixin fail, argument should be an object hash or mixin function')
}

function mix(BaseClass){
	let Mixed = null;
	if(_.isFunction(BaseClass) && _.isFunction(BaseClass.constructor))
		Mixed = BaseClass;
	else if(_.isObject(BaseClass) && BaseClass !== null){
		let tmp = function(){};
		tmp.extend = Mn.extend;
		Mixed = tmp.extend(BaseClass);
	}
	if(!Mixed.extend) {
		Mixed = extend.call(BaseClass, {});
		Mixed.extend = Mn.extend;
	}
	let fake = {
		with: (...args) => _.reduce(args, (memo, arg) => smartExtend(memo, arg), Mixed)
	}
	return fake;
}

export default mix;
