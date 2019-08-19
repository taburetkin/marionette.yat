import _ from 'underscore';
import config from '../config';
import Router from '../router';

const routeToRegExp = Router.prototype._routeToRegExp;

const extractParameterNames = function(route) {
	let matches = route.match(/:\w+/gmi);
	if (_.isArray(matches)) {
		return _.map(matches, match => match.substring(1));
	}
}

export default {
	_initializeRoutesMixin() {
		let onready = this.getOption('initializeRoutesOnReady');
		if (!onready) {
			this._createRoutes();
		} else {
			this.once('ready', this._createRoutes);
		}
	},

	_createRoutes() {
		if (this._routes) return;
		let routes = this.getOption('routes');
		if (routes == null) return;
		if (_.isString(routes)) {
			routes = [routes];
		}
		let defaultRoute;
		this._routes = _.reduce(routes, (memo, arg, key) => {
			let route = this._buildRoute(key, arg);
			if (route != null) {
				memo.push(route);
				if (route.isDefault || !defaultRoute) {
					defaultRoute = route;
				}
			}
			return memo;
		}, []);
		if (defaultRoute && !defaultRoute.isDefault) {
			defaultRoute.isDefault = true;
			this.hasRouteParameters = defaultRoute.hasParameters;
		}
		this._registerRoutes(this._routes);
	},

	_buildRoute(routeKey, arg) {
		if (_.isString(arg)) {
			return this._buildRoute(routeKey, { route: arg })
		} else if (_.isFunction(arg)) {
			return this._buildRoute(routeKey, arg.call(this, routeKey));
		} else if (!_.isObject(arg) || arg.route == null) {
			return;
		}
		if (arg.name == null) {
			arg.name = routeKey;
		}
		arg.routeRegExp = routeToRegExp(arg.route);
		arg.routeParameters = extractParameterNames(arg.route);
		arg.hasParameters = /:\w+/g.test(arg.route);
		if (this.getOption('relativeRoutes')) {
			let parent = this.getParent();
			let parentRoute = parent && parent.getDefaultRoute && parent.getDefaultRoute();
			if (parentRoute != null && parentRoute.route) {
				let proute = parentRoute.route.replace(/^(.*)\(\/\)$/, '$1');
				arg.route = proute + '/' + arg.route;
			}
		}
		return arg;
	},

	getDefaultRoute() {
		return this.getRoute();
	},
	// arg should be a string, or predicate. if its null then defaultRoute returned
	getRoute(arg) {
		let predicate;
		if (_.isObject(arg)) {
			predicate = arg;
		} else if (_.isString(arg)) {
			predicate = { name: arg }
		} else {
			predicate = { isDefault: true };
		}
		return _.findWhere(this._routes || [], predicate);
	},

	// adds routes to router
	_registerRoutes(routes) {
		let router = this.getRouter();
		if (!router || !routes || !routes.length) return;
		_.each(routes, route => {
			let rawroute = route.route;
			let handler = this.createRouteHandler(route, router);
			route.registeredRoute = router._routeToRegExp(rawroute);
			router.route(rawroute, handler);
		});
	},

	createRouteHandler(route, router) {
		const handler = async(...args) => {
			let request = this.createRequest(route, args);
			let callres = await request.calledMethod();
			return callres;
		}
		return handler;
	},

	createRequest(route, args) {
		let requestUrl = window.location.pathname + window.location.search + window.location.hash;
		let request = _.extend({ page: this, requestUrl }, route);
		request.locals = {};
		if (args != null) {
			request.rawQs = args.pop();
			request.rawArgs = args;
			if (typeof (URLSearchParams) != 'undefined') {
				request.qs = new URLSearchParams(request.rawQs || '');
			}
			if (_.isArray(request.rawArgs)) {
				let matches = request.route.match(/:\w+/g);
				request.args = _.reduce(matches, (memo, match, index) => {
					memo[match.substring(1)] = request.rawArgs[index];
					return memo;
				}, {});
			}
			// request.urlOptions = {
			// 	data: request.args,
			// 	search: request.qs,
			// 	hash: window.location.hash,
			// }
		}

		request.calledMethod = () => this.route(request);
		return request;
	},

	_onRouteError(err, req) {
		this.triggerMethod('route:error', err, req);
		if (!config.history) return;
		config.history.trigger('page:route:error', err, req);
		config.history.trigger('after:page:route', req);
	},

	async route(request) {
		let history = config.history;
		history && history.trigger('before:page:route', request);

		let error = await this._routeCheckIsNotValid(request);
		if (error) return error;

		error = await this._routeCheckBeforeRoute(request);
		if (error) return error;

		error = await this._routeCheckStart(request);
		if (error.isError()) return error;

		this.triggerMethod('route', request);
		if (history) {
			history.trigger('page:route', request);
			history.trigger('after:page:route', request);
		}
	},

	async _routeCheckIsNotValid(request) {
		let validateResult = await this._isNotAvailableAsync({ for: 'route', request });
		let validateError = validateResult.errOrVal();
		if (validateError) {
			this._onRouteError(validateError, request);
			return validateError;
		}
	},

	async _routeCheckBeforeRoute(request) {
		let res = await this.triggerMethodAsync('before:route', request);
		if (res.isError()) {
			let err = res.err();
			this._onRouteError(err, request);
			return err;
		}
	},

	async _routeCheckStart(request) {
		let pageResult = await this.startAsync(request);
		if (pageResult.isError()) {
			let err = pageResult.err();
			this._onRouteError(err, request);
			//return err;
		}
		return pageResult;
	},

	getRouter() {
		return this.router;
	},
	getApp() {
		return this.app;
	}
};
