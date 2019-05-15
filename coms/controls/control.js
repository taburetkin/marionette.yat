import _ from 'underscore';
import { MnObject } from '../../vendors';
import { awaiter } from '../../utils/async-utils';

const BaseControl = MnObject;
const Control = BaseControl.extend({
	constructor(options) {
		BaseControl.apply(this, arguments);
		this._children = [];
		this.mergeOptions(options, ['value', 'initialValue', 'resetValue']);
		if (!this.hasOwnProperty('initialValue')) {
			this.initialValue = this.value;
		}
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
		let nextValue;
		if (options.merge) {
			let curValue = _.isObject(this.value) ? this.value : {};
			nextValue = _.extend({}, curValue, value);
		} else {
			nextValue = _.clone(value);
		}
		let validateResult = await this.validateValueAsync(nextValue);
		if (!validateResult.isEmpty()) {
			let err = validateResult.errOrVal();
			this.setErrors(err);
			return Promise.reject(err);
		} else {
			this.setErrors(null);
		}
		this._prevValue = this.value;
		this.value = nextValue;

		let eventName = options.changeEvent || 'change';
		this.triggerMethod(eventName, nextValue);

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

	validateValue(value, options) {
		let validate = this.getOption('validate', { force: false });
		if (_.isFunction(validate)) {
			return validate(value, options);
		} else if (validate) {
			return validate;
		}
	},

	validateValueAsync(value, options) {
		return awaiter(this.validateValue(value, options));
	},

	//#endregion

	//#region Children

	addChildControl(control, options) {
		let item = _.extend({}, options, { control });
		this._children.push(item);
		this.listenTo(control, {
			'change': (value) => this._onChildControlChange(item, 'change', value),
			'done': (value) => this._onChildControlChange(item, 'done', value),
			'invalid': errors => this._onChildControlInvalid(item, errors),
		});
	},

	hasChildren() {
		return this._children && !!this._children.length;
	},

	_onChildControlChange(controlContext, changeType, value) {
		if (controlContext.key) {
			return this.setKeyValue(controlContext.key, value);
		} else {
			let options;
			if (controlContext.wrapper && changeType == 'done') {
				options.changeEvent = 'done';
			}
			return this.mergeValue(value, options);
		}
	},

	_onChildControlInvalid(controlContext, errors) {
		this.setErrors(errors);
	},

	//#endregion

	setErrors(errors) {

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
