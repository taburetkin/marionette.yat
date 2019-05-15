import mixin from '../../../src/helpers/mixin.js';

const hashMixin = {
	test(){
		return 'hashMixin:test';
	}
}
const hashMixin2 = {
	test2(){
		return 'hashMixin2:test';
	}
}
const classMixin = (Base) => class extends Base {
	constructor(){
		super();
		this.mixinInitialized = true;
	}
	test(){
		return 'classMixin:test';
	}
	test2(){
		return 'classMixin:test2';
	}
	test3(){
		return 'classMixin:test3';
	}
}

class BaseClass {
	test() {
		return 'baseClass:test'
	}
}


describe('mixin', function(){
	beforeEach(() => {
		this.TestClass = class extends mixin(BaseClass).with(hashMixin, hashMixin2, classMixin){
			test(){
				return 'testClass:test';
			}
		}
	});
	describe('Mixined Class definition', () => {
		it('should return class after mixins', () => {
			expect(this.TestClass).to.be.a('function');
		});
		it('instance should be an instance of BaseClass', () => {
			expect(new this.TestClass() instanceof BaseClass).to.be.equal(true);
		});
	});

	describe('Mixined instance', () => {
		beforeEach(() => {
			this.myTestObject = new this.TestClass();
		});

		it('own properties should override mixins ones', () => {
			expect(this.myTestObject.test()).to.be.equal('testClass:test');
		});

		it('should have mixins properties', () => {
			expect(this.myTestObject.test2).to.be.a('function');
		});
	
		it('check for function mixin', () => {
			expect(this.myTestObject.mixinInitialized).to.be.equal(true);
		});	

		it('last mixin in chain should override previous', () => {
			expect(this.myTestObject.test2()).to.be.equal('classMixin:test2');
		});		

	});


});
