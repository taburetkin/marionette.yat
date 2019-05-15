import _ from 'underscore';
import Bb from 'backbone';
import YatObject from '~/src/YatObject';
import mix from '~/src/helpers/mix.js';
import cmn from '~/src/functions/common/common';
import getProperty from '~/src/functions/common/set-get-by-path/_get-property';
import getByPathArray from '~/src/functions/common/set-get-by-path/_get-by-path-array';

let getByPath = cmn.getByPath;
let setByPath = cmn.setByPath;

let Obj = YatObject.extend({
	initialize(){
		//console.log(this.getName());
	}
});

describe('common functions getByPath and setByPath', function(){
	describe('getByPath',() =>{
		let test = {
			'123':123,
			234:234,
			path1:{
				inside: 'i am inside',
				345:'hello'
			},
			2:{
				3:'nice try'
			}
		}
		it('should return undefined if context is not an object',()=>{
			expect(getByPath(undefined,'test')).to.be.equal(undefined);
			expect(getByPath(null,'test')).to.be.equal(undefined);
			expect(getByPath(123,'test')).to.be.equal(undefined);
			expect(getByPath('asd','test')).to.be.equal(undefined);
		});
		it('should return undefined if path is empty or undefined',()=>{
			expect(getByPath(test, '')).to.be.equal(undefined);
			expect(getByPath(test, undefined)).to.be.equal(undefined);
			expect(getByPath(test, null)).to.be.equal(undefined);
			expect(getByPath(test, 'path1.')).to.be.equal(undefined);
		});
		it('should return undefined if path is not found',()=>{
			expect(getByPath(test, 'abc')).to.be.equal(undefined);
			expect(getByPath(test, 'path1.shminside')).to.be.equal(undefined);
			expect(getByPath(test, [])).to.be.equal(undefined);
			expect(getByPath(test, [4,5])).to.be.equal(undefined);
		});
		it('should return context value if path is found',()=>{
			expect(getByPath(test, '123')).to.be.equal(123);
			expect(getByPath(test, 234)).to.be.equal(234);
			expect(getByPath(test, 'path1.inside')).to.be.equal('i am inside');
			expect(getByPath(test, [2,3])).to.be.equal('nice try');
		});

	});
	describe('setByPath',() =>{
		let test = {};
		let model = new Bb.Model();
		let model2 = new Bb.Model();
		model.on('all',(name) => {
			console.log('\r===');
			console.log(name)
			console.log('---');
		});
		it('should return undefined if context is not an object',()=>{
			expect(setByPath(undefined,'test')).to.be.equal(undefined);
			expect(setByPath(null,'test')).to.be.equal(undefined);
			expect(setByPath(123,'test')).to.be.equal(undefined);
			expect(setByPath('asd','test')).to.be.equal(undefined);
		});
		it('should return undefined if path is empty or undefined',()=>{
			expect(setByPath(test, '')).to.be.equal(undefined);
			expect(setByPath(test, undefined)).to.be.equal(undefined);
			expect(setByPath(test, null)).to.be.equal(undefined);
			expect(setByPath(test, 'path1.')).to.be.equal(undefined);
		});
		it('should return settled value', () => {
			//setByPath(test, 'test', model);
			//setByPath(test, 'test.shmest.brest', model2);
			expect(setByPath(test, 'path1.asd', 'yes')).to.be.equal('yes');
		});


		describe('setByPath with backbone models', () => {
			const Model = Bb.Model.extend({
				initialize(attr, opts){
					this.on('change', function(){ this.onChange(); }, this);
					this.on('change:test', function(){ this.onChangeTest(); }, this);
					this.on('change:test:test', function(){ this.onChangeTestTest(); }, this);
					this.on('change:test:test:test', function(){ this.onChangeTestTestTest(); }, this);
				},
				onChange: function(){ },
				onChangeTest: function(){ },
				onChangeTestTest: function(){ },
				onChangeTestTestTest: function(){ },
			});
			beforeEach(function() {
				let model = this.model = new Model();
				spy(model,'onChange');
				spy(model,'onChangeTest');
				spy(model,'onChangeTestTest');
				spy(model,'onChangeTestTestTest');

				let model2 = this.model2 = new Model();
				spy(model2,'onChange');
				spy(model2,'onChangeTest');
				spy(model2,'onChangeTestTest');
				spy(model2,'onChangeTestTestTest');
			});
			it('should trigger change, change:[attribute] event if a context is backbone model',function(){

				setByPath(this.model,'test','test value');				
				expect(this.model.onChange).to.have.been.calledOnce;
				expect(this.model.onChangeTest).to.have.been.calledOnce;
			});
			it('should trigger change, change:[attribute:attribute] event if a context is backbone model',function(){

				setByPath(this.model,'test.test','test value');
				expect(this.model.onChange).to.have.been.calledOnce;
				expect(this.model.onChangeTestTest).to.have.been.calledOnce;
			});
			it('should trigger change, change:[attribute] event on a nested model if it is backbone model',function(){

				let test = {};
				setByPath(test,'test',this.model);
				setByPath(test,'test.test','new value');
				expect(this.model.onChange).to.have.been.calledOnce;
				expect(this.model.onChangeTest).to.have.been.calledOnce;
			});
			it('should trigger change, change:[attribute] event on all nested models',function(){

				let test = {};
				setByPath(this.model,'test.test',this.model2);
				setByPath(this.model,'test.test.test','new value');
				expect(this.model.onChange).to.have.been.calledTwice;
				expect(this.model.onChangeTestTest).to.have.been.calledOnce;
				expect(this.model.onChangeTestTestTest).to.have.been.calledOnce;
				expect(this.model2.onChange).to.have.been.calledOnce;
				expect(this.model2.onChangeTest).to.have.been.calledOnce;
			});
			it('should create normal backbone model property',() => {
				let obj = {};
				let model = new Model();
				let model2 = new Model();
				setByPath(model, 'textfield','text value');
				setByPath(model, 'nested.value',123);
				setByPath(model, 'another',model2);
				setByPath(obj, 'm', model);
				setByPath(obj,'m.another.deep.num',100);

				expect(model.get('textfield')).to.be.equal('text value');
				expect(model.get('nested').value).to.be.equal(123);
				expect(model.get('another')).to.be.equal(model2);
				expect(obj.m).to.be.equal(model);
				expect(obj.m.get('another').get('deep').num).to.be.equal(100);

			});
		});


	});
	
});
