import _ from 'underscore';
import { hasFlags } from '../../utils/enum-utils';
import { isInstance } from '../../utils/is-utils';
import ApiMethod from './apiMethod';
export const actorActions = {};

function normalizeApi(api, name, options = {}) {

	if (isInstance(api, ApiMethod)) {
		return api;
	} else if (_.isFunction(api)) {
		let apiMethod = options.api ? options.api.set(name, api, options.claims) : new ApiMethod(name, api, options.claims);
		return apiMethod;
	} else if (_.isString(name) && options.api) {
		return normalizeApi(options.api.get(name), name, options);
	}
	throw new Error('Unable to initialize ActorApi, api method does not resolved');
}
const actorApiOptions = ['name', 'label', 'icon', 'order', 'places', 'hidden'];
function ActorApi(name, label, api, options = {}) {
	this.api = normalizeApi(api, name, options);
	_.extend(this, _.pick(options, actorApiOptions))
}
_.extend(ActorApi.prototype, {
	validate() {
		return this.api.validate();
	},
	isHidden() {
		return this.hidden === true;
	},
	isVisible(force) {
		return force || !this.isHidden();
	},
	isPlaceable(place) {
		if (!this.places) {
			return true;
		}
		return hasFlags(this.places, place, { any: true });
	},
	isAvailable({ place, includeHidden } = {}) {
		return this.validate()
		&& this.isVisible(includeHidden)
		&& this.isPlaceable(place)
	},
	exec() {
		return this.api.exec.apply(this.api, arguments);
	},
	execAsync() {
		return this.api.execAsync.apply(this.api, arguments);
	}
});


ActorApi.set = function(name, label, api, options = {}) {
	let store = options.store || actorActions;
	store[name] = new this.prototype.constructor(name, label, api, options);
};

export default ActorApi;
