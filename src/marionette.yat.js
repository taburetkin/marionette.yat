import {version} from '../package.json';
import Mixins from './mixins/Mixins';
import Helpers from './helpers/Helpers';
import YatPage from './YatPage';
import YatApp from './YatApp';
import YatObject from './YatObject';
import YatError from './YatError';
import YatRouter from './YatRouter';
import YatPageManager from './YatPageManager';

const marionetteYat = {
	VERSION: version,
	Helpers: Helpers,
	Mixins: Mixins,
	Error: YatError,
	Object: YatObject,
	App: YatApp,
	Page : YatPage,
	Router: YatRouter,
	PageManager: YatPageManager,
};

// 2050 lines (1550 sloc)  70.9 KB

export default marionetteYat;
