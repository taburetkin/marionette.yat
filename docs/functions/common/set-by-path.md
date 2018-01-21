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
