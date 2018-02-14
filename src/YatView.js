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
		
		this._fixRegionProperty();

		Mn.View.apply(this, args);

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
		let detachable = this.getProperty('detachableRegion');
		if(detachable == null)
			detachable = options.detachableRegion === true;

		let stateApi = this.getProperty('stateApi');
		if(stateApi == null)
			stateApi = options.stateApi;

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
		let _this = this;
		return { 
			storeIdPrefix: function(){ return _this.getOption('id'); },
			states:['scrollable'] 
		};
	}
});
