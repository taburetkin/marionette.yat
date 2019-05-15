import _ from 'underscore';
import History from '../../../routing/history';
import Router from '../../../routing/router';
import Page from '../../../routing/page';
import config from '../../../routing/config';
import Location from './location';

const ChildPage = Page.extend({
	onStart() {
		console.log(this.getOption('name') || this.getDefaultRoute().route, 'routed.');
	}
});
const RootPage = Page.extend({
	routes: '',
	childPage: ChildPage,
	onStart() {
		console.log('root routed');
	},
	children: [
		{
			routes: 'articles',
			children: [
				{
					onBeforeRoute() {
						return Promise.reject('not:allowed');
					},
					routes: ['cats', 'cats/:id/:name'],
				},
				{
					routes: 'dogs',
				},
			]
		},
		{
			routes: 'accs',
		},
	]
});

describe('Page', function() {
	const location = new Location('http://example.com/#asd');
	const history = config.history = new History();
	history.location = location;
	//console.log('frag', history.getFragment());
	const router = new Router();
	router.on('all', (c,e,d) => console.log('	r->', c,e,d));
	beforeEach(function() {
		let root = new RootPage({ router });
		root.ready();
		history.start();
	});
	afterEach(function() {
		history.stop();
	});
	it('test', function() {
		// location.replace('http://example.com/#articles/cats/orange/manyu?qwe=asd&foo=bar&foo=baz');
		// history.checkUrl();
	});
});
