import BaseClass from './baseClass';

const AsyncAwaiter = BaseClass.extend({
	constructor(err, val) {
		this.set(err, val);
	},
	isError() {
		return this.error != null;
	},
	hasValue() {
		return !!this.value;
	},
	errOrVal() {
		return this.err() || this.val();
	},
	isEmpty() {
		return this.val() == null && this.err() == null;
	},
	isOk() {
		return !this.isError();
	},
	err() {
		return this.error;
	},
	val() {
		return this.value;
	},
	setValue(value) {
		this.value = value;
	},
	setError(err) {
		this.error = err;
	},
	set() {
		let arr = [];
		if (arguments.length == 2) {
			arr = arguments;
		} else if (arguments.length == 1 && Array.isArray(arguments[0])) {
			arr = arguments[0];
		}
		this.setError(arr[0]);
		this.setValue(arr[1]);
	}
});

AsyncAwaiter.create = (error, data) => new AsyncAwaiter(error, data);
AsyncAwaiter.success = data => AsyncAwaiter.create(null, data);
AsyncAwaiter.fail = err => AsyncAwaiter.create(err, null);


export default AsyncAwaiter;
