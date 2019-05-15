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
