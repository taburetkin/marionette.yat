import _ from 'underscore';
import AsyncAwaiter from '../coms/asyncAwaiter';
import { isInstance } from '../utils/is-utils';

export const awaiter = function awaiter(promise) {
	const newPromise = new Promise((resolve) => {

		if (isInstance(promise, AsyncAwaiter)) {

			resolve(promise);

		} else if (isInstance(promise, Error)) {

			resolve(AsyncAwaiter.fail(promise));

		} else if (!promise || !promise.then) {

			resolve(AsyncAwaiter.success(promise));
		}

		promise
			.then((data) => {
				let resolvingWith = isInstance(data, AsyncAwaiter)
					? data
					: AsyncAwaiter.success(data);
				resolve(resolvingWith);
			})
			.catch((error) => {
				let resolvingWith = isInstance(error, AsyncAwaiter)
					? error
					: AsyncAwaiter.fail(error);
				resolve(resolvingWith);
			});
	});
	return newPromise;
}

export function wrapWithAwaiter(method, context) {

	let asyncMethod = async function() {
		return awaiter(method.apply(this, arguments));
	}
	if (context) {
		asyncMethod.bind(context);
	}
	return asyncMethod;
}

export function toAsync(ns, ...methodsNames) {
	if (!_.isObject(ns)) return ns;
	let context = ns;
	let anotherContext = _.last(methodsNames);
	if (_.isObject(anotherContext)) {
		methodsNames.pop();
		context = anotherContext;
	}
	_.each(methodsNames, name => {
		let method = ns[name];
		if (_.isFunction(method)) {
			ns[name + 'Async'] = wrapWithAwaiter(method, context);
		}
	})
}

export function namespaceToAsync(ns, { exclude = [], excludeAsynced = true, context } = {}) {
	if (!_.isObject(ns)) return;
	!context && (context = ns);
	let keys = _.reduce(ns, (memo, method, key) => {
		if (
			!_.isFunction(method)
			||
			(excludeAsynced && key.endsWith('Async'))
			||
			(exclude.indexOf(key) > -1)
		) return memo;
		memo.push(key);
		return memo;
	}, []);
	return toAsync(ns, ...keys, context);
}
