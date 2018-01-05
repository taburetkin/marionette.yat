import YatObject from '../../../src/YatObject';
import mixin from '../../../src/helpers/mixin.js';
import Startable from '../../../src/mixins/startable.js';

class TestClass extends mixin(YatObject).with(Startable){
	constructor(...args){ super(...args); }
}


describe('Startable mixin', function(){
	
	// beforeEach(() => {
	// 	this.testObject = new TestClass();
	// });

	describe('Startable Class', () => {
		it('should be Stateable', () => {
			expect(TestClass.Stateable).to.be.equal(true);
		});
		it('should have static Startable property equal to true', () => {
			expect(TestClass.Startable).to.be.equal(true);
		});
	});

	describe('Startable Instance', () => {
		let testObject = null;
		beforeEach(() => { 
			testObject = new TestClass()
			spy(testObject, '_getStartPromise');
			spy(testObject, 'triggerStart');
			spy(testObject, 'triggerStop');
		});
		
		it('should switch life state to starting in `start` process', () => {
			testObject.start();
			expect(testObject._getLifeState()).to.be.equal('starting');
		});

		it('should switch life state to running after `start` process', () => {
			return testObject.start().then(() => {
				expect(testObject._getLifeState()).to.be.equal('running');
			});
		});
		
		it('should successfully call `_getStartPromise` on `start`', () => {
			testObject.start();
			expect(testObject._getStartPromise).to.have.been.calledOnce;
		});
		it('should successfully call `triggerStart` on `start`', () => {
			return testObject.start().then(() => {
				expect(testObject.triggerStart).to.have.been.calledOnce
			});
		});
		it('should successfully call `triggerStop` on `stop`', () => {
			return testObject.start().then(() => testObject.stop()).then(() => {
				expect(testObject.triggerStop).to.have.been.calledOnce
			});
		});
	});

});
