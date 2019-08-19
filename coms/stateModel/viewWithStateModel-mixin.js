import _ from 'underscore';
import StateModel from './model';
//import wrapModel from './wrapModel';

function updateAttribute(model, key, $el) {
	let value = model.state(key);
	if (value === true) {
		$el.attr(key, key);
	} else if (value === false) {
		$el.removeAttr(key);
	} else {
		$el.attr(key, value);
	}
}

function updateCssClass(model, key, $el) {
	let value = model.state(key);
	if (value === true) {
		$el.addClass(key);
	} else if (value === false) {
		$el.removeClass(key);
	} else {
		$el.removeClass(model.prevState(key));
		$el.addClass(value);
	}
}

function createHandlerContext(context, state, model, property, arg) {
	//let stateHandler;

	let cntx = {};
	if (arg === true) {
		cntx.property = property;
		cntx.getValue = () => model.get(property);
		cntx.handler = () => state.state(property, model.get(property));
		//stateHandler = () => state.state(property, model.get(property));
	} else if (_.isString(arg)) {
		cntx.property = arg;
		cntx.getValue = () => model.get(property);
		cntx.handler = () => state.state(arg, model.get(property));
		//stateHandler = () => state.state(arg, model.get(property));
	} else if (_.isFunction(arg)) {
		cntx.handler = () => arg.call(context, model, state);
		//stateHandler = () => arg.call(this, model, state);
	} else if (_.isArray(arg)) {
		cntx.property = arg[0];
		cntx.getValue = () => arg[1].call(context, model.get(property), state, model);
		cntx.handler = () => state.state(arg[0], arg[1].call(context, model.get(property), state, model));
		//stateHandler = () => state.state(arg[0], arg[1].call(this, model.get(property), state, model))
	}
	return cntx;
}

export default Base => Base.extend({
	//useModelAsStateModel: false,
	stateModelEnabled: false,
	stateModelListeningSeparateModelProperties: true,
	constructor() {
		Base.apply(this, arguments);
		if (this.getOption('stateModelEnabled')) {
			this.enableStateModel();
		}
		this.once('before:destroy', this.disableStateModel);
	},
	isStateModelEnabled() {
		return !!this.stateModel;
	},
	enableStateModel() {
		if (!this.stateModel) {
			this.stateModel = this.buildStateModel();
		}
		let state = this.stateModel;
		let onRender = () => this._processStateModelProps(state.attributes);
		this.on('render', onRender);
		let eventsModel = state; //state.getEventsModel();
		this.listenTo(eventsModel, 'change', this._onStateChange);

		let events = this.getOption('modelToState');
		let model = this.model;

		let modelStateEvents;
		let modelChangeEvent;
		if (events && model) {
			if (this.getOption('stateModelListeningSeparateModelProperties')) {
				modelStateEvents = _.reduce(events, (memo, arg, property) => {
					let stateHandler = createHandlerContext(this, state, model, property, arg);
					if (stateHandler.handler) {
						memo[property] = stateHandler.handler;
						stateHandler.handler();
						state.listenTo(model, 'change:' + property, stateHandler.handler);
					}
					return memo;
				}, {});
			} else {
				modelChangeEvent = () => {
					let laterCall = [];
					let hash = _.each(events, (memo, prop, arg) => {
						let stateHandler = createHandlerContext(this, state, model, prop, arg);
						if (!stateHandler.handler) return;
						if (stateHandler.property) {
							memo[stateHandler.property] = stateHandler.getValue();
						} else {
							laterCall.push(stateHandler.handler);
						}

					}, {});
					state.state(hash);
					_.each(laterCall, fn => fn());
				}
				modelChangeEvent();
				state.listenTo(model, 'change', modelChangeEvent);
			}

		}

		this.once('stateModel:disable', () => {
			//this.stopListening(eventsModel, 'change', this._onStateChange);
			this.off('render', onRender);
			this.stopListening(eventsModel);
			delete this.stateModel;
			if (modelStateEvents) {
				_.each(modelStateEvents, (handler, property) => {
					state.stopListening(model, 'change:' + property, handler);
				});
			}
			if (modelChangeEvent) {
				state.stopListening(model, 'change', modelChangeEvent);
			}
		});
	},
	getStateModel() {
		this.enableStateModel();
		return this.stateModel;
	},
	disableStateModel() {
		this.triggerMethod('stateModel:disable');
	},
	buildStateModel() {
		let attrs = this.getOption('defaultStates');
		return new StateModel(attrs);
	},
	getStateClassNames() {
		if (!this.isStateModelEnabled()) {
			return [];
		}
		let model = this.getStateModel();
		let cssClassProps = this._getStateCssClassKeys();
		return model.getStates({
			predicate: key => cssClassProps.indexOf(key) > -1,
			stateValues: true,
			valuesArray: true,
		});
	},
	_processStateModelProps(props) {
		let attrProps = this._getStateAttrKeys();
		let cssClassProps = this._getStateCssClassKeys();
		_.each(props, (value, key) => {
			if (attrProps.indexOf(key) > -1) {
				updateAttribute(this.stateModel, key, this.$el);
			}
			if (cssClassProps.indexOf(key) > -1) {
				updateCssClass(this.stateModel, key, this.$el);
			}
		});
	},
	_onStateChange(model) {
		this._processStateModelProps(model.changed);
	},
	_getStateAttrKeys() {
		return this.getOption('stateAttrs') || [];
	},
	_getStateCssClassKeys() {
		return this.getOption('stateCssClasses') || [];
	},
	setState() {
		let model = this.getStateModel();
		if (!model) return;
		model.state.apply(model, arguments);
	},
	getState(key) {
		this.enableStateModel();
		let model = this.getStateModel();
		return _.isString(key) && model && model.state(key);
	},
	stateOnce() {
		this.enableStateModel();
		let model = this.getStateModel();
		if (!model) return;
		this.listenToOnce(model.getEventsModel(), ...arguments);
	},
	stateOn() {
		this.enableStateModel();
		let model = this.getStateModel();
		if (!model) return;
		this.listenTo(model.getEventsModel(), ...arguments);
	},
	stateOff() {
		this.enableStateModel();
		let model = this.getStateModel();
		if (!model) return;
		this.stopListening(model.getEventsModel(), ...arguments);
	}

});
