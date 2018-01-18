import _ from 'underscore';
import Mn from 'backbone.marionette';
import mix from './helpers/mix';
import GlobalTemplateContext from './mixins/global-template-context';
export default mix(Mn.View).with(GlobalTemplateContext);
