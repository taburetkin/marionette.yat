import { awaiter } from '../utils/async-utils';

export default {
	triggerMethodAsync() {
		return awaiter(this.triggerMethod(...arguments));
	}
};
