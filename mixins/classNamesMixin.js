import _ from 'underscore';
export default Base => Base.extend({
	shouldRefreshClassNamesOnBeforeRender: true,
	constructor() {
		Base.apply(this, arguments);
		if (this.getOption('shouldRefreshClassNamesOnBeforeRender')) {
			this.on('before:render', this.refreshElementClassNames);
		}
	},
	addClassName(cssClass, value) {
		if (value == null) {
			value = cssClass;
		}
		!this._classNames && (this._classNames = {});
		this._classNames[cssClass] = value;
	},
	getElementAllClasses() {
		let css = [];
		css.push(this.getOption('className'));

		let add1 = this.getOption('classNames');
		css.push(...this._getClassNamesArray(add1));

		let add2 = this.getOption('_classNames');
		css.push(...this._getClassNamesArray(add2));

		if (_.isFunction(this.getStateClassNames)) {
			let add3 = this.getStateClassNames();
			css.push(...add3);
		}
		return _.keys(_.reduce(css, (memo, key) => {
			key && (memo[key] = 1);
			return memo;
		}, {}));
	},
	refreshElementClassNames() {
		let allClasses = this.getElementAllClasses();
		let cls = allClasses.join(' ');
		if (cls) {
			this.$el.attr('class', cls);
		} else {
			this.$el.removeAttr('class');
		}
		//this.el.className = allClasses.join(' ') || '';
	},
	_getClassNamesArray(arg) {
		if (!_.isObject(arg)) return [];
		let array = _.reduce(arg, (memo, value, key) => {
			if (_.isString(value)) {
				memo.push(value);
			} else if (_.isFunction(value)) {
				let fnArgs = [this.model, this];
				let val = value.apply(this, fnArgs);
				if (_.isString(val)) {
					memo.push(val);
				} else if (val === true && _.isString(key)) {
					memo.push(key);
				}
			}
			return memo;
		}, []);
		return array;
	}
});
