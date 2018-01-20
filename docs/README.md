# YatApp
`Marionette.Application` mixed with [GetOptionProperty](mixins/get-option-property.md), [Radioable](mixins/radioable.md), [Childrenable](mixins/childrenable.md), [Startable](mixins/startable.md)

also has 
* [`PageManger`](YatPageManager.md) support
* more smart region, it will not initialize with instance and support definition as function.

## Smart region
You can define region via options or property and it can be a function.
Initialization occurs only when `getRegion` called.

## PageManger support

* `addPageManager(pageManager)` - accepts instance of PageManager and store it in internal pagemanagers store.
pageManager events will be proxied to application with pageManager name as prefix.
* `hasPageManagers()` - returns true if application has added pageManagers.
* `getMenuTree()` - returns collection of pageManagers root links.

# YatError
extends Marionette.Error

for future use.

# YatObject
`Marionette.Object` mixed with [GetOptionProperty](mixins/get-option-property.md) and [Radioable](mixins/radioable.md)

# YatPage
by default is an entry point to the application.

## properties
* `Layout` - Marionette.View class or function returning Marionette.View class, can be passed via options
* `layoutOptions` - options object or function returned options object, can be passed via options
* `allowStopWithoutStart` - if true, skips idle check on stop
* `allowStartWithoutStop` - if true, skips idle check on start
* `relativeRoute` - if true, adds parent route
* `route` - route for Marionette.AppRouter. can be function

## functional
[YatApp](YatApp.md) mixed with [GetNameLabel](mixins/get-name-label.md)

also 
* `hasRouteHash()` - returns true if a page has route hash.
* `getRouteHash()` - returns route hash.
* `getRoute()` - returns string route.
* `getNeighbourLinks()` - returns links to neighbour pages
* `getParentLinkModel()` - returns parent link if parent exists
* `getLinkModel()` - returns link to this page.


* `addCollection(collection, options)` - adds collection to the page. if options has `fetch`:`true` will also fetch collection and add fetch promise to start promises.
* `addModel(model, options)` - adds model to the page. if options has `fetch`:`true` will also fetch model and add fetch promise to start promises.
* `buildLayoutOptions(options)` - override this for defining own layout options.
* `buildLayout()` - builds instance of layout view, mix options with model and/or collection if they are defined.
* `getLayout(options)` - return instance of layout view if its already build or options has no `rebuild` property

# YatPageManager

* Initializes pages
* Creates router for registered initialized pages on intialize.
* Builds links tree

## functional
[YatApp](YatApp.md) mixed with [GetNameLabel](mixins/get-name-label.md)

# YatRouter
Its just `Marionette.AppRouter` adapted for use with `YatPageManager`.

Do not use it without YatPageManager.

# Behaviors
There are some behaviors shipped with Yat.

All of them are extending base [`Behavior`](/src/behaviors/behavior.js)

Behaviors can be accessed like this `Yat.Behaviors.[BehaviorName]`.

## Behavior
* `listenViewInitialize` - if true, triggers `view:initialize` on the behavior. Main goal to fix order of `onInitialize` and `onRender` calls when view rendered inside initialize method. `view:initialize` will be executed before view renders in any case.

Can be a function. Default value is set to `false`. 

* `getModel()` - returns view model.
* `cidle(argument)` - wraps argument with view cid. `let name = this.cidle('userName'); // "view123:userName"`, 
* `unCidle(argument)` - unwraps cidled argument. `let rawname = this.unCidle(name); // "userName"`

## DynamicClass
Takes view `className` result, mix it with view `dynamicClassName` and set it to the view $el as class.

### default values
* `refreshOnModelChange` (default: `true`) - if `true` upplies dynamic style on **model** `change` event.

* `refreshOnDomChange` (default: `false`) - if `true` upplies dynamic style on **$el** `change` event.

* `refreshOnViewRefresh` (default: `true`) - if `true` upplies dynamic style on **view** `refresh` event.

* `refreshOnViewBeforeRender` (default: `true`) - if `true` upplies dynamic style on **view** `before:render` event.

* `refreshOnViewRender` (default: `false`) - if `true` upplies dynamic style on **view** `render` event.

### example
```js

let DynamicClass = Yat.Behaviors.DynamicClass;
let model = new Backbone.Model({active:false});
let View = Mn.View.extend({
	behaviors:[DynamicClass],
	className: 'base-class',
	dynamicClass: function(){
		let cls = '';

		if(this.model.get('active') === true)
			cls += ' model-active'

		if(this.isActive === true)
			cls += ' view-active'

	},
	setActive(value){
		this.isActive = value === true;
		this.trigger('refresh');
	},	
});

let view = new View({model:model});
view.render(); 			// view $el is `base-class`
model.set('active',true)	// view $el is `base-class model-active`
view.toggleActive(true);	// view $el is `base-class model-active view-active`
view.toggleActive(false);	// view $el is `base-class model-active`


// setting options
// as object hash
let View2 = Mn.View.extend({
	behaviors:[{
		behaviorClass: DynamicClass,
		refreshOnModelChange: true,
		refreshOnDomChange: false,
		refreshOnViewRefresh: true,
		refreshOnViewBeforeRender: true,
		refreshOnViewRender: false,		
	}]
})

// setting options
// as extend
let MyDynamicClass = DynamicClass.extend({
	refreshOnModelChange: true,
	refreshOnDomChange: false,
	refreshOnViewRefresh: true,
	refreshOnViewBeforeRender: true,
	refreshOnViewRender: false,		
});
let View2 = Mn.View.extend({
	behaviors:[MyDynamicClass]
});

```

