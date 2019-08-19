
import BaseClass from '../baseClass';
import { isInstance } from '../../utils/is-utils';

function deserialize(res) {
	return res.text().then(txt => {
		try {
			return JSON.parse(txt);
		} catch (e) {
			return txt;
		}
	}).catch(() => void 0);
}

const Http = BaseClass.extend({
	constructor() {
		BaseClass.apply(this, arguments);
		this.config = {
			//mode: 'cors',
			credentials: 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}
	},
	buildRequestOptions(raw, additional) {
		let options = Object.assign({}, this.config, raw, additional);
		if (!isInstance(options.headers, Headers)) {
			options.headers = this.buildRequestHeaders(options.headers);
		}
		return options;
	},
	buildRequestHeaders(raw) {
		const headers = new Headers();
		const rawHeaders = Object.assign({}, raw);
		Object.keys(rawHeaders).forEach(key => {
			headers.append(key, rawHeaders[key]);
		});
		return headers;
	},
	buildRequestBody(data, method) {
		if (data == null) return;
		let body = JSON.stringify(data);
		return body;
	},
	methodsWithBody: ['POST', 'PUT', 'PATCH'],
	_additionalOptions(method, data) {
		let additional = { method };
		if (this.methodsWithBody.indexOf(method) == -1) return additional;
		let body = this.buildRequestBody(data, method);
		body && (additional.body = body);
		return additional;
	},
	send(url, rawoptions, additional) {
		console.log('chpok');
		let options = this.buildRequestOptions(rawoptions, additional);
		if (options.addUrl) {
			url += options.addUrl;
		}
		return fetch(url, options).then(
			res => {
				if (res.ok) {
					return deserialize(res);
				} else {
					return deserialize(res).then(json => Promise.reject({ status: res.status, error: json }));
				}
			},
			res => {
				return Promise.reject({ status: res.status, statusText: res.statusText, res });
			}
		);
	},
	get(url, options) {
		let additional = this._additionalOptions('GET');
		return this.send(url, options, additional);
	},
	post(url, data, options) {
		let additional = this._additionalOptions('POST', data);
		return this.send(url, options, additional);
	},
	put(url, data, options) {
		let additional = this._additionalOptions('PUT', data);
		return this.send(url, options, additional);
	},
	patch(url, data, options) {
		let additional = this._additionalOptions('PATCH', data);
		return this.send(url, options, additional);
	},
	delete(url, options) {
		let additional = this._additionalOptions('DELETE');
		return this.send(url, options, additional);
	},
	head(url, options) {
		let additional = this._additionalOptions('HEAD');
		return this.send(url, options, additional);
	},
});

export * from './ApiResource';
export default Http;
