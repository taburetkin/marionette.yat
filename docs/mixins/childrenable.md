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
