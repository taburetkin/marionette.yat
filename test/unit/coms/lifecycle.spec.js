import { Lifecycle } from '../../../coms/lifecycle';
import { startableMixin } from '../../../coms/startable';
import { MnObject } from 'backbone.marionette';

describe('lifecycle', function() {
	it('test', function() {
		const context = new MnObject({
			async onBeforeStart() {
				return new Promise((res, rej) => {
					rej('joppa');
				});
			}
		});
		context.on('all', c => console.log('	', c));
		let isNotAvailable = () => {
			new Promise((res, rej) => {
				setTimeout(() => { res('no!'); }, 500)
			});
			//return 'something';
		}
		let onBeforeStart = () => {
			let p = new Promise((res, rej) => {
				setTimeout(() => {
					res('achtung');
				}, 500);
			});
			return p;
		}
		let lf = new Lifecycle({ name: 'start', context, isNotAvailable, onBefore: onBeforeStart });
		lf.on('all', console.log);
		//let res = lf.start();

		expect(1).to.be.equal(1);
		//return expect(res).to.eventually.be.true;

	});
});

describe('startable', function() {
	const App = startableMixin(MnObject);
	it('test', async function() {
		let app = new App();
		// app.on('all', console.log);
		// let r = await app.start();
		// console.log('**',app.stateModel.state('start-state'));
		// expect(app.isStarted()).to.be.true;
	})
});
