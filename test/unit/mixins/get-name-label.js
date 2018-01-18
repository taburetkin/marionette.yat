import Mn from 'backbone.marionette';
import mixin from '../../../src/helpers/mix.js';
import GetNameLabel from '../../../src/mixins/get-name-label.js';



describe('get-name-label mixin', function(){
	

	
	describe('exclude', () => {
		let TestClass = mixin(Mn.Object).with(GetNameLabel).extend({
		});
		let test = new TestClass({});
		it('should return cid if there is nothing to return', () => {
			expect(test.getLabel()).to.be.equal(test.cid);
		});
	
	});


});
