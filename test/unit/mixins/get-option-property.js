import Mn from 'backbone.marionette';
import mixin from '../../../src/helpers/mix.js';
import GetOptionProperty from '../../../src/mixins/get-option-property.js';

// class TestClass extends mixin(Mn.Object).with(GetOptionProperty){
// 	constructor(...args){
// 		super(...args);
// 		this.prop0 = 111;
// 		this.prop1 = 12;
// 		this.prop3 = 'instance';		
// 	}
// 	prop2(){
// 		return this.getProperty('prop0') + this.getProperty('prop1');
// 	}
// }
let testFunc1 = () => 'from function';
let testFunc2 = () => 'from function in options';
let TestClass = mixin(Mn.Object).with(GetOptionProperty).extend({
	propertyValue: 'instance',
	propertyFunction: testFunc1,
	propertyClass: Mn.Object,
	propertyFunction2: (a,b) => 'from function' + a + '-' + b,
});


describe('get-option-property mixin', function(){
	

	let test = new TestClass({
		propertyValue: 'options',
		propertyFunction: testFunc2,
		optionsFunction: testFunc2,
		additional:'additional'
	});

	describe('getProperty', () => {
		it('should return instance property if its exists', () => {
			expect(test.getProperty('propertyValue')).to.be.equal('instance');
		});
		it('should return options property if instance property is not exists', () => {
			expect(test.getProperty('additional')).to.be.equal('additional');
		});		

		it('should return function value if instance property is a function', () => {
			expect(test.getProperty('propertyFunction')).to.be.equal('from function');
		});
		it('should return function value if instance property is undefined and options value is a function', () => {
			expect(test.getProperty('optionsFunction')).to.be.equal('from function in options');
		});			

		it('should return class definition if instance property is a class definition', () => {
			expect(test.getProperty('propertyClass')).to.be.equal(Mn.Object);
		});


		it('should return function if instance property is a function and force option is false', () => {
			expect(test.getProperty('propertyFunction',{force:false})).to.be.equal(testFunc1);
		});		
		it('should return undefined if instance property is not set and deep option is false', () => {
			expect(test.getProperty('additional',{deep:false})).to.be.equal(undefined);
		});	
		it('should pass arguments if property is a function and args option is set', () => {
			expect(test.getProperty('propertyFunction2',{args:['a','b']})).to.be.equal('from functiona-b');
		});	
		it('should return default value if properties values undefined and default option is set', () => {
			expect(test.getProperty('not-exists-property',{default:'default value'})).to.be.equal('default value');
		});			

	
	});

	describe('getOption', () => {
		it('should return options property if its exists', () => {
			expect(test.getOption('propertyValue')).to.be.equal('options');
		});
		it('should return instance property if options property is not exists', () => {
			expect(test.getOption('propertyFunction2',{args:['','']})).to.be.equal('from function-');
		});		

		it('should return function value if options property is a function', () => {
			expect(test.getOption('optionsFunction')).to.be.equal('from function in options');
		});

		it('should return function value if options property is undefined and instance property value is a function', () => {
			expect(test.getOption('propertyFunction2',{args:['','']})).to.be.equal('from function-');
		});			

		it('should return class definition if options property is a class definition', () => {
			expect(test.getOption('propertyClass')).to.be.equal(Mn.Object);
		});


		it('should return function if options property is a function and force option is false', () => {
			expect(test.getOption('optionsFunction',{force:false})).to.be.equal(testFunc2);
		});		
		it('should return undefined if options property is not set and deep option is false', () => {
			expect(test.getOption('go-go-go',{deep:false})).to.be.equal(undefined);
		});	
		it('should pass arguments if property is a function and args option is set', () => {
			expect(test.getOption('propertyFunction2',{args:['','']})).to.be.equal('from function-');
		});	
		it('should return default value if properties values undefined and default option is set', () => {
			expect(test.getOption('not-exists-property',{default:'default value'})).to.be.equal('default value');
		});			

	
	});

});
