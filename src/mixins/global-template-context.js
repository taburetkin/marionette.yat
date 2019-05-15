import _ from 'underscore';
import TemplateContext from '../singletons/template-context';

export default (Base) => Base.extend({
	mixinTemplateContext(target = {}) {
		
		var templateContext = TemplateContext.mix(_.result(this, 'templateContext'), this);
		
		return _.extend(target, templateContext);
	},
})
