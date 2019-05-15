import { History } from '../vendors';

export default History.extend({
	isStarted() {
		return History.started;
	},
});
