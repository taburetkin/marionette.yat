# GetOptionProperty mixin
see [mixin](../helpers/mix.md)

## public methods
* `getOption(key, options[optional])`
* `getProperty(key, options[optional])`

## getOption(key, options[optional])
returns value from options if options is present on instance.

if returned value is undefined then it returns value from instance property.

## getProperty(key, options[optional])
returns value from instance property. 

if returned value is undefined then it returns value from options of the instance.

## options
* `deep` - default value `true`.
	forces to check falback value if primary value is undefined.
* `force` - default value `true`.
	forces to return function value if primary value is a function. Do not executes known constructors (see [isKnowCtor](../helpers/isKnownCtor.md))
* `args` - default value is [].
	if returned value is function and `force` == true then this property will be passed as arguments
* `default`	- returns as value if resulting value is undefined.

## examples

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

app.getProperty('propertyFunction2',{args:['a','b']}); //returns 'from function a-b'

app.getProperty('not-exists-property',{default:'ooops'}); //returns 'ooops'

```
