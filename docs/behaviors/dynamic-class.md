## DynamicClass
Takes view `className` result, mix it with view `dynamicClassName` and set to the view $el as class.

### default values
* refreshOnModelChange: if `true` upplies dynamic style on model `change` event. Default value is `true`
* refreshOnDomChange: if `true` upplies dynamic style on $el `change` event. Default value is `false`
* refreshOnViewRefresh: if `true` upplies dynamic style on view `refresh` event. Default value is `true`
* refreshOnViewBeforeRender: if `true` upplies dynamic style on view `before:render` event. Default value is `true`
* refreshOnViewRender: if `true` upplies dynamic style on view `render` event. Default value is `false`

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
view.render(); 				// view $el is `base-class`
model.set('active',true)	// view $el is `base-class model-active`
view.toggleActive(true);	// view $el is `base-class model-active view-active`
view.toggleActive(false);	// view $el is `base-class model-active`


```
