import BasePage from './basePage';
import { awaiter } from '../../utils/async-utils';

const errHelper = (result, onFalse = false) => {
	if (result === false) {
		return onFalse;
	} else if (result !== true && result) {
		return result;
	}
}

const Page = BasePage.extend({

	initializeRoutesOnReady: true,
	initializeChildrenOnReady: true,
	immediatelyReady: true,
	relativeRoutes: true,

	constructor(options) {
		BasePage.apply(this, arguments);
		this.mergeOptions(options, ['parent','router', 'app']);
		if (!this.childPage) {
			this.childPage = this.getOption('childPage');
		}
		this._initializeRoutesMixin();
		this._initializeChildrenMixin();
		if (this.getOption('immediatelyReady')) {
			this.ready();
		}
	},


	// start lifecycle:
	// isNotAvailable: null || error
	// validate beforeRoute: null || error, accepts request
	// validate beforeStart: null || error, accepts request

	//#region Helpers

	getOption(key, options = {}) {
		if (options.args == null) {
			options.args = [this];
		}
		if (this.model) {
			options.args.push(this.model);
		}
		return BasePage.prototype.getOption.call(this, key, options);
	},
	getHeader() {
		return this.getOption('header');
	},

	// all validators should return: true | null | undefined - for available page, other values will be treaten as error
	_isNotAvailable(...args) {

		let result = errHelper(this.checkAuth(), 'not:authorized');
		if (result) return result;

		result = errHelper(this.getOption('isNotAvailable', { args }), 'not:allowed');
		if (result) return result;

	},
	_isNotAvailableAsync() {
		return awaiter(this._isNotAvailable(...arguments));
	},
	// you have to write this by your own
	// return true | null | undefined - for passed check, other return values treated as check fail
	checkAuth() { },

	//#endregion
});


export default Page;
