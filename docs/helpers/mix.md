# mixin
Extends a Class with mixins.

## use
`let newClass = mix(BaseClass).with(Mixin1, Mixin2)`

## mix(arg)
argument can be a class definition or simple object.


## with(...args)
argument can be an object hash or function that returns extended class.
order of mixins is left to right and class prototype always last.



## how to define own mixin
my-mixin.js
```js
export default (Base) => Base.extend({
	/* mixin properties and methods */
});
```

## example
```js

import Mixins from 'marionette.yat';
let mix = Mixins.mix;

let JustHash = {
	hashProperty:1
}

let mymixin = (BaseClass) => BaseClass.extend({
	myMixinMethod(){ }
});


let MyMixedClass = mix(BaseClass).with(JustHash, mymixin).extend({
	methodB(){}
});

/*

this will result in mixed class
{
	...BaseClass methods and properties
	hashProperty,
	myMixinMethod(),
	methodB()
}

*/

```
