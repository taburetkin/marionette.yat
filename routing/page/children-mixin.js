import _ from 'underscore';
import BasePage from './basePage';
import { buildItem } from '../../utils/build-utils';
import { isInstance, isClass } from '../../utils';
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
		let children = this._children;
		if (options.traverse && children && children.length) {
			children = children.reduce((memo, child) => {
				let childChildren = child.getChildren(options);
				memo.push(child, ...childChildren);
				return memo;
			}, []);
		}
		if (options.clone) {
			children = children.slice(0);
		}
		if (!options.predicate) {
			return children;
		} else {
			return _.filter(children, options.predicate);
		}
	},
	findPages(predicate, options = {}) {
		if (!_.isFunction(predicate)) {
			let idValue = predicate;
			predicate = p => p.getId() == idValue;
		}
		if (options.traverse == null) {
			options.traverse = true;
		}
		options.clone = true;
		let pages = this.getChildren(options);
		pages.push(this);
		return pages.filter(predicate);
	},
	findPage() {
		return this.findPages(...arguments)[0];
	},
	findPageByUrl(url, all) {
		let pages = this.findPages(p => p._routes.some(r => r.registeredRoute.test(url)));
		if (!all) return pages[0];
		return pages;
	},
	getSiblings({ includeSelf = false } = {}) {
		let parent = this.getParent();
		if (!parent) return;
		let predicate = includeSelf ? void 0 : page => page != this;
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
		let buildOptions = {
			context: this,
			BaseClass: BasePage,
			ctorArgs: opts,
		};
		if (isInstance(arg, BasePage)) {
			return arg;
		} else if (!_.isFunction(arg) && _.isObject(arg)) {
			let item = this.childPage;
			buildOptions.ctorArgs = _.extend({}, buildOptions.ctorArgs, arg);
			return buildItem(item, buildOptions);
		} else if (_.isFunction(arg) && !isClass(arg, BasePage)) {
			arg = arg();
			return this._buildChild(arg, opts);
		}
		return buildItem(arg, buildOptions);
	},
	//#endregion
};
