import {version} from '../package.json';
import Helpers from './helpers/Helpers';
import Mixins from './mixins/Mixins';
import YatObject from './YatObject';
import YatError from './YatError';
import identity from './YatIdentity';
import YatApp from './YatApp';
import YatRouter from './YatRouter';
import YatPage from './YatPage';
import YatPageManager from './YatPageManager';


const marionetteYat = {
	VERSION: version,
	Helpers: Helpers,
	Mixins: Mixins,
	Object: YatObject,
	Error: YatError,
	App: YatApp,
	Page : YatPage,
	Router: YatRouter,
	PageManager: YatPageManager,
	identity: identity,
};

export default marionetteYat;
