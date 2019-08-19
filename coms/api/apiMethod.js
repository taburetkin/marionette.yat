import { AsyncResult, wrapMethod } from 'asyncresult-js';
import validateClaims from '../../utils/validateClaims';
import camelCase from '../../utils/camelCase';

const ApiMethod = function(name, method, claims) {
	this.originalMethod = method;
	this.name = name;
	this.claims = claims;
	this.nameAsync = camelCase(name, 'async');

	let apiMethod = this.createExecute();
	this.exec = apiMethod;
	this.execAsync = wrapMethod(apiMethod);
}
ApiMethod.prototype.validateClaims = validateClaims;
ApiMethod.prototype.createExecute = function() {
	let _this = this;
	return function() {
		if (_this.validate()) {
			return _this.originalMethod.apply(arguments[0], arguments);
		} else {
			return AsyncResult.fail('not:enough:rights');
		}
	}
}
ApiMethod.prototype.validate = function() {
	if (this.validateClaims(this.claims)) {
		return true;
	} else {
		return false;
	}
}

export default ApiMethod;