## FormToHash
builds hash object from view form elements.

## Draggable behavior
Makes view draggable.


### options
* `dragTrigger` (default: view.$el) - listens for click event on this element for starting the drag session
* `scope` (default: default) - scope is for handling certain drag sessions
* `elementClass` - adds this css class to the view.$el on drag:start and removes it on drag:end
* `ghostClass` - adds this css class to the ghost element
* `startDragOnDistance` - distance in pixels for starting the drag session

### example
```js

let MyDraggable = Yat.Behaviors.Draggable.extend({
	startDragOnDistance: 1, //immediatelly
	elementClass: 'dragging',
	ghostClass: 'ghost',
	scope:'my-things',
});

let View = Mn.View.extend({
	className:'my-element', // on drag will became `my-element dragging`
	behaviors:[MyDraggable]
});

```

## SortByDrag
Makes collection view able to sort items by drag and drop.

child views should have `Draggable` behavior.


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

# view functions
holds some useful view functions. can be accessed view [`Yat.Functions.view`](/src/functions/view)

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

## viewComparator
helper function for using inside marionette collection view comparator

### single compare
viewComparator can accept three arguments. In that case it will threat them as a single compare: `[a,b,method]`

`viewComparator(viewA, viewB, method)`

method signature is `(model, view) => {}`. this is points to the pass argument. model and view arguments are normalized and can be undefined.

```js

let View = Mn.NextCollectionView.extend({
	viewComparator(viewA, viewB){
		return viewComparator(viewA, viewB, (model,view) => model.get('text') ); // this will sort views by alphabet order of model text property.
	}
});

```

### multiple compare
viewComparator can accept array of `single compare`. In that case it will calculates the order by multiple parameters.

`viewComparator([[a,b,method],[a,b,method],  ... [a,b,method]])`

```js

let View = Mn.NextCollectionView.extend({
	viewComparator(viewA, viewB){
		return viewComparator([
			[viewA, viewB, (model,view) => model.get('text')],  //in first sorts by text asc
			[viewB, viewA, (model,view) => model.get('order')], //than by order desc. check the order of first two arguments
		]); 
	}
});

```


#mixins
Mixins is a extended functionality. 
Mixin can be an object or a function which returns extended base class.

## example
```js

//old fashion way
let mymixin = {
	methodA(){}
	methodB(){}
}

let MyView = Mn.View.extend(mymixin).extend({
	methodC(){}
});



```

with `mix` helper you can define mixins as a functions

```js
//the old one
let oldmixin = {
	methodA(){}
	methodB(){}
}

//function mixin
let mymixin1 = (Base) => Base.extend({
	methodC(){},
});

//direct use
let View1 = mymixin1(Mn.View).extend({})

//through mix helper
let View2 = mix(Mn.View).with(mymixin1, oldmixin).extend({
	anotherMethod(){},
});


```

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

app.getProperty('propertyFunction2',{args:['a','b']}); //returns 'from functiona-b'

app.getProperty('not-exists-property',{default:'ooops'}); //returns 'ooops'

```

## GetNameLabel mixin
extends a class with three get methos:

* `getName` - Tries to return a name. Borrowed from [`Yat.Functions.common.getName`](/src/functions/common)
* `getLabel` - Tries to return a label. Borrowed from [`Yat.Functions.common.getLabel`](/src/functions/common)
* `getValue` - Tries to return a vale. Borrowed from [`Yat.Functions.common.getValue`](/src/functions/common)


## Radioable mixin
extends marionette radio functionality.

### differences from marionette functionality
* radio functionality is not initialized by default.
* understand `channel` option. You can pass `channelName` as usual or a `channel` with radio channel
* has method `radioTrigger`
* has method `radioRequest`

`radioTrigger`, `radioRequest` or `getChannel` will initialize radio if it not initialized.

you can set instance property `initRadioOnInitialize` to `true` for initializing radio at the instance initialize.

## Stateable mixin
Main goal to store and get state of an instance and trigger apropriate events on state change.

### methods
* `getState(key[optional])`
* `setState(key, value[optional])`
* `clearState()`

has static field `Stateable` equal to `true`

### getState
`getState()` will return state object itself
`getState(key)` will return value of stored state

### setState
`setState(key,value)` will store value in state object by key.

`key` can be a hash of state fields, in that case second argument is ignored.

also triggers: 

`state:[keyValue]` with value as argument

`state` with hash of changed state fields

### clearState
Clears all states fields.

### example

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

## Startable mixin


* derived from [Stateable](./stateable.md)
* has special `life` state lifecycle
* has static field `Startable` equal to true

### properties
* `allowStartWithoutStop`
* `allowStopWithoutStart`

### methods
* `start`
* `triggerStart`
* `stop`
* `triggerStop`
* `isStartNotAllowed`
* `isStopNotAllowed`
* `addStartPromise`
* `addStopPromise`

### state lifecycle
* `initialized` (idle)
	* `starting` (process)
		* `running` (idle)
  * `stopping` (process)
* `waiting` (idle)

there is a `destroyed` state. Instance get this state after `destroy()`.


by default instance can not start if its not in idle or already started

instance can not stop if its not `running`.

this behavior can be changed via properties `allowStartWithoutStop` and `allowStopWithoutStart`

