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
