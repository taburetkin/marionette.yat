export default Base => Base.extend({
	elementTitleEnabled: true,
	constructor() {
		Base.apply(this, arguments);

		if (!this.getOption('elementTitleEnabled')) return;

		this.on('render', () => {
			let title = this.getTitleAttribute();
			if (title) {
				this.$el.attr('title', title);
			} else {
				if (this.$el.attr('title')) {
					this.$el.removeAttr('title');
				}
			}
		});
	},
	getTitleAttribute() {
		let modelKey = this.getOption('modelTitleAttribute');
		if (this.model && modelKey) {
			return this.model.get(modelKey);
		}
		return this.getOption('title');
	}
});
