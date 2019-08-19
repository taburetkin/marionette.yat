import Control from './control';
import _ from 'underscore';
export default Base => Base.extend({
	shouldInitializeControl: true,
	constructor() {
		Base.apply(this, arguments);
		if (this.getOption('shouldInitializeControl')) {
			this.initializeControl();
		}
	},
	initializeControl() {
		if (this._control) return this._control;
		let options = this._getControlOptions();
		let control = this._control = new Control(options);
		// let parentControl = this.getOption('parentControl');
		// if (parentControl) {
		// 	let key = this.getOption('controlValueKey');
		// 	let wrapper = !key;
		// 	let childOptions = { key, wrapper };
		// 	parentControl.addChildControl(control, childOptions);
		// }
		this.listenTo(control, {
			'change': (...args) => this.triggerMethod('control:change', ...args),
			'done': (...args) => this.triggerMethod('control:done', ...args),
			'valid': (...args) => this.triggerMethod('control:valid', ...args),
			'invalid': (...args) => this.triggerMethod('control:invalid', ...args),
		});
		if (this.getOption('validateOnFirstReady')) {
			this.once('ready', this.validateControl);
		}
		return this._control;
	},
	_getControlOptions() {
		let options = this.getOptions(['value', 'initialValue', 'resetValue', 'validateRules']);
		return _.extend(options, this.getOption('controlOptions'));
	},
	getControl() {
		return this.initializeControl();
	},
	setControlValue(...args) {
		let control = this.getControl();
		return control.setValue(...args);
	},
	getControlValue() {
		return this.getControl().getValue();
	},
	validateControl() {
		return this.getControl().validateAsync();
	}
});
