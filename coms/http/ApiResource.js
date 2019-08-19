import _ from 'underscore';
import { mixWith } from '../../utils/mix';
import extend from '../../utils/extend';

const defaultMethods = {
	get(options) {
		return this.request('get', null, options)
	},
	head(options) {
		return this.request('get', null, options)
	},
	post(data, options) {
		return this.request('post', data, options);
	},
	patch(data, options) {
		return this.request('patch', data, options);
	},
	delete(options) {
		return this.request('delete', null, options);
	},
}
export const ApiResource = function(url, { methods, urlRoot } = {}) {
	this.urlRoot = urlRoot || '';
	this.url = url;
	if (methods == null) {
		methods = Object.keys(defaultMethods);
	}
	let applyMethods = _.pick(defaultMethods, methods);
	_.each(applyMethods, (method, key) => {
		this[key] = method.bind(this);
	});
};

ApiResource.extend = extend;
ApiResource.mixWith = mixWith;

ApiResource.prototype = {
	getClient() {},
	getApiRoot() { return ''; },
	buildUrl(raw, rawRoot, data = {}) {
		if (rawRoot) {
			raw = rawRoot + '/' + raw;
		}
		let url = raw.replace(/:\w+/g, (match) => {
			return data[match.substring(1)];
		});
		url = this.getApiRoot() + '/' + url;
		return url;
	},
	request(method, data, options = {}) {
		let client = this.getClient();
		let url = this.buildUrl(this.url, this.urlRoot, options.urlData);
		let args = [url];
		if (data !== void 0) {
			args.push(data);
		}
		args.push(options);

		return client[method].call(client, ...args);
	},
	addChild(url, options = {}) {
		options.urlRoot = this.url;
		this[url] = new this.constructor(url, options);
	}
}
