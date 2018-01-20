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
