import { Lifecycle } from '../lifecycle';
export default Lifecycle.extend({
	name: 'start',
	statesMap: {
		initial: 'init',
		begin: 'running',
		done: 'started',
		error: 'error',
	}
});
