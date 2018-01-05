# Stateable mixin
main goal to store and get state of an instance and trigger apropriate events on state change.

has two methods: `getState(key[optional])` and `setState(key,value[optional])`

has static field `Stateable` equal to `true`

## getState
`getState()` will return state object itself

`getState(key)` will return value of stored state

## setState
`setState(key,value)` will store value in state object by key.

`key` can be a hash of state fields, in that case second argument is ignored.

also triggers: 

`state:[keyValue]` with value as argument

`state` with hash of changed state fields

## example

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
