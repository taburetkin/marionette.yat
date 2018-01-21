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

## marionette.yat content 
* [behaviors](./src/behaviors)
	* [behavior](/docs/behaviors/behavior.md)
	* [draggable](/docs/behaviors/draggable.md)
	* [dynamic-class](/docs/behaviors/dynamic-class.md)
	* [form-to-hash](/docs/behaviors/form-to-hash.md)
	* [sort-by-drag](/docs/behaviors/sort-by-drag.md)
* [functions](./src/functions)
	* [common](./src/functions/common)
		* [flatten-unflatten](./src/functions/common/flatten-unflatten)
			* flatten-object
			* unflatten-object
		* [set-get-by-path](./src/functions/common/set-get-by-path)
			* get-by-path
			* set-by-path
		* [get-label](/docs/functions/common/get-label.md)
		* [get-name](/docs/functions/common/get-name.md)
		* [get-value](/docs/functions/common/get-value.md)
		* [unwrap](/docs/functions/common/unwrap.md)
		* [wrap](/docs/functions/common/wrap.md)
	* [view](./src/functions/view)
		* [compare-ab](/docs/functions/view/compare-ab.md)
		* [view-comparator](/docs/functions/view/view-comparator.md)
* [helpers](./src/helpers)
	* [isKnownCtor](/docs/helpers/isKnownCtor.md)
	* [mix](/docs/helpers/mix.md)
* [mixins](./src/mixins)
	* [childrenable](/docs/mixins/childrenable.md)
	* [get-name-label](/docs/mixins/get-name-label.md)
	* [get-option-property](/docs/mixins/get-option-property.md)
	* global-template-context
	* [radioable](/docs/mixins/radioable.md)
	* [startable](/docs/mixins/startable.md)
	* [stateable](/docs/mixins/stateable.md)
* [models](./src/models)
	* link
	* model
* [singletons](./src/singletons)
	* drag-and-drop
	* identity
	* template-context
* [YatApp](/docs/YatApp.md)
* YatCollectionView
* [YatError](/docs/YatError.md)
* YatModal
* [YatObject](/docs/YatObject.md)
* [YatPage](/docs/YatPage.md)
* [YatPageManager](/docs/YatPageManager.md)
* [YatRouter](/docs/YatRouter.md)
* YatView

[![Travis build status](http://img.shields.io/travis/taburetkin/marionette.yat.svg?style=flat)](https://travis-ci.org/taburetkin/marionette.yat)
[![Code Climate](https://codeclimate.com/github/taburetkin/marionette.yat/badges/gpa.svg)](https://codeclimate.com/github/taburetkin/marionette.yat)
[![Test Coverage](https://codeclimate.com/github/taburetkin/marionette.yat/badges/coverage.svg)](https://codeclimate.com/github/taburetkin/marionette.yat)
[![Dependency Status](https://david-dm.org/taburetkin/marionette.yat.svg)](https://david-dm.org/taburetkin/marionette.yat)
[![devDependency Status](https://david-dm.org/taburetkin/marionette.yat/dev-status.svg)](https://david-dm.org/taburetkin/marionette.yat#info=devDependencies)
