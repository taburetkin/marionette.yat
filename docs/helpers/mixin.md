# mixin
Can mix into class: objects, `Func<Class>`

```js

import mixin from './helpers/mixin'

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

class MyMixedClass extends mixin(MyClassBase).with(JsutHash, mymixin) {
	methodB(){}
}


```


this will result in mixed class

```
{
	methodA(),
	hashProperty,
	myMixinMethod(),
	methodB()
}
```