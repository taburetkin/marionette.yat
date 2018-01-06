import mixin from './helpers/mix';
import YatObject from './YatObject';
import Stateable from './mixins/stateable';
import YatError from './YatError';

let BaseEngine = mixin(YatObject).with(Stateable).extend({

});


function throwOnRadioError(options)
{
	if(!options.channel && !options.channelName)
		throw new YatError('cnannel or channelName missing');

}

function throwIfNotInitialized()
{
	if(!main)
		throw new YatError(`modal engine are not initialized`);
}

function initializeIfNot()
{
	if(!main) main = new Engine();
}


const Engine = BaseEngine.extend({
	constructor(options){

		throwOnRadioError(options);
		BaseEngine.apply(arguments);

		let channel = this.getChannel();

		this.modals = [];
	}
});

const main = null;

const modalEngine = {
	initialize(options = {channelName: 'modals', useBootstrapTemplates: true}){
		if(main != null)
			throw new YatError("modal engine already initialized");
		main = new Engine(options);
	},
	destroy(){
		throwIfNotInitialized();

		main.destroy();
		main = null;
	},
	modal(view, options = {}){
		initializeIfNot();

		return main.radioRequest('modal', view, options);
	},
	confirm(view, options = {}){
		initializeIfNot();

		return main.radioRequest('confirm', view, options);
	}
};

export default modalEngine;
