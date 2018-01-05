# YatPage
by default is an entry point to the application.

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
* `buildLayout()` - builds instance of layout view
* `getLayout(options)` - return instance of layout view if its already build or options has no `rebuild` property
