import YatObject from '../../coms/yatObject';
import routesMixin from './routes-mixin';
import childrenMixin from './children-mixin';
import urlMixin from './url-mixin';
import viewMixin from './view-mixin';

import { startableMixin } from '../../coms/startable';
import mix from '../../utils/mix';

const BasePage = mix(YatObject).with(startableMixin, routesMixin, childrenMixin, urlMixin, viewMixin);
export default BasePage;
