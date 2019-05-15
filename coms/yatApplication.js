import _ from 'underscore';
import { Application } from '../vendors';
import mix from '../utils/mix';
import commonMixin from '../mixins/commonMixin';
import startableMixin from './startable/startable-mixin';
import routingConfig from '../routing/config';
import Backbone from 'backbone';

const YatApplication = mix(Application).with(commonMixin, startableMixin);

export default YatApplication.extend({
	resolveStartPromises() {
		let promises = this._startPromises || [];
		let proms = this.getOption('startPromises') || [];
		if (!_.isArray(promises)) {
			promises = [promises];
		}
		promises.push(...proms);

		promises = _.map(promises, prom => {
			if (_.isFunction(prom)) {
				return prom();
			} else {
				return prom;
			}
		});

		return Promise.all(promises);
	},

	onBeforeStart() {
		return this.resolveStartPromises();
	},

	addStartPromise(...args) {
		!this._startPromises && (this._startPromises = []);
		this._startPromises.push(...args);
	},

	//adds promise to startPromises and sets resolve and reject handlers
	waitFor(promise, onResolve, onReject) {
		promise.then(onResolve, onReject)
		return this.addStartPromise(promise);
	},
	createHistory(options = {}) {
		if (this.history) return;
		let History = this.getOption('History') || options.History;
		let history = this.getOption('history') || options.history || routingConfig.history || Backbone.history;
		routingConfig.history = History
			? new History()
			: history;
		this.history = Backbone.history = routingConfig.history;
	},

	startHistory(options = {}) {
		_.defaults(options, { pushState: this.pushState });
		this.createHistory(options);

		this._bindRoutingEvents();

		let opts = _.omit(options, 'History', 'history');
		this.history.start(opts);
	},
	stopHistory() {
		this.history.stop();
		this._unbindRoutingEvents();
	},

	_bindRoutingEvents() {
		if (this._routingEventsInitialized) return;
		let routingEvents = this.getOption('routingEvents');
		this.bindEvents(this.history, routingEvents);
	},
	_unbindRoutingEvents() {
		this._routingEventsInitialized = false;
		this.off(this.history);
	},

	getCurrentPageRequest() {
		return this.currentPageRequest;
	},
	getCurrentPage() {
		let req = this.getCurrentPageRequest();
		return req && req.page;
	},
	setCurrentPageRequest(req, { shouldStopCurrentPage } = {}) {
		if (shouldStopCurrentPage) {
			this.stopCurrentPage();
		}
		this.currentPageRequest = req;
	},
	stopCurrentPage() {
		let page = this.getCurrentPage();
		page && page.stop();
	},

});
