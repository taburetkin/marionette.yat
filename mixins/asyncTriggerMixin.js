import { toAsyncResult } from 'asyncresult-js';

export default {
	triggerMethodAsync() {
		return toAsyncResult(this.triggerMethod(...arguments));
	}
};
