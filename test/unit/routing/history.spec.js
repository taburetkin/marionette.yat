import _ from 'underscore';
import History from '../../../routing/history';
import Router from '../../../routing/router';
import config from '../../../routing/config';
import Location from './location';

describe('History', function() {
	const location = new Location('http://example.com');
	const history = config.history = new History();
	const router = new Router();
	history.localtion = location;
	beforeEach(function() {
		//router.route('', () => console.log('in root'));
		history.start();
	});
	afterEach(function() {
		history.stop();
	});
	it('test', function() {
		// console.log('+++', history.isStarted());
	});
});
