# mixin
Extends a Class with mixins.

## use
`class MyClass extends mixin(BaseClass).with(mixin1, mixin2, ..., mixinN){}`

## with(...args)
argument can be an object hash or function that returns extended class.

order of mixins is left to right and class prototype always last.



## how to define own mixin
my-mixin.js
```js
export default (Base) => class extends Base {
	MyMixinLogic(){
		//logic
	}
}
```

## example
```js

import Mixins from 'marionette.yat';
let mixin = Mixins.mixin;

let JustHash = {
	hashProperty:1
}

let mymixin = (BaseClass) => class extends BaseClass {
	myMixinMethod(){

	}
	
}

class MyClassBase {
	methodA(){}
}

class MyMixedClass extends mixin(MyClassBase).with(JustHash, mymixin) {
	methodB(){}
}

/*

this will result in mixed class
{
	methodA(),
	hashProperty,
	myMixinMethod(),
	methodB()
}

*/

```
