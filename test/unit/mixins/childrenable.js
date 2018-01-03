import _ from 'underscore';
import YatObject from '../../../src/YatObject';
import mixin from '../../../src/helpers/mixin.js';
import Childrenable from '../../../src/mixins/childrenable.js';

let Obj = YatObject.extend({
	initialize(){
		console.log(this.getName());
	}
});

class BaseTestClass extends mixin(Obj).with(Childrenable){
	constructor(...args){ super(...args); }	
}

const ChildClass$1 = BaseTestClass.extend({
	name:'child $1',	
});

const ChildClass$2 = BaseTestClass.extend({
	name:'child $2',
	children(){ 
		return [ChildClass$1.extend({name:undefined}),ChildClass$1.extend({name:undefined})]
	}
});


const RootClass = BaseTestClass.extend({
	name:'root',
	children(){
		return [ChildClass$1, ChildClass$2, () => { return  BaseTestClass.extend({name:'child $3'}) }];
	}
});

describe('Childrenable mixin', function(){
	describe('Childrenable class',() =>{
		it('extended Childrenable should have static Childrenable field equal to true',()=>{
			expect(ChildClass$1.Childrenable).to.be.equal(true);
		});			
	});
	describe('Childrenable instance',() =>{

		const root = new RootClass();
	
		it('on initialize should initialize childrens and `hasChildren` should return true', () => {
			expect(root.hasChildren()).to.be.equal(true);
		});


	});
	
});