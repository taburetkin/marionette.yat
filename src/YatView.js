import _ from 'underscore';
import Mn from 'backbone.marionette';
import mix from './helpers/mix';
import GlobalTemplateContext from './mixins/global-template-context';
import GetOptionProperty from './mixins/get-option-property';
export default mix(Mn.View).with(GlobalTemplateContext, GetOptionProperty).extend({
	
	instantRender: false,
	renderOnReady: false,
	triggerReady: false,

	manualAfterInitialize: true,

	constructor(...args){
		
		Mn.View.apply(this, args);
		
		let options = args[0];
		this.mergeOptions(options, ['instantRender','renderOnReady', 'triggerReady', 'manualAfterInitialize']);

		if(this.manualAfterInitialize === true)
			this._afterInitialize();

	},
	_afterInitialize(){

		if(this.instantRender === true)
			this.render();

		if(this.renderOnReady === true)
			this.once('ready',this.render);

		if(this.renderOnReady === true || this.triggerReady === true)
			this.trigger('ready', this);
			
	},
});
