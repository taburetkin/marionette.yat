## compareAB(a, b, func[optional])
does ab compare and return -1|0|1 as compare result

### func
func is optional argument that should be a function, invokes with `a` and `b` as context.

### example
```js

let example1 = compareAB(1, 2); // -1
let example2 = compareAB(2, 1); // 1

let example2 = compareAB(-2, 1, () => Maths.abs(this)); // 1


```
