import takeFirst from '../utils/takeFirst';
export default Base => Base.extend({
	constructor(options) {
		let shouldHook = takeFirst('beforeFirstRenderEnabled', options, this)
		if (shouldHook) {
			this.once('before:render', () => this.triggerMethod('before:first:render'));
		}
		Base.apply(this, arguments);
	}
});
