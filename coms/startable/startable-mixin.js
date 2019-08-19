import StartLifecycle from './startLifecycle';
import StateModel from '../stateModel/model';
import { toAsyncResult } from 'asyncresult-js';

export default Base => Base.extend({
	startStateKey: 'start-state',
	constructor() {
		Base.apply(this, arguments);
		if (!this.stateModel) {
			this.stateModel = new StateModel();
		}
		this._startable = new StartLifecycle({ context: this, stateModel: this.stateModel });
		this.once('destroy', () => {
			this._startable.destroy();
		});
	},
	start(...args) {

		return this._startable.start(...args);
	},
	startAsync() {
		return toAsyncResult(this.start(...arguments));
	},
	stop(...args) {
		this.triggerMethod('before:stop', ...args);
		let key = this.getOption('startStateKey');
		this.stateModel.state(key, 'stopped');
		this.triggerMethod('stop', ...args);
	},
	isStarted() {
		let key = this.getOption('startStateKey');
		let state = this.stateModel.state(key);
		return state == 'started';
	}
});
