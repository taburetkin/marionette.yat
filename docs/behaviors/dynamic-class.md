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
