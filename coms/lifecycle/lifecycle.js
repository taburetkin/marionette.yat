//import _ from 'underscore';
import Lifecycle from './coreLifecycle';

export default Lifecycle.extend({
	stateKey() {
		return (this.getOption('name') || 'lifecycle') + '-state';
	},
	statesMap: {
		initial: 'init',
		begin: 'running',
		done: 'done',
		error: 'error',
	},
	constructor(options) {
		Lifecycle.apply(this, arguments);
		this.mergeOptions(options, ['stateModel']);


		if (this.stateModel) {

			this._setMapState('initial');

			this.on({
				'begin': () => this._setMapState('begin'),
				'done': () => this._setMapState('done'),
				'error': () => this._setMapState('error'),
			});
		}

	},
	_setMapState(key) {
		let map = this.getOption('statesMap') || {};
		this.setState(map[key]);
	},
	setState(val) {
		if (!this.stateModel) return;
		let key = this.getOption('stateKey');
		this.stateModel.state(key, val);
	},
});
