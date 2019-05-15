import _ from 'underscore';
import BasePage from './basePage';
import { buildItem } from '../../utils/build-utils';
import { isInstance } from '../../utils';
export default {
	getParent() {
		return this.parent;
	},
	getRoot() {
		let parent = this.getParent();
		if (!parent || !parent.getRoot) return this;
		return parent.getRoot();
	},
	getChildren(options = {}) {
		if (!options.predicate) {
			return this._children;
		} else {
			return _.filter(this._children, options.predicate);
		}
	},
	getSiblings() {
		let parent = this.getParent();
		if (!parent) return;
		let predicate = page => page != this;
		return parent.getChildren({ predicate });
	},
	hasChildren() {
		let children = this.getChildren();
		return children && !!children.length;
	},
	//#region Initialize
	_initializeChildrenMixin() {
		let onready = this.getOption('initializeChildrenOnReady');
		if (!onready) {
			this._createChildren();
		} else {
			this.once('ready', this._createChildren);
		}
	},
	_createChildren() {
		if (this._children) return;
		let children = this.getOption('children') || [];

		let options = this.getOption('childrenOptions') || {};

		this._children = _.reduce(children, (memo, arg) => {
			let child = this._buildChild(arg, options);
			if (child) {
				memo.push(child);
				child.ready();
			}
			return memo;
		}, []);
	},
	getChildOptions(options = {}) {
		_.defaults(options, {
			app: this.app,
			router: this.getRouter(),
			parent: this,
			childPage: this.childPage,
		});
		return options;
	},
	_buildChild(arg, opts = {}) {
		opts = this.getChildOptions(opts);
		if (isInstance(arg, BasePage)) {
			return arg;
		} else if (!_.isFunction(arg) && _.isObject(arg)) {
			let item = {
				class: this.childPage
			}
			let pageOptions = {
				BaseClass: BasePage,
				ctorArgs: _.extend({}, opts, arg)
			}
			return buildItem(this, item, pageOptions);
		}
		return buildItem(this, arg, {
			BaseClass: BasePage,
			ctorArgs: opts
		});
	},
	//#endregion
};
