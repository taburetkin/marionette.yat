import {version} from '../package.json';
import Functions from './functions/functions';
import Helpers from './helpers/Helpers';
import Mixins from './mixins/Mixins';
import Behaviors from './behaviors/behaviors';
import Singletons from './singletons/singletons';
import TemplateContext from './singletons/template-context';
import modals from './singletons/modals/modals';
import identity from './singletons/identity';
import yatConfig from './YatConfig';
import YatObject from './YatObject';
import YatError from './YatError';
import YatApp from './YatApp';
import YatRouter from './YatRouter';
import YatPage from './YatPage';
import YatPageManager from './YatPageManager';
import YatView from './YatView';
import YatCollectionView from './YatCollectionView';

import YatModel from './models/model';
import YatCollection from './models/collection';

import CollectionGroups from './YatCollectionGroups';


const marionetteYat = {
	VERSION: version,
	Functions: Functions,
	Helpers: Helpers,
	Mixins: Mixins,
	Behaviors: Behaviors,
	Singletons: Singletons,
	TemplateContext: TemplateContext,
	modals: modals,
	identity: identity,
	createConfig: yatConfig,
	Object: YatObject,
	Error: YatError,
	App: YatApp,
	Page : YatPage,
	Router: YatRouter,
	PageManager: YatPageManager,
	View: YatView,
	CollectionView: YatCollectionView,
	Model: YatModel,
	Collection: YatCollection,
	CollectionGroups, 
};

export default marionetteYat;
