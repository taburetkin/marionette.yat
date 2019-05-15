import _ from 'underscore';
import buildRouteUrl from '../../utils/buildRouteUrl';

export default {
	getUrl(options = {}) {
		let routeContext = this.getRoute(options.routeName);
		if (!routeContext) return;
		return this._buildUrl(routeContext, options);
	},
	_buildUrl(routeContext, options = {}) {
		let { data, search, hash } = options;
		let url = buildRouteUrl(routeContext.route, data, search, hash);
		return url;
	},


	getMenuIcon() {
		return this.getOption('menuIcon');
	},
	getMenuLabel(options) {
		return this.getOption('menuLabel') || this.getHeader(options) || this.getOption('name') || this.cid;
	},


	createMenu(options) {
		return {
			id: this.cid,
			name: this.getOption('name'),
			label: this.getMenuLabel(options),
			icon: this.getMenuIcon(options),
			url: this.getUrl(options),
		}
	},
	_getPagesMenu(pages, options) {
		if (!pages) return;
		let menus = _.reduce(pages, (memo, page) => {
			let menu = page.getMenu(options);
			menu && memo.push(menu);
			return memo;
		}, []);
		if (menus.length) {
			return menus;
		}
	},
	isAvailableForMenu(options = {}) {
		let notInMenu = this.getOption('notInMenu');
		let available = !notInMenu && (options.data || !this.hasRouteParameters);
		let na = this._isNotAvailable({ for: 'menu' });
		return available && (na == null || na === true);
	},
	getMenu(options = {}) {
		if (!this.isAvailableForMenu(options)) return;

		let menu = this.createMenu(options);
		let childOptions = _.extend({}, options, { parent: false, children: false, siblings: false });
		let apply = (menuKey, value) => {
			if (!value) return;
			menu[menuKey] = value;
		}
		if (options.siblings !== false) {
			apply('siblings', this._getPagesMenu(this.getSiblings(options), childOptions));
		}

		if (options.children !== false) {
			let children = this.getChildren() || [];
			childOptions.children = options.fullTree === true;
			apply('children', this._getPagesMenu(children, childOptions));
		}

		if (options.parent !== false) {
			let parent = this.getParent();
			let parentMenu = parent && parent.getMenu(_.extend({}, options, { siblings: false, children: false, parent: true }));
			apply('parent', parentMenu);
		}

		return menu;
	}
}
