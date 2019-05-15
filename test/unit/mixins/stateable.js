import YatObject from '../../../src/YatObject.js';
import mixin from '../../../src/helpers/mixin.js';
import Stateable from '../../../src/mixins/stateable.js';

class TestClass extends mixin(YatObject).with(Stateable){

}


describe('Stateable mixin', function(){

	let testObject = new TestClass();

	describe('Stateable Class', () => {
		it('should have static Stateable property equal to true', () => {
			expect(TestClass.Stateable).to.be.equal(true);
		});
	});
	describe('Stateable Instance', () => {
		it('should return state hash if `getState` called without arguments', () => {
			expect(testObject.getState()).to.be.equal(testObject._state);
		});
		it('should set state property into state hash object if `setState` called with arguments', () => {
			testObject.setState('test',123);
			expect(testObject.getState('test')).to.be.equal(testObject.getState().test);
		});	
		it('should set state properties into state hash object if `setState` called with object argument', () => {
			testObject.setState({'test':1,'test2':2});
			expect(testObject.getState('test') + testObject.getState('test2')).to.be.equal(3);
		});				
	});
});
