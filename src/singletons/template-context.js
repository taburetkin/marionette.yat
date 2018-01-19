import _ from 'underscore';
import cid from '../functions/common/cid';
let templateContextStore = [(view) => {
	return {
		_v: view,
		_m: view.model || {},
		_cid: (arg) => cid.call(view, arg)
	}
}];
let compiledContext = {}; //rethink how it can be used
let hasChanges = false;

function normalizeValue(value, ...args){
	if(_.isFunction(value))
		return value(...args);
	else if(_.isObject(value))
		return value;
	else
		return {};
}

const GlobalTemplateContext = {
	mix(viewTemplateContext, ...args){
		let global = this.get(...args);
		return _.extend(global, viewTemplateContext);
	},
	get(...args){
		return this.compile(...args);
	},	
	add(...args){
		_(args).each((item) => this.push(item));
	},

	compile(...args){ 

		if(hasChanges)
			compiledContext = {};

		let newcontext = {};

		_(templateContextStore).each((cntx) => {
			if(_.isFunction(cntx))
				_.extend(newcontext, normalizeValue(cntx, ...args));
			else if(hasChanges){
				_.extend(compiledContext, cntx);
			}
		});
		if(!hasChanges)
			_.extend(newcontext, compiledContext);
		
		hasChanges = false;
		return newcontext;
	},
	pop(){
		hasChanges = true;
		return templateContextStore.pop();
	},
	shift(){
		hasChanges = true;
		return templateContextStore.shift();
	},
	push(item){ 
		hasChanges = true;
		templateContextStore.push(item); 
	},
	unshift(item){
		hasChanges = true;
		templateContextStore.unshift(item);
	},
	clear(){
		hasChanges = false;
		compiledContext = {};
		templateContextStore = [];
	},
}

export default GlobalTemplateContext;
