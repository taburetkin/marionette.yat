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

## GetOptionProperty mixin
see [mixin](../helpers/mix.md)

### public methods
* `getOption(key, options[optional])`
* `getProperty(key, options[optional])`

### getOption(key, options[optional])
returns value from options if options is present on instance.

if returned value is undefined then it returns value from instance property.

### getProperty(key, options[optional])
returns value from instance property. 

if returned value is undefined then it returns value from options of the instance.

### options
* `deep` - default value `true`.
	forces to check falback value if primary value is undefined.
* `force` - default value `true`.
	forces to return function value if primary value is a function. Do not executes known constructors (see [isKnowCtor](../helpers/isKnownCtor.md))
* `args` - default value is [].
	if returned value is function and `force` == true then this property will be passed as arguments
* `default`	- returns as value if resulting value is undefined.

### examples

```js

import {GetOptionProperty} from 'marionette.yat';
import {Application} from 'backbone.marionette';

// direct use
// let App = GetOptionProperty(Application);

// also you can use it through mix
// let App = mix(Application).with(GetOptionProperty, anotherMixin, yetanothermixin, ...)

//YatApp has mixed it by default
let App = Mn.Yat.App.extend({
  propertyValue: 'instance',
  propertyFunction: () => 'from function',
  propertyClass: Mn.Object
  propertyFunction2: (a,b) => 'from function' + a + '-' + b,
});

let app = new Mn.Yat.App({
  propertyValue: 'options',
  propertyFunction: () => 'from function in options',
  additional:'additional'
});

app.getProperty('propertyValue'); // returns "instance"
app.getOption('propertyValue'); // returns "options"
app.getProperty('additional'); // returns "additional"

app.getProperty('propertyFunction'); //returns "from function"
app.getProperty('propertyClass'); //returns Mn.Object


//options
app.getProperty('propertyFunction',{force:false}); // returns () => 'from function'

app.getProperty('additional',{deep:false}); //returns undefined

app.getProperty('propertyFunction2',{args:['a','b']}); //returns 'from functiona-b'

app.getProperty('not-exists-property',{default:'ooops'}); //returns 'ooops'

```

## GetNameLabel mixin
extends a class with three get methos:

* `getName` - Tries to return a name. Borrowed from [`Yat.Functions.common.getName`](/src/functions/common)
* `getLabel` - Tries to return a label. Borrowed from [`Yat.Functions.common.getLabel`](/src/functions/common)
* `getValue` - Tries to return a vale. Borrowed from [`Yat.Functions.common.getValue`](/src/functions/common)


## Radioable mixin
extends marionette radio functionality.

### differences from marionette functionality
* radio functionality is not initialized by default.
* understand `channel` option. You can pass `channelName` as usual or a `channel` with radio channel
* has method `radioTrigger`
* has method `radioRequest`

`radioTrigger`, `radioRequest` or `getChannel` will initialize radio if it not initialized.

you can set instance property `initRadioOnInitialize` to `true` for initializing radio at the instance initialize.

## Stateable mixin
Main goal to store and get state of an instance and trigger apropriate events on state change.

### methods
* `getState(key[optional])`
* `setState(key, value[optional])`
* `clearState()`

has static field `Stateable` equal to `true`

### getState
`getState()` will return state object itself
`getState(key)` will return value of stored state

### setState
`setState(key,value)` will store value in state object by key.

`key` can be a hash of state fields, in that case second argument is ignored.

also triggers: 

`state:[keyValue]` with value as argument

`state` with hash of changed state fields

### clearState
Clears all states fields.

### example

```js

let instance = new Mn.Yat.App();

instance.setState('pulled',true);

instance.setState({
	state2: 'value of state2',
	state3: 'value of state3',
	pulled: false,
});

instance.getState('pulled'); //returns false
instance.getState('state2'); //returns 'value of state2'
instance.getState(); //returns { pulled: false, state2: 'value of state2', state3: 'value of state3' }

```

## Childrenable mixin
On initialize instantiate all children.


### properties
* `children` - array of Child classes or classContexts
* `childOptions` - can be hash or a function returning a hash. this will pass to the child initialize.
has static field `Childrenable` equal to `true`.

### methods
* `hasChildren()` - returns true if there are children
* `hasParent()` - returns true if there is a parent
* `getParent()` - returns parent if its defined.
* `getChildren()` - returns children in array.
* `getChildOptions()` - override this if you need special logic.

### options
* `passToChildren` - if set to true options will be added to childOptions. can be defined as instance property.

### classContext
class context is an object with defined Child class and additional properties.
```
{
	Child: ChildClass
	//set of options
}
```

additional properties will be passed as options on instance initialize.

## Startable mixin


* derived from [Stateable](./stateable.md)
* has special `life` state lifecycle
* has static field `Startable` equal to true

### properties
* `allowStartWithoutStop`
* `allowStopWithoutStart`

### methods
* `start`
* `triggerStart`
* `stop`
* `triggerStop`
* `isStartNotAllowed`
* `isStopNotAllowed`
* `addStartPromise`
* `addStopPromise`

### state lifecycle
* `initialized` (idle)
	* `starting` (process)
		* `running` (idle)
  * `stopping` (process)
* `waiting` (idle)

there is a `destroyed` state. Instance get this state after `destroy()`.


by default instance can not start if its not in idle or already started

instance can not stop if its not `running`.

this behavior can be changed via properties `allowStartWithoutStop` and `allowStopWithoutStart`

