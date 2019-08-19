import BasePage from './basePage';
import { toAsyncResult } from 'asyncresult-js';

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
		this.mergeOptions(options, ['parent','router', 'app', 'name', 'id']);
		if (!this.childPage) {
			this.childPage = this.getOption('childPage');
		}
		this._initializeRoutesMixin();
		this._initializeChildrenMixin();
		if (this.getOption('immediatelyReady')) {
			this.ready();
		}
	},

	getId() {
		return this.id || this.cid;
	},

	// start lifecycle:
	// isNotAvailable: null || error
	// validate beforeRoute: null || error, accepts request
	// validate beforeStart: null || error, accepts request

	//#region Helpers


	getHeader(options = {}) {
		return this.getOption('header', { locals: options.locals });
	},
	getTitle(options) {
		return this.getOption('title', { locals: options.locals }) || this.getHeader(options);
	},

	// all validators should return: true | null | undefined - for available page, other values will be treaten as error
	_isNotAvailable(...args) {

		let result = errHelper(this.checkAuth(), 'not:authorized');
		if (result) return result;

		result = errHelper(this.getOption('isNotAvailable', { args }), 'not:allowed');
		if (result) return result;

	},
	_isNotAvailableAsync() {
		return toAsyncResult(this._isNotAvailable(...arguments));
	},
	// you have to write this by your own
	// return true | null | undefined - for passed check, other return values treated as check fail
	checkAuth() { },

	//#endregion
});


export default Page;
