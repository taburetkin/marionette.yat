# GetOptionProperty mixin
see [mixin](../helpers/mixin.md)

exposed methods
* `getOption(key, options)`
* `getProperty(key, options)`

## getOption(key, options[optional])
returns value from options hash and if its undefined then return value of instance property. (by default, see options)

## getProperty(key, options)
returns value from instance property and if its undefined then return value from options hash. (by default, see options)

## options
* `deep` - default value `true`.
  if true, checks also options or property value.
* `force` - default value `true`.
  if true, then returns result of value function if its not known constructor (see [isKnowCtor](../helpers/isKnownCtor.md))

## examples

```js

let App = Mn.Yat.App.extend({
  propertyValue: 'instance',
  propertyFunction: () => 'from function',
  propertyClass: Mn.Object
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


```
