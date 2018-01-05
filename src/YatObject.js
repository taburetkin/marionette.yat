import Mn from 'backbone.marionette';
import mixin from './helpers/mixin.js';
import GetOptionProperty from './mixins/get-option-property.js';
import Radioable from './mixins/radioable.js';

export default class extends mixin(Mn.Object).with(GetOptionProperty, Radioable){
	constructor(...args){ super(...args); }
}