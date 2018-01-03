import Mn from 'backbone.marionette';
import YatPage from './YatPage';
import YatApp from './YatApp';
import YatObject from './YatObject';
import YatError from './YatError';


const marionetteYat = {
  greet() {
    return 'hello';
  },
  Error: YatError,
  Object: YatObject,
  App: YatApp,
  Page : YatPage,
};

Mn.Yat = marionetteYat;

export default marionetteYat;
