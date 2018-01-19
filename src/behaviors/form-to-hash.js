import _ from 'underscore';
import Mn from 'backbone.marionette';
import Behavior from './behavior';
import mix from '../helpers/mix';
import Stateable from '../mixins/stateable';
import flattenObject from '../functions/common/flatten-unflatten/flatten-object';
import unFlattenObject from '../functions/common/flatten-unflatten/unflatten-object';

export default mix(Behavior).with(Stateable).extend({
	applyDelay: 1, //in ms
	autoApplyToModel: false, //finalize
	autoChangeModel: false, //on every change
	
	fillFormFromModel: true,

	applySelector: '.apply',
	cancelSelector: '.cancel',
	resetSelector: '.reset',

	initialize(opts){

		this.applyValue = _.debounce(this._applyValue, this.getProperty('applyDelay'));
		this.mergeOptions(opts,['values']);

		this.extendDefaultValues({});

	},

	extendDefaultValues(hash){

		this._values = _.extend(this._values || {}, hash);

	},	

	onViewInitialize(){

		//this.extendDefaultValues(this.getProperty('values'));

		let model = this.getModel();
		if(model){
			this.extendDefaultValues(model.toJSON());
		}
	},

	onRender(){

		if(!this.firstRender){
			this.buildFormBindings();
			this.setState(this._tryFlatValues(this._values));
			this.setValuesToForm(this.getValues({raw:true}));			
		}
		this.firstRender = true;
	},


	//finallizing
	triggers(){
		return {
			['click ' + this.getProperty('applySelector')]:'trigger:apply',
			['click ' + this.getProperty('cancelSelector')]:'trigger:cancel',
			['click ' + this.getProperty('resetSelector')]:'trigger:reset',
		}
	},

	_tryFlatValues(raw){
		return flattenObject(raw);
	},
	_tryUnFlatValues(raw){
		return unFlattenObject(raw);
	},
	rollbackToDefaultValues(){
		this.clearState();
		let rawvalues = this._values;
		let values = this._tryFlatValues(rawvalues);
		this.setState(values);
	},
	getValues(options = {}){
		let raw = this.getState();
		if(options.raw) return raw;
		let values = this._tryUnFlatValues(raw);
		return values;
	},
	onTriggerApply(){ this._apply(); },
	onTriggerCancel(){ this._cancel(); },
	onTriggerReset(){ this._reset(); },
	_apply(){
		let values = this.getValues();
		this.view.triggerMethod('values:apply', values);
		this._tryChangeModel(values);
	},
	_cancel(){
		this.rollbackToDefaultValues();
		let values = this._getFullHash(this._values);
		this.view.triggerMethod('values:cancel', values);

		this.setValuesToForm(values);
		this._tryChangeModel(values, {clear: true});
	},
	_reset(){
		this.clearState();
		let values = this._getFullHash({});
		this.view.triggerMethod('values:reset', values);

		this.setValuesToForm(values);
		this._tryChangeModel(values, {clear: true});
	},
	onState(state){
		this._tryChangeModel(state, {type:'property'})
	},
	_tryChangeModel(hash, options = {}){
		let canChangeProp = options.type === 'property' ? 'autoChangeModel' : 'autoApplyToModel';
		let canChange = this.getProperty(canChangeProp) === true;

		if(!canChange) return;
		let model = this.getModel();
		if(!model) return;

		hash = this._tryUnFlatValues(hash);
		if(options.clear === true)
			model.clear();
		model.set(hash);

	},
	_getFullHash(values = {}){
		let modelHash = this.getModel() && this.getModel().toJSON();
		let full = _.extend({}, this.values, this.mappings, modelHash);
		let res = {};
		_(full).each((v,key) => res[key] = undefined);
		return _.extend(res, values);
	},


	//dom manipulations
	buildFormBindings(){
		this.mappings = {};
		let tags = ["input","textarea","select"];
		this.$("[name]").each((i, el) => {
			if(tags.indexOf(el.tagName.toLowerCase()) == -1) return;

			let property = this.unCidle(el.name);
			if(property in this.mappings) return;

			let info = this._getElementInfo(el, tags);
			if(info)
				this.mappings[property] = info;
		});
		let ext = {};
		_(this.mappings).each((context, name) => { context.values && (ext[name] = context.values); });

		this.extendDefaultValues(ext);
	},
	_getElementInfo(el, tags){
		let context = {
			name: el.name
		};
		let values;
		let selector = `[name="${el.name}"]`;
		let $found = this.$(selector);
		if(!$found.length) return;

		if($found.length > 1){
			let foundValues = [];
			let isArray = false;
			$found.each((i, found) => {
				if(tags.indexOf(found.tagName.toLowerCase()) == -1) return;
				let $el = $(found);
				if((found.type != 'checkbox' && found.type != 'radio') || $el.prop('checked')){
					let val = $el.val();
					isArray || (isArray = found.type === 'checkbox' || val instanceof Array);
					if(val instanceof Array)
						foundValues = foundValues.concat(val);
					else
						foundValues.push($el.val());
				}
			});
			values = (!foundValues.length || (foundValues.length === 1 && !isArray)) 
					? foundValues[0]
					: foundValues;
		} else {
			values = $found.get(0).type === 'checkbox' 
						? ($found.prop('checked') ? [$found.val()] : [])
						: $found.val();				
		}
		context.values = values;
		context.isArray = values instanceof Array;
		context.$elements = $found;
		return context;
	},
	setValuesToForm(values, options = {}){

		_(values).each((propertyValues, propertyName) => {
			let property = this.mappings[propertyName];
			let $els = property.$elements;
			let arr = propertyValues instanceof Array ? propertyValues : [propertyValues];
			$els.each((i, el) => {

				this._setValueToElement(el, i, arr);
			});
		});
	},
	_setValueToElement(el, index, values){
		let value = index < values.length && values[index];
		let $el = el.jquery ? el : $(el);
		el = $el.get(0);
		if(el.type === 'checkbox' || el.type === 'radio'){
			$el.prop('checked', values.indexOf($el.val()) >= 0);
		}else{
			$el.val(value);
		}
	},

	// dom listeners
	events:{
		'change':'domChange',
		'input':'domInput'
	},	
	domChange(e) {
		this.applyValue(e.target.name, e.target, e);
	},
	domInput(e) {
		this.applyValue(e.target.name, e.target, e);
	},
	_applyValue(name, el, event){
		if(el.type == 'checkbox')
			this._applyCheckboxValue(name, el, event);
		else
			this._applySimpleValue(name, el, event);
	},
	_applySimpleValue(name,el,event){
		name = this.unCidle(name);
		let $el = $(el);
		this.setState(name, $el.val());
	},
	_applyCheckboxValue(name, el, event){
		let selector = `input[type=checkbox][name="${name}"]:checked`;
		let values = this.$(selector).map((i, el) => el.value).toArray();
		name = this.unCidle(name);
		this.setState(name, values);
	},	

});
