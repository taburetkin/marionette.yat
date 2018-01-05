import Mn from 'backbone.marionette';
import YatPage from './YatPage';
import YatApp from './YatApp';
import YatObject from './YatObject';
import YatError from './YatError';
import YatRouter from './YatRouter';
import YatPageManager from './YatPageManager';
import Mixins from './mixins/Mixins';
import Helpers from './helpers/Helpers';

const marionetteYat = {
	Helpers: Helpers,
	Mixins: Mixins,
	Error: YatError,
	Object: YatObject,
	App: YatApp,
	Page : YatPage,
	Router: YatRouter,
	PageManager: YatPageManager,
};

Mn.Yat = marionetteYat;

export default marionetteYat;
