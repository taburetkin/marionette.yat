import _ from 'underscore';
import ApiMethod from './apiMethod';
import extend from '../../utils/extend';
import { mixWith } from '../../utils/mix';

const BaseApi = function(options = {}) {
	this.api = {};
	this.options = _.clone(options);
	if (options.ApiMethod != null) {
		this.ApiMethod = options.ApiMethod;
	}
}
BaseApi.extend = extend;
BaseApi.mixWith = mixWith;

const notAllowed = ['set', 'get', 'options', 'ApiMethod', 'api'];

_.extend(BaseApi.prototype, {
	ApiMethod,
	set(name, method, claims) {
		if (notAllowed.indexOf(name) > -1) {
			throw new Error('`' + notAllowed.join('`, `') + '` are reserved');
		}
		let apiMetod = new this.ApiMethod(name, method, claims);
		this.api[name] = apiMetod;
		this[apiMetod.name] = apiMetod.exec;
		this[apiMetod.nameAsync] = apiMetod.execAsync;
	},
	get(name) {
		return this.api[name];
	}
});

export default BaseApi;
