import mix from '../../../src/helpers/mix.js';
import _ from 'underscore'

describe('mix', function(){
	describe('mix(something)',() => {
		let hashA = {a:1};
		let hashB = {b:2};
		let classA = function(){ this.c = 3 };

		let mixResult = mix(hashA);
		let mixResultCls = mix(classA);
		
		it('should return wrapper object',() => {
			expect(mixResult).to.be.an('object');
		});
		it('should has `class` property',() => {
			expect(mixResult).to.have.property('class');			
		});
		it('should has `with` method',() => {
			expect(mixResult.with).to.be.a('function');
		});

		it('if `something` is object then `class` property should be a class extended by `something`',() => {
			expect(mixResult.class).to.be.a('function');
			expect(mixResult.class.prototype).to.have.property('a');
		});

		it('Class definition returned by `class` should have static extend method if `something` is an object', () => {
			expect(mixResult.class).to.have.property('extend');
			expect(mixResult.class.extend).to.be.a('function');
		});

		it('if `something` is a class then `class` property should be a class derived from something',() => {
			expect(mixResultCls.class).to.be.a('function');
			expect(mixResultCls.class.prototype).to.be.instanceof(classA);
		});
		
	});
	describe('mix(something).with(object, object)',() => {
		let hashA = {a:1, b:1, c:1, d:1};
		let hashB = {b:2};
		let hashC = {c:3, d:3};
		let Test = mix(hashA).with(hashB, hashC).extend({
			d:4
		});
		let test = new Test();
		it('should mix all properites in left to right order', () => {
			expect(test).to.have.property('a',1);
			expect(test).to.have.property('b',2);
			expect(test).to.have.property('c',3);
			expect(test).to.have.property('d',4);
		});
	});
	describe('mix(Class).with(mixinFunc1, mixinFunc2)',() => {
		let hashA = {a:5};
		let mixin1 = (Base) => Base.extend({m1:1, m2:1},{staticM1:1, staticM2:1});
		let mixin2 = (Base) => Base.extend({m2:2},{staticM2:2});
		let Class = function(){this.m0 = 0};
		Class.staticM0 = 0;
		let Test = mix(Class).with(mixin1, hashA, mixin2);
		let test = new Test();
		it('should mix all properites in left to right order from mixins', () => {
			expect(test).to.have.property('m1',1);
			expect(test).to.have.property('m2',2);
		});
		it('should mix object properties too', () => {
			expect(test).to.have.property('a',5);
		});
		it('should mix static fields', () => {
			expect(Test).to.have.property('staticM0',0);
			expect(Test).to.have.property('staticM1',1);
			expect(Test).to.have.property('staticM2',2);
		});
		it('should be instance of Base class',() => {
			expect(test).to.be.instanceof(Class);
		});
	});	
});
