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
	set(key, value) {
		this._store[key] = value;
		this.trigger('change:' + key, value);
	},
});

export default YatContext;
