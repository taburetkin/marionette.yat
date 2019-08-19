function trigger(context, event, ...args) {
	let method = context.triggerMethod || context.trigger;
	if (method == null || typeof method !== 'function') {
		throw new Error('Given context has no trigger or triggerMethod defined');
	}
	args.unshift(event);
	return method.apply(context, args);
	//context.once(event, () => console.log('\nholly molly!\n'));
	// if (context.triggerMethod) {
	// 	try {
	// 		console.log('trying...');
	// 		return context.triggerMethod(event, ...args);
	// 	} catch (e) {
	// 		console.log('oh man, error! do it again');
	// 		throw e;
	// 	}
	// } else {
	// 	return context.trigger(event, ...args)
	// }

	// try {
	// 	return method.apply(context, args);
	// } catch (e) {
	// 	console.log('apply errror:', event);
	// 	method.apply(context, args);
	// 	return context.triggerMethod(event, ...args);
	// 	// throw e;
	// }
	//return method.call(context, event, ...args);
}

function settle(context, cnt, state, method, data) {
	if (cnt.state != null) return;
	if (arguments.length > 4) {
		cnt.result = data;
	}
	cnt.state = state;
	let eventName = state == true ? 'resolved' : 'rejected';
	trigger(context, eventName, cnt.result);
	return method(cnt.result);

}

export default Base => Base.extend({
	promiseEnabled: true,
	constructor(options) {
		Base.apply(this, arguments);
		this._initializePromise(options);
	},
	_initializePromise(options) {
		if (!this.getOption('promiseEnabled')) return;

		this.mergeOptions(options, ['mapResult']);

		let cnt = this._promise = { state: void 0 };
		let context = this;
		cnt.promise = new Promise((resolve, reject) => {
			cnt.resolve = function(data) {
				let args = [context, cnt, true, resolve];
				if (arguments.length > 0) {
					args.push(data);
				}
				return settle(...args);
			};
			cnt.reject = function(data) {
				let args = [context, cnt, true, reject];
				if (arguments.length > 0) {
					args.push(data);
				}
				return settle(...args);
			}
		});

		this.then = cnt.promise.then.bind(cnt.promise);
		this.catch = cnt.promise.catch.bind(cnt.promise);

		this.once('before:destroy', () => {
			cnt.reject({ reason: 'reject' });
		});


		this.reject = async function(rejectContext = {}) {
			if (rejectContext.reason) {
				this.triggerMethod('freeze:start');
				let res = await this.triggerMethodAsync('before:' + rejectContext.reason, ...arguments);
				this.triggerMethod('freeze:end');
				if (res.isError()) {
					let error = res.err();
					if (error instanceof Error) {
						throw error;
					}
					this.triggerMethod(rejectContext.reason + ':fail', error);
					return Promise.reject(res);
				} else {
					return cnt.reject(...arguments);
				}
			} else {
				return cnt.reject(...arguments);
			}
		}

		this.resolve = async function(data, ...rest) {
			if (!arguments.length) {
				data = this.getPromiseValue();
			}
			if (typeof this.mapResult === 'function') {
				data = this.mapResult(data);
			}

			this.triggerMethod('freeze:start');
			let res = await this.triggerMethodAsync('before:resolve', data, ...rest);
			this.triggerMethod('freeze:end');

			if (res.isError()) {
				let error = res.err();
				if (error instanceof Error) {
					throw error;
				}
				this.triggerMethod('resolve:fail', error);
				return Promise.reject(res);
			} else {
				return cnt.resolve(data, ...rest);
			}
		}

		/*
		this.once({
			'resolve': 'resolve',
			'reject': 'reject'
		});
		*/
	},
	isPromise() {
		return this._promise && !!this._promise.promise || false;
	},
	isPending() {
		return !this.isSettled();
	},
	isSettled() {
		if (!this.isPromise()) return false;
		return this._promise.state != null;
	},
	getPromise() {
		let promise = this._promise && this._promise.promise;

		if (promise && promise.then) {
			return promise;
		}

		return Promise.resolve();
	},
	setPromiseValue(value) {
		if (!this.isPromise()) return;
		this._promise.result = value;
	},
	getPromiseValue() {
		if (!this.isPromise()) return;
		return this._promise.result;
	}
});
