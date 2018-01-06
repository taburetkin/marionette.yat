import _ from 'underscore'
import {extend} from 'backbone.marionette';


// function staticWith(...args)
// {
// 	let Base = this;
// 	//delete Base.with;

// 	_(args).each((arg) => {
// 		if(_.isObject(arg))
// 			Base = Base.extend(arg);
// 		else if(_.isFunction(arg))
// 			Base = arg(Base);
// 	});

// 	return Base;
// }

function smartExtend(Src, Dst){
	if(_.isFunction(Dst)){
		return Dst(Src);
	}
	else if(_.isObject(Dst)){
		return Src.extend(Dst);
	}
}


function mix(BaseClass){

	
	let Mixed = BaseClass;
	if(!Mixed.extend) {
		Mixed = extend.call(BaseClass, {});
		Mixed.extend = extend;
	}

	let fake = {
		with: (...args) => _.reduce(args, (memo, arg) => smartExtend(memo, arg), Mixed)
		// {
		// 	let src = Mixed;
		// 	_(args).each(function(dst, i){
		// 		src = smartExtend(src, dst);
		// 	});
		// 	return src;
		// },
	}
	return fake;
}


export default mix;
