# common functions
holds some common functions. can be accessed view [`Yat.Functions.common`](/src/functions/common)

## unwrap(value, prefix, delimeter[optional])
Tries to unwrap value.

Default delimeter value is `:`.

### example
```js


let result = unwrap('view123:userName','view123');
// 'userName';


```

## wrap(prefix, value, delimeter[optional])
wraps value with prefix with delimeter.

Default delimeter value is `:`.

### example
```js


let result = wrap('view123','userName');
// 'view123:userName';


```

## getLabel(context, options[optional])
Tries to get label of a given context. 

Checks for value this fields in exact order: 'getLabel', 'label', 'getName', 'name', 'getValue', 'value'

### options

* `default`: if no values found return this one.
* `exclude`: skip this fields from process. `exclude:'id'` will not check `id` and `exclude:['getName', 'getLabel']` will not check `getName` and `getLabel`
* `args`: tries to pass this array if met property is a function.

## getName(context, options[optional])
Tries to get name of a given context. 

Checks for value this fields in exact order: 'getName', 'name', 'getLabel', 'label', 'getValue', 'value'

### options

* `default`: if no values found return this one.
* `exclude`: skip this fields from process. `exclude:'id'` will not check `id` and `exclude:['getName', 'getLabel']` will not check `getName` and `getLabel`
* `args`: tries to pass this array if met property is a function.

## getValue(context, options[optional])
Tries to get value of a given context. 

Checks for value this fields in exact order: 'getValue', 'value', 'getId', 'id', 'getName', 'name', 'getLabel', 'label', 'cid'

### options

* `default`: if no values found return this one.
* `exclude`: skip this fields from process. `exclude:'id'` will not check `id` and `exclude:['getName', 'getLabel']` will not check `getName` and `getLabel`
* `args`: tries to pass this array if met property is a function.

## getByPath(obj, pathString)
return value of `obj` property by path.


### example
```js

let obj = {
	level1:{
		level2:{
			name:'deep name'
		}
	}
}

let result = getByPath(obj,'level1.level2.name');
// 'deep name';


```

## setByPath(obj, pathString, value)
sets value to `obj` by path.


### example
```js

let obj = {}

let result = setByPath(obj,'level1.level2.name', 'deep name');
/*
{
	level1:{
		level2:{
			name:'deep name'
		}
	}
}
*/


```

## flattenObject(obj)
returns flat version of a given object.


### example
```js

let obj = {
	level1:{
		level2:{
			name:'deep name'
		}
	}
}

let result = flattenObject(obj);
/*
{
	'level1.level2.name':'deep name'
}
*/


```

## unFlattenObject(obj)
returns unflatten version of a given object.


### example
```js

let obj = {
	'level1.level2.name':'deep name'
}


let result = unFlattenObject(obj);
/*
{
	level1:{
		level2:{
			name:'deep name'
		}
	}
}
*/


```
