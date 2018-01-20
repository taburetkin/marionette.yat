# marionette.yat

[![Join the chat at https://gitter.im/marionette-yat/Lobby](https://badges.gitter.im/marionette-yat/Lobby.svg)](https://gitter.im/marionette-yat/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

The goal of Marionette Yet Another Toolkit is
* allow to make things via mixins.
* extend default functionality with some useful things

Simple App with pages, modals*, popovers*, and common ui*.

marked with asterisk is not yet implemented.


## Examples
* [Page and PageManager](https://codepen.io/dimatabu/full/opGPoQ) - simple application with pages.
* [sort CollectionView by drag'n'drop](https://codepen.io/dimatabu/pen/JMaZXP)

## table of contents 

* [`behaviors`](/src/behaviors)
	* `behavior`
	* `draggable`
	* `dynamic-class`
	* `form-to-hash`
	* `sort-by-drag`
* [`functions`](/src/functions)
	* [`common`](/src/functions/common)
		* [`flatten-unflatten`](/src/functions/common/flatten-unflatten)
			* `flatten-object`
			* `unflatten-object`
		* [`set-get-by-path`](/src/functions/common/set-get-by-path)
			* `get-by-path`
			* `set-by-path`
		* `get-label`
		* `get-name`
		* `get-value`
		* `unwrap`
		* `wrap`
	* [`view`](/src/functions/view)
		* `compare-ab`
		* `view-comparator`
* [`helpers`](/src/helpers)
	* `isKnownCtor`
	* `mix`
* [`mixins`](/src/mixins)
	* `childrenable`
	* `get-name-label`
	* `get-option-property`
	* `global-template-context`
	* `radioable`
	* `startable`
	* `stateable`
* [`models`](/src/models)
	* `link`
	* `model`
* [`singletons`](/src/singletons)
	* `drag-and-drop`
	* `identity`
	* `template-context`
* `YatApp`
* `YatCollectionView`
* `YatError`
* `YatModal`
* `YatObject`
* `YatPage`
* `YatPageManager`
* `YatRouter`
* `YatView`

[![Travis build status](http://img.shields.io/travis/taburetkin/marionette.yat.svg?style=flat)](https://travis-ci.org/taburetkin/marionette.yat)
[![Code Climate](https://codeclimate.com/github/taburetkin/marionette.yat/badges/gpa.svg)](https://codeclimate.com/github/taburetkin/marionette.yat)
[![Test Coverage](https://codeclimate.com/github/taburetkin/marionette.yat/badges/coverage.svg)](https://codeclimate.com/github/taburetkin/marionette.yat)
[![Dependency Status](https://david-dm.org/taburetkin/marionette.yat.svg)](https://david-dm.org/taburetkin/marionette.yat)
[![devDependency Status](https://david-dm.org/taburetkin/marionette.yat/dev-status.svg)](https://david-dm.org/taburetkin/marionette.yat#info=devDependencies)
