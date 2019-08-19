import _ from 'underscore';
import { hasFlags } from './enum-utils';

function validateRule(rule, any) {
	let method = any ? 'some' : 'every';
	return _[method](rule, (rights, mod) => {
		if (_.isString(rights) || _.isBoolean(rights)) {
			return config.validateClaimValue(mod, rights);
		} else if (!_.isFunction(rights) && _.isObject(rights)) {
			return validate(rule);
		} else {
			return true;
		}
	});
}


function validate(claims) {
	return _.every(claims, (claimValue, claim) => {
		if (claim == 'any') {
			return validateRule(claimValue, true);
		} else if (claim == 'all') {
			return validateRule(claimValue, false);
		} else {
			return config.validateClaimValue(claim, claimValue);
		}
	});
}


export const config = {
	getActorClaimValue(claim) {
		let claims = {};
		return claims[claim];
	},
	validateClaimValue(claim, value) {
		if (value == null) return true;
		let actorClaimValue = config.getActorClaimValue(claim);
		if (value === actorClaimValue) return true;
		if (value === true && actorClaimValue != null) return true;

		let any = false;
		if (_.isArray(actorClaimValue)) {
			any = false;
		} else if (_.isString(actorClaimValue)) {
			if (actorClaimValue.startsWith('any:')) {
				any = true;
				actorClaimValue = actorClaimValue.substring(4);
			}
		}
		// else {
		// 	console.log('OPA CLAIMS!');
		// 	return true;
		// }
		return config.compareClaimValues(actorClaimValue, value, any);
	},
	compareClaimValues(actorsClaimValue, expectedClaimValue, any) {
		let result = hasFlags(actorsClaimValue, expectedClaimValue, { any });
		return result;
	},

	// should return true if user is not logged in
	anonymous() {
		return true;
	},

	// should return true if user is logged in
	authenticated() {
		return false;
	},
	hasClaims(claims) {
		// if claims are empty user can be anonymous
		if (claims == null) return true;

		// if user is not authenticated he has no claims
		if (!config.authenticated()) return false;

		return validate(claims);
	}
}

export default function(claims) {
	if (typeof claims === 'function') {
		claims = claims();
	}
	if (claims == null) {

		return true;

	} else if (claims === false) {

		return config.anonymous();

	} else if (claims === true) {

		return config.authenticated();

	} else if (_.isFunction(claims)) {

		return claims() === true;

	} else if (_.isObject(claims)) {

		return config.hasClaims(claims);
	}
}

