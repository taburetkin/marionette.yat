import { MnObject } from 'backbone.marionette';
import mix from '../utils/mix';
import commonMixin from '../mixins/commonMixin';

export default mix(MnObject).with(commonMixin);
