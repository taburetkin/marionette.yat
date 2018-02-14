import _ from 'underscore';
import $ from 'jquery';
import Mn from 'backbone.marionette';
import Bb from 'backbone';


const Region = Mn.Region.extend({
	constructor:function(options){
		Mn.Region.apply(this, arguments);
		this.mergeOptions(optsion, ['stateApi']);
		this.stateApi && this._initStateApi();
	},
	_initStateApi(){
		this.off('show', this._onStatableShow);
		this.off('before:empty', this._onStatableBeforeEmpty);
		this.on('show', this._onStatableShow);
		this.on('before:empty', this._onStatableBeforeEmpty);
	},
	_onStatableShow(region, view){
		let api = this.stateApi && _.isFunction(this.stateApi.apply) ? this.stateApi : undefined;				
		api && api.apply(view, { region });
	},
	_onStatableBeforeEmpty(region, view){
		let api = this.stateApi && _.isFunction(this.stateApi.collect) ? this.stateApi : undefined;
		api && api.collect(view, { region });
	},
	setStateApi(api){
		this.stateApi = api;
		this._initStateApi();
	},
	removeView: function removeView(view) {
		let removeBehavior = this.getOption('removeBehavior') || 'destroy';
		if(removeBehavior === 'detach')
			this.detachView(view);
		else
			this.destroyView(view);
	},
	getParentView(){
		return this._parentView;
	}
});

Region.Detachable = function(opts = {}){
	let detachable = _.extend({}, opts, { removeBehavior:'detach' });
	return this.extend(detachable);
}

export default Region;

