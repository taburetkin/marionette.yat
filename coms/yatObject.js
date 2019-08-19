import { MnObject } from 'backbone.marionette';
import { mixWith } from '../utils/mix';
import commonMixin from '../mixins/commonMixin';

MnObject.mixWith = mixWith;

export default MnObject.mixWith(commonMixin);
