import _ from 'underscore';
import { triggerMethodOn } from '../../utils/events-utils';
import { AsyncResult, toAsyncResult } from 'asyncresult-js';

import YatObject from '../yatObject';

const Lifecycle = YatObject.extend({
	constructor(options) {
		YatObject.apply(this, arguments);
		this._isIddle = true;
		this.mergeOptions(options, ['context', 'name', 'canNotBeStarted']);
		if (!this.name) {
			this.name = _.uniqueId('lf');
		}
	},
	async start(options) {
		this._isIddle = false;

		await this.broadcast('begin', options);

		let error = await this._isNotAwailable();
		let nwerror = error.err() || error.val();
		if (await this._tryCompleteWithError(nwerror, options)) {
			return AsyncResult.fail(nwerror);
		}

		let result = await this.broadcast('before', options);
		if (await this._tryCompleteWithError(result.err(), options)) {
			return result;
		}

		this._complete();
		await this.broadcast('', options);
	},

	async _tryCompleteWithError(err, options) {
		let sendErr = err instanceof AsyncResult ? err.err() : err;
		if (!sendErr) return;

		await this.broadcast('error', sendErr, options);
		await this._complete(options);
		return sendErr;
	},

	async _complete(options) {
		this._isIddle = true;
		return await this.broadcast('end', options);
	},

	_isNotAwailable() {
		return toAsyncResult(this.getOption('isNotAvailable'));
	},

	async broadcast(prefix, ...args) {
		let selfEvent = prefix || 'done';
		let result = await toAsyncResult(this.triggerMethod(selfEvent, ...args));
		if (this.context) {
			prefix && (prefix += ':');
			let eventName = prefix + this.name;
			return await toAsyncResult(triggerMethodOn(this.context, eventName, ...args));
		}
		return result;
	},
	destroy() {
		if (this._isDestroying || this._isDestroyed) return;
		this._isDestroying = true;
		_.each(_.keys(this), key => delete this[key]);
		this._isDestroyed = true;
	},
	isDestroyed() {
		return this._isDestroyed === true;
	},
});

export default Lifecycle;
