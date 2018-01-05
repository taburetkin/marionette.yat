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
