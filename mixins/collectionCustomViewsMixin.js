import _ from 'underscore';
export default Base => Base.extend({

	shouldRenderCollection: true,
	shouldRenderCustomViews: false,

	constructor() {
		Base.apply(this, arguments);
		if (this.getOption('shouldRenderCollection') === false) {
			this._hideCollection();
		}
		if (this.getOption('shouldRenderCustomViews') === true) {
			this.on('ready', this.renderCustomViews);
		}
	},

	_hideCollection() {
		this._collection = this.collection;
		delete this.collection;
	},

	getCustomViews() {
		return this.getOption('customViews') || [];
	},
	renderCustomViews() {
		this.triggerMethod('before:customs:render');

		let customs = this.getCustomViews();
		let added = this.addChildViews(customs);

		this.triggerMethod('customs:render', added);
	},
	addChildViews(views = []) {
		views = _.filter(views, view => view != null);
		let last = views.pop();
		let added = _.map(views, arg => this._addCustomView(arg, { preventRender: true }));
		added.push(this._addCustomView(last));
		return added;
	},
	_addCustomView(arg, defOptions = {}) {
		if (arg == null) return;

		let view, options;
		if (_.isArray(arg)) {
			view = arg[0];
			options = arg[1] || {};
		} else {
			view = arg;
			options = {};
		}
		options = _.extend(defOptions, options);
		return this.addCustomView(view, options);
	},
	addCustomView(view, options) {
		if (view == null) return;
		view._isCustomView = true;
		view._index = options.index;
		let res = this.addChildView(view, undefined, options);
		return res;
	}
});
