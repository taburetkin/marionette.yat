const _ = require('underscore');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiPromise = require('chai-as-promised');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM('<!DOCTYPE html><html><body>  </body></html>');
global.window = dom.window;
global.document = dom.window.document;

chai.use(chaiPromise);
chai.use(sinonChai);

global.chai = chai;
global.sinon = sinon;

global._ = _;

global.expect = global.chai.expect;

beforeEach(function() {
	this.sinon = global.sinon.createSandbox();
});

afterEach(function() {
	this.sinon.restore();
});
