import _ from 'underscore'
import {extend} from 'backbone.marionette';

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
	let Mixed = BaseClass;
	if(!Mixed.extend) {
		Mixed = extend.call(BaseClass, {});
		Mixed.extend = extend;
	}
	let fake = {
		with: (...args) => _.reduce(args, (memo, arg) => smartExtend(memo, arg), Mixed)
	}
	return fake;
}

export default mix;
