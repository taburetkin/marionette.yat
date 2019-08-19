import { isModel } from './is-utils';

export function getByPath(instance, key) {
	if (!key || instance == null || typeof instance !== 'object') return;
	let [flatKey, ...keys] = key.split('.');
	let value = isModel(instance) ? instance.get(flatKey) : instance[flatKey];
	if (!keys.length) {
		return value;
	}
	return getByPath(value, keys.join('.'));
}
