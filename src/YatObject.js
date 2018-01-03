import Mn from 'backbone.marionette';
import mixin from './helpers/mixin.js';
import GetOptionProperty from './mixins/get-option-property.js';

export default class extends mixin(Mn.Object).with(GetOptionProperty){
	constructor(...args){ super(...args); }
}