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
