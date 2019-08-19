import BaseClass from './baseClass';
import { Events } from 'backbone';
import mix from '../utils/mix';

const YatContext = mix(BaseClass).with(Events, {
	constructor() {
		this._store = {};
	},
	get(key) {
		return this._store[key];
	},
	set(key, value, { wrap } = {}) {
		if (wrap) {
			this._store[key] = () => value;
		} else {
			this._store[key] = value;
		}
		this.trigger('change:' + key, value);
	},
	setReq(key, value) {
		this.set(key, value, { wrap: true });
	},
	req(key, ...args) {
		let stored = this.get(key);
		if (typeof stored === 'function') {
			return stored(...args);
		}
		return stored;
	},
});

export default YatContext;
