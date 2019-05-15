global.chai = require('chai');
global.sinon = require('sinon');
global.chai.use(require('sinon-chai'));

require('babel-core/register');
require('./setup')();

/*
	Uncomment the following if your library uses features of the DOM,
	for example if writing a jQuery extension, and
	add 'simple-jsdom' to the `devDependencies` of your package.json

  Note that JSDom doesn't implement the entire DOM API. If you're using
  more advanced or experimental features, you may need to switch to
  PhantomJS. Setting that up is currently outside of the scope of this
  boilerplate.
*/
// var simpleJSDom = require('simple-jsdom');
// simpleJSDom.install();
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM('<!DOCTYPE html>');
global.window = window;
global.document = window.document;
