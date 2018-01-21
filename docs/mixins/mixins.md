#mixins
Mixins is a extended functionality. 
Mixin can be an object or a function which returns extended base class.

## example
```js

//old fashion way
let mymixin = {
	methodA(){}
	methodB(){}
}

let MyView = Mn.View.extend(mymixin).extend({
	methodC(){}
});



```

with `mix` helper you can define mixins as a functions

```js
//the old one
let oldmixin = {
	methodA(){}
	methodB(){}
}

//function mixin
let mymixin1 = (Base) => Base.extend({
	methodC(){},
});

//direct use
let View1 = mymixin1(Mn.View).extend({})

//through mix helper
let View2 = mix(Mn.View).with(mymixin1, oldmixin).extend({
	anotherMethod(){},
});


```
