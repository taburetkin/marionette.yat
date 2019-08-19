import Api from './api';


function registerMethod(api, name, handler) {
	let defAuth = api.options.auth;
	let ownAuth = api.options[`${name}Auth`];
	let auth = ownAuth === void 0 ? defAuth : ownAuth;
	api.set(name, handler, auth);
}


export default Api.extend({
	constructor(options = {}) {
		if (options.http == null) {
			throw new Error('http not provided');
		}
		Api.apply(this, arguments);

		let http = options.http;
		let url = options.url;
		if (options.urlRoot) {
			url = options.urlRoot + url;
		}

		registerMethod(this, 'httpGet', function(...args) {
			return http.get(url, ...args);
		});
		registerMethod(this, 'httpPost', function(...args) {
			return http.get(url, ...args);
		});
		registerMethod(this, 'httpPatch', function(...args) {
			return http.get(url, ...args);
		});
		registerMethod(this, 'httpPut', function(...args) {
			return http.get(url, ...args);
		});
		registerMethod(this, 'httpDelete', function(...args) {
			return http.get(url, ...args);
		});
		registerMethod(this, 'httpHead', function(...args) {
			return http.get(url, ...args);
		});
	},
});
