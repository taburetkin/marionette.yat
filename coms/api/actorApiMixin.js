import _ from 'underscore';
import ActorApi, { actorActions } from './actorApi';
import { comparator } from '../../utils/compare-utils';
import { isInstance } from '../../utils/is-utils';
import { AsyncResult } from 'asyncresult-js';

function normalizeActionContext(callContext, ac) {
	if (ac && ac._normalized) {
		return ac;
	}
	if (ac && isInstance(ac.action, ActorApi)) {
		let context = ac.context || callContext;
		if (_.isFunction(context)) {
			context = context.call(callContext, callContext);
		}

		ac.name = ac.action.name;
		if (ac.order == null) {
			ac.order = ac.action.order;
		}
		let apiAction = ac.action;
		ac.exec = (...args) => {
			return apiAction.exec(context, ...args);
		}
		ac.execAsync = (...args) => {
			return apiAction.execAsync(context, ...args);
		}
		ac._normalized = true;
		return ac;
	}
}
function createRawContext(arg, store) {
	if (isInstance(arg, ActorApi)) {
		return { action: arg };
	} else if (_.isString(arg) && isInstance(store[arg], ActorApi)) {
		return { action: store[arg] };
	} else if (_.isObject(arg)) {

		if (arg._normalized) return arg;

		let actionContext = _.clone(arg);
		if (isInstance(actionContext.action, ActorApi)) {
			return actionContext;
		}

		let action = store[actionContext.name];
		if (isInstance(action, ActorApi)) {
			actionContext.action = action;
			return actionContext;
		}
	}
}
function toActionContext(callContext, arg, store) {
	let rawAc = createRawContext(arg, store);
	return normalizeActionContext(callContext, rawAc);
}

export default Base => Base.extend({
	getApiActionsStore() {
		return actorActions;
	},
	_extractApiActionsFromStore() {
		if (!this.apiActions) return [];
		let actions = _.reduce(this.apiActions, (memo, action, key) => {
			let ac = this._toActionContext(action);
			if (ac) {
				memo.push(ac);
			}
			return memo;
		}, []);
		return actions;
	},
	_toActionContext(arg) {
		let store = this.getApiActionsStore();
		return toActionContext(this, arg, store);
	},
	getApiActions(options = {}) {
		let actions = this._extractApiActionsFromStore();
		let predicate = options.predicate;

		let founded = _.filter(actions, ac => (!predicate || predicate(ac)) && ac.action.isAvailable(options));
		if (options.sort) {
			founded.sort(comparator('action.order'))
		}
		return founded;
	},
	getApiAction(name, options = {}) {
		if (isInstance(name, ActorApi)) {
			return name.isAvailabe() && this._toActionContext(name);
		}
		if (name && isInstance(name.action, ActorApi)) {
			return name.action.isAvailabe() && this._toActionContext(name);
		}
		let predicate = ac => ac.name == name;
		if (options.predicate) {
			let givenPredicate = options.predicate;
			predicate = action => givenPredicate(action) && predicate(action);
		}
		options.predicate = predicate;
		let actions = this.getApiActions(options);
		return actions[0];
	},
	executeAction(arg, ...rest) {
		let action = this.getApiAction(arg);
		if (!action) {
			console.warn('executeAction failed on cid ' + this.cid, arg); //eslint-disable-line
			return;
		}
		return action.exec(...rest);
	},
	executeActionAsync(arg, ...rest) {
		let action = this.getApiAction(arg);
		if (!action) {
			console.warn('executeAction failed on cid ' + this.cid, arg); //eslint-disable-line
			return AsyncResult.fail('action:notfound');
		}
		return action.execAsync(...rest);
	},
});
