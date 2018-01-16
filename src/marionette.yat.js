import {version} from '../package.json';
import Functions from './functions/functions';
import Helpers from './helpers/Helpers';
import Mixins from './mixins/Mixins';
import Behaviors from './behaviors/behaviors';
import Singletons from './singletons/singletons';
import YatObject from './YatObject';
import YatError from './YatError';
import identity from './YatIdentity';
import YatApp from './YatApp';
import YatRouter from './YatRouter';
import YatPage from './YatPage';
import YatPageManager from './YatPageManager';


const marionetteYat = {
	VERSION: version,
	Functions: Functions,
	Helpers: Helpers,
	Mixins: Mixins,
	Behaviors: Behaviors,
	Singletons: Singletons,
	Object: YatObject,
	Error: YatError,
	App: YatApp,
	Page : YatPage,
	Router: YatRouter,
	PageManager: YatPageManager,
	identity: identity,
};

export default marionetteYat;
