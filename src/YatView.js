import _ from 'underscore';
import $ from 'underscore';
import Mn from 'backbone.marionette';
import Bb from 'backbone';
import mix from './helpers/mix';
import GlobalTemplateContext from './mixins/global-template-context';
import GetOptionProperty from './mixins/get-option-property';
import Region from './YatRegion';
import ViewStateApi from './helpers/view-state-api';

export default mix(Mn.View).with(GlobalTemplateContext, GetOptionProperty).extend({
	
	instantRender: false,
	renderOnReady: false,

	constructor(...args){
		Mn.View.apply(this, args);

		this._fixRegionProperty();
		
		let options = args[0];
		this.mergeOptions(options, ['instantRender','renderOnReady', 'triggerReady', 'manualAfterInitialize']);

		if(this.renderOnReady === true)
			this.once('ready',this.render);
		if(this.instantRender === true && !this.renderOnReady)
			this.render();
		else if(this.instantRender === true && this.renderOnReady === true)
			this.triggerReady();

	},
	_fixRegionProperty(options = {}){
		let detachable = this.getOption('detachableRegion');
		let stateApi = this.getOption('stateApi');
		let ViewRegion = stateApi ? Region.extend({ stateApi }) : Region;
		this.regionClass = detachable ? ViewRegion.Detachable() : ViewRegion;
	},
	triggerReady(){
		this.trigger('ready', this);
	},
	stateApi(){
		let options = this.getOption('stateApiOptions');
		return new ViewStateApi(options);
	},
	stateApiOptions(){
		return { states:['scrollable'] };
	}
});
