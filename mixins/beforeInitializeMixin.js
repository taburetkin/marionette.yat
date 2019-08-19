export default {
	preinitialize() {
		if (this.getOption('beforeInitializeEnabled')) {
			this.triggerMethod('before:initialize');
		}
	},
	doBeforeInitialize(handler) {
		this.once('before:initialize', handler.bind(this));
	},
};
