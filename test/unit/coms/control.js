import Control from '../../../coms/controls/control';

describe('Control', function() {
	describe('when initialized', function() {
		let control;
		beforeEach(function() {
			control = new Control({ value: 'initial' });
		});
		it('should fill value when initialized with value', async function() {
			expect(control.getValue()).be.equal('initial');
		});
		it('should fill initialValue when initialized with value', async function() {
			expect(control.getValue({ type: 'initial' })).be.equal('initial');
		});
		it('should fill initialValue when initialized with initialValue', async function() {
			control = new Control({ initialValue: 'annushka'})
			expect(control.getValue({ type: 'initial' })).be.equal('annushka');
		});
		it('should fill resetValue when initialized with resetValue', async function() {
			control = new Control({ resetValue: 'gorbun'})
			expect(control.getValue({ type: 'reset' })).be.equal('gorbun');
		});
	});
	describe('when value setted', function() {
		let control;
		let onChange;
		let onValid;
		let onInvalid;
		let onDone;
		beforeEach(function() {
			onChange = this.sinon.stub();
			onValid = this.sinon.stub();
			onDone = this.sinon.stub();
			onInvalid = this.sinon.stub();
			control = new Control({ onChange, onValid, onInvalid, onDone });
		});
		it('should fill value with a given value', async function() {
			await control.setValue('krokodil');
			expect(control.getValue()).be.equal('krokodil');
		});
		it('should set ket value with a given key value', async function() {
			await control.setKeyValue('foo','krokodil');
			expect(control.getValue()).be.an('object').and.have.property('foo', 'krokodil');
		});
		it('should merge value with a given object value', async function() {
			await control.mergeValue({ foo: 'krokodil', bar: 'panda' });
			expect(control.getValue()).to.have.property('foo', 'krokodil');
			expect(control.getValue()).to.have.property('bar', 'panda');
		});
		it('should trigger valid and change by default', async function() {
			await control.setValue('krokodil');
			expect(onValid).calledOnce;
			expect(onChange).calledOnce.and.calledAfter(onValid);
		});
		it('should trigger valid and done if changeEvent is done', async function() {
			await control.setValue('krokodil', { changeEvent: 'done' });
			expect(onValid).calledOnce;
			expect(onDone).calledOnce.and.calledAfter(onValid);
		});
	});
	describe('with children', function() {
		let control;
		let childOne;
		let childTwo;
		let onChange;
		beforeEach(function() {
			onChange = this.sinon.stub();
			control = new Control({ onChange });
			childOne = new Control();
			childTwo = new Control();
			control.addChildControl(childOne, { key: 'foo' });
			control.addChildControl(childTwo, { wrapper: true });
		});

		it('should return true in hasChildren', function() {
			expect(control.hasChildren()).to.be.true;
		});

		it('should update key value when child control changes', async function() {
			await childOne.setValue('baraban');
			expect(control.getValue()).to.have.property('foo', 'baraban');
		});

		it('should update properties when wrapped child changes', async function() {
			await childTwo.mergeValue({ bar: 'triangle', baz: 'plate' });
			let value = control.getValue();
			expect(value).to.have.property('bar', 'triangle');
			expect(value).to.have.property('baz', 'plate');
		});

		it('should trigger change when child control changes', async function() {
			await childTwo.mergeValue({ bar: 'triangle', baz: 'plate' });
			expect(onChange).to.be.calledOnce;
		});

	});
});
