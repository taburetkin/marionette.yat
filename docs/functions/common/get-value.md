## getValue(context, options[optional])
Tries to get value of a given context. 

Checks for value this fields in exact order: 'getValue', 'value', 'getId', 'id', 'getName', 'name', 'getLabel', 'label', 'cid'

### options

* `default`: if no values found return this one.
* `exclude`: skip this fields from process. `exclude:'id'` will not check `id` and `exclude:['getName', 'getLabel']` will not check `getName` and `getLabel`
* `args`: tries to pass this array if met property is a function.
