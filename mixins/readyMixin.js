export default Base => Base.extend({
	multipleReadyAllowed: true,
	_supportsReady: true,
	render({ triggerReady } = {}) {
		if (this.getOption('multipleReadyAllowed') == true) {
			this._isReady = false;
		}
		let result = Base.prototype.render.apply(this, arguments);
		if (triggerReady) {
			this.ready();
		}
		return result;
	},
	// rerender() {
	// 	//return this.render({ triggerReady: true });
	// },
	ready() {
		if (this._isReady) { return; }
		this._isReady = true;
		this.triggerMethod('ready', ...arguments);
	}
});
