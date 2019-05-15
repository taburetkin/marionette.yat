## mix helper
Extends a Class or object with mixins and hashes and do not pollute prototypes.

### primary use case
`let NewClass = mix(BaseClass).with(Mixin1, Mixin2);`

### mix(argument)
returns a special `wrapper` object with `class` property and `with` method.
`argument` can be a class definition or simple object.
```js
let wrapper = mix({example:true}); //OK
let wrapper = mix(MyClass); //OK
let wrapper = mix([1,2,3]); //ERROR

let NewClass = mix({prop1:1, prop2:2}).class;
let instance = new NewClass();
```

### mix(BaseClass).with(mixin1, mixin2, mixin3)
`mixin` argument could be an `object` or a `mixin function`. The apply order is left to right, so properties of mixin3 will be the last

### mixin function
Its a function that takes as argument Base class and returns extended Base class
```js

let myMixin = (BaseClass) => BaseClass.extends({prop:'abc'},{staticProp:'zxc'});

let MyClass = mix({somedata:123}).with(myMixin);

```

### resulted class
`mix` helper will settle to resulting class static `extend` method, so you can do like that
```js

let MyClass = mix(BaseClass).with(mixin1, mixin2, {abc:123, zxc:321}).extend({
	abc:'my abc is better',
	greet(){
		console.log('abc', this.abc); // logs "my abc is better"
		console.log('zxc', this.zxc); // logs "321"
	}
});

```
