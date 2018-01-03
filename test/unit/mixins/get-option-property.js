import Mn from 'backbone.marionette';
import mixin from '../../../src/helpers/mixin.js';
import GetOptionProperty from '../../../src/mixins/get-option-property.js';

class TestClass extends mixin(Mn.Object).with(GetOptionProperty){
	constructor(...args){
		super(...args);
		this.prop0 = 111;
		this.prop1 = 12;
		this.prop3 = 'instance';		
	}
	prop2(){
		return this.getProperty('prop0') + this.getProperty('prop1');
	}
}

describe('get-option-property mixin', function(){
	
	this.testObject = new TestClass({
		prop0: 1111,
		prop1: 123,
		prop2:() => this.getOption('prop0') + this.getOption('prop1'),
		prop4: 'options'
	});

	// beforeEach(() => {
	// 	this.testObject = new TestClass();
	// });

	describe('getProperty', () => {
		it('should return options property if undefined', () => {
			expect(this.testObject.getProperty('prop4')).to.be.equal('options');
		});
		it('should return undefined if property is not exists in instance and options', () => {
			expect(this.testObject.getProperty('prop5')).to.be.equal(undefined);
		});			
		it('should return property result if its a function', () => {
			expect(this.testObject.getProperty('prop2')).to.be.equal(123);
		});
		it('should return value if a property is function and `force` is false', () => {
			expect(this.testObject.getProperty('prop2',{force:false})).to.be.a('function');
		});		
		it('should return undefined if a property is not exists and `deep` is false', () => {
			expect(this.testObject.getProperty('prop4',{deep:false})).to.be.equal(undefined);
		});		
	});

	describe('getOption', () => {
		it('should return instance property if undefined', () => {
			expect(this.testObject.getOption('prop3')).to.be.equal('instance');
		});
	});

});