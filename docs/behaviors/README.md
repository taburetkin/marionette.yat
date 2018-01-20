# Behaviors
There are some behaviors shipped with Yat.

All of them are extending base [`Behavior`](~src/behaviors/behavior.js)

Behaviors can be accessed like this `Yat.Behaviors.[BehaviorName]`.

## Behavior
* `listenViewInitialize` - if true, triggers `view:initialize` on the behavior. Main goal to fix order of `onInitialize` and `onRender` calls when view rendered inside initialize method. `view:initialize` will be executed before view renders in any case.

Can be a function. Default value is set to `true`. 

* `getModel()` - returns view model.
* `cidle(argument)` - wraps argument with view cid. `let name = this.cidle('userName'); // "view123:userName"`, 
* `unCidle(argument)` - unwraps cidled argument. `let rawname = this.unCidle(name); // "userName"`

## DynamicClass
Takes view `className` result, mix it with view `dynamicClassName` and set it to the view $el as class.

### default values
* `refreshOnModelChange` (default: `true`) 

if `true` upplies dynamic style on **model** `change` event.

* `refreshOnDomChange` (default: `false`)

if `true` upplies dynamic style on **$el** `change` event.

* `refreshOnViewRefresh` (default: `true`)

if `true` upplies dynamic style on **view** `refresh` event.

* `refreshOnViewBeforeRender` (default: `true`)

if `true` upplies dynamic style on **view** `before:render` event.

* `refreshOnViewRender` (default: `false`)

if `true` upplies dynamic style on **view** `render` event.


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


```
