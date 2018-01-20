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
