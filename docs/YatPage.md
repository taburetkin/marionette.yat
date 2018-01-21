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
