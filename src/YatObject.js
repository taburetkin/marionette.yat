import Mn from 'backbone.marionette';
import mixin from './helpers/mix.js';
import GetOptionProperty from './mixins/get-option-property.js';
import Radioable from './mixins/radioable.js';

export default mixin(Mn.Object).with(GetOptionProperty, Radioable);
