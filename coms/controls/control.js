import _ from 'underscore';
import { MnObject } from '../../vendors';
//import { isInstance } from '../../utils/is-utils';
import { toAsyncResult, AsyncResult } from 'asyncresult-js';

const BaseControl = MnObject;
const Control = BaseControl.extend({
	constructor(options) {
		BaseControl.apply(this, arguments);
		//this.on('all', c => console.log(`[${this.cid}]`, c, this.property));
		this._children = [];
		this.mergeOptions(options, ['value', 'initialValue', 'resetValue']);
		if (!this.hasOwnProperty('initialValue')) { /* eslint-disable-line */
			this.initialValue = this.value;
		}
		this.validated = false;
		//this.on('all', console.log.bind(console, this.cid));
	},


	//#region SET/GET value

	getValue(options = {}) {
		if (options.type == 'initial') {
			return this.initialValue;
		} else if (options.type == 'reset') {
			return this.resetValue;
		}
		return this.value;
	},

	async setValue(value, options = {}) {
		this.validated = false;
		let nextValue;
		if (options.merge) {
			let curValue = _.isObject(this.value) ? this.value : {};
			nextValue = _.extend({}, curValue, value);
		} else {
			nextValue = _.clone(value);
		}
		this._prevValue = this.value;
		this.value = nextValue;

		let parentValue = this.getParentValue();
		await this.validateAsync(nextValue, { parentValue, changer: options.changer });

		this.validated = true;

		let eventName = options.changeEvent || 'change';
		if (this.isValid()) {
			this.triggerMethod(eventName, nextValue);
		}

	},

	async mergeValue(value, options = {}) {
		options.merge = true;
		return await this.setValue(value, options);
	},

	async setKeyValue(key, value, options) {
		let mergeValue = { [key]: value };
		return await this.mergeValue(mergeValue, options);
	},

	//#endregion

	//#region validation

	// for valid things should return undefined or false;
	validateValue(value, options = {}) {
		let validate = this.getOption('validate', { force: false });
		//console.log('...', this.cid, this.property, options);
		if (_.isFunction(validate)) {
			if (options.useControlValue) {
				value = this.getValue();
			}
			return validate(value, options);
		}
	},

	async validateAsync(value, options = {}) {
		if (!arguments.length) {
			value = this.getValue();
		}
		let children = this.hasChildren();
		let ownresult;
		let childresult;
		let result;

		if (children) {
			childresult = await this.validateChildrenAsync(value, options);
			childresult = childresult.errOrVal();
		}
		ownresult = await this.validateValue(value, options);

		if (ownresult instanceof AsyncResult) {
			ownresult = ownresult.errOrVal();
		}

		if (children) {
			result = [];
			childresult && (result.push(childresult));
			ownresult && result.unshift(ownresult);
			if (!result.length) {
				result = void 0;
			}
		} else {
			result = ownresult;
		}

		if (result) {
			this.setErrors(result);
		} else {
			this.setErrors(null);
		}

		this.validated = true;

		return toAsyncResult(result);
	},
	async validateChildrenAsync(parentValue, options = {}) {
		let changer = options.changer;
		let childrenErrors = {};
		for (let x = 0; x < this._children.length; x++) {
			let context = this._children[x];
			let errors;
			if (changer != context) {
				let childResult = await context.control.validateAsync(null, { parentValue, useControlValue: true });
				if (childResult.isEmpty()) continue;
				errors = childResult.errOrVal();
			} else {
				errors = context.control.errors;
			}
			errors && (childrenErrors[context.control.cid] = errors);
		}
		return _.size(childrenErrors) ? AsyncResult.fail(childrenErrors) : AsyncResult.success();
	},
	//#endregion

	//#region Children
	getParentValue(opts) {
		if (!this.parentControl) return;
		return this.parentControl.getValue(opts);
	},
	addChildControl(control, options) {
		let item = _.extend({}, options, { control });
		control.parentControl = this;
		this._children.push(item);
		this.listenTo(control, {
			'change': (value) => this._onChildControlChange(item, 'change', value),
			'done': (value) => this._onChildControlChange(item, 'done', value),
			//'invalid': errors => this._onChildControlInvalid(item, errors),
		});
	},

	hasChildren() {
		return this._children && !!this._children.length;
	},

	_onChildControlChange(controlContext, changeType, value) {
		let options = { changer: controlContext };
		let shouldTriggerDone = this.getOption('doneOnChildDone') == true || controlContext.wrapper || this._children.length == 1;
		if (changeType == 'done' && shouldTriggerDone) {
			options.changeEvent = 'done';
		}

		if (controlContext.key) {
			return this.setKeyValue(controlContext.key, value, options);
		} else {
			return this.mergeValue(value, options);
		}
	},

	// _onChildControlInvalid(controlContext, errors) {
	// 	this.setErrors(errors);
	// },

	//#endregion

	setErrors(errors, child) {
		this.errors = errors;
		if (this.isValid()) {
			this.triggerMethod('valid');
		} else {
			this.triggerMethod('invalid', errors);
		}
	},

	isValid() {
		return this.errors == null;
	},

});

export default Control;
