import mix from '../utils/mix';
import beforeFirstRender from './beforeFirstRenderMixin';
import beforeInitialize from './beforeInitializeMixin';
import commonMixin from './commonMixin';
import classNamesMixin from './classNamesMixin';
import viewTitleMixin from './viewTitleMixin';

const commonViewMixin = Base => mix(Base).with(commonMixin, beforeFirstRender, beforeInitialize, classNamesMixin, viewTitleMixin);

export default commonViewMixin;
