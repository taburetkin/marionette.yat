import _ from 'underscore';
import Mn from 'backbone.marionette';


let isEqualOrContains = function(node1, node2){
	if(node1.jquery)
		node1 = node1.get(0);
	if(node2.jquery)
		node2 = node2.get(0);
	
	return node1 === node2 || $.contains(node1, node2);
}

var DragAndDropSingleton = Mn.Object.extend({
	name:'draggable manager',
	buildDraggableContext: function ($el, beh, event) {
		var context = {
			id: _.uniqueId('draggable'),
			state:'pending',
			$trigger: $el,
			scope: beh.getOption("scope") || "default",
			behavior: beh,
			view: beh.view,
			model: beh.view.model,
			mouse: {
				startAt: {x: event.pageX, y: event.pageY}
			},
			_documentHandlers: {},
			_triggerHandlers: {},
			_elementHandlers: {},
		}

		context.mouse.getOffset = function (ev) {
			var res = {
				x: ev.pageX - this.startAt.x,
				y: ev.pageY - this.startAt.y
			}
			res.absX = Math.abs(res.x);
			res.absY = Math.abs(res.y);
			res.distance = Math.round(Math.sqrt(res.absX * res.absX + res.absY * res.absY));
			return res;
		}

		context._documentHandlers.mousemove = _.bind(this.__documentMouseMoveHandler, this, $el, context);
		context._documentHandlers.mouseup = _.bind(this.__documentMouseUpHandler, this, $el, context);
		context._documentHandlers.mouseleave = _.bind(this.__documentMouseLeaveHandler, this, $el, context);
		context._documentHandlers.mouseenter = _.bind(this.__documentMouseEnterHandler, this, $el, context);

		context._elementHandlers.dragover = _.bind(this.__dragOverHandler, this, $el, context);

		return context;
	},
	setupDraggable: function ($el, behavior) {
		if (!$el.jquery && !(typeof $el === 'string'))
			throw new Error('first argument should be jquery element or string selector');
		if (!(behavior instanceof Mn.Behavior))
			throw new Error('second argument should be marionette behavior instance');

		var $handler = $el.jquery ? $el : behavior.$el;
		var selector = typeof $el === 'string' ? $el : null;
		
		$handler.on('mousedown', selector, null, _.bind(this.__triggerMouseDownHandler, this, $handler, behavior));

	},
	__triggerMouseDownHandler: function ($el, behavior, ev) {
		
		ev.preventDefault();
		ev.stopPropagation();

		var context = this.buildDraggableContext($el, behavior, ev);

		$(document).on('mousemove', null, null, context._documentHandlers.mousemove)
		$(document).one('mouseup', null, null, context._documentHandlers.mouseup);

		return false;
	},
	__documentMouseUpHandler: function ($el, context, ev) {
		if (context.state === 'pending') {
			//dragging do not occurs
		} else if (context.state === "dragging") {
			context.state = 'dropped';
			context.view.triggerMethod('drag:end', context);
			$(ev.target).trigger('drag:drop', context);
		}

		this._clearAllHandlers($el, context);
	},

	__documentMouseMoveHandler: function ($el, context, ev) {
		if (context.state === 'pending') {
			var startDistance = context.behavior.getOption('startDragOnDistance') || 1;
			var distance = context.mouse.getOffset(ev).distance;
			if (distance < startDistance) return;

			this._initializeDragging($el, context, ev);
		}

		if (context.state === 'dragging')
			context.view.triggerMethod('drag', ev, context);

	},

	_initializeDragging: function ($el, context, ev) {
		if (context.state === 'dragging') return;

		context.state = 'dragging';
		context.view.triggerMethod('drag:start', ev, context);

		$(document).on('mouseleave', '*', null, context._documentHandlers.mouseleave);
		$(document).on('mouseenter', '*', null, context._documentHandlers.mouseenter);
	},

	__documentMouseLeaveHandler: function ($el, context, ev) {
		if(isEqualOrContains(context.behavior.$el, ev.target)) return;
		
		$(ev.target).trigger('drag:leave', context);
	},
	__documentMouseEnterHandler: function ($el, context, ev) {
		if (context.$entered) {
			context.$entered.off('mousemove', null, context._elementHandlers.dragover)
		}

		if(isEqualOrContains(context.behavior.$el, ev.target)) return;

		var event = this._createCustomDomEvent("drag:enter", ev);
		context.$entered = $(ev.target);
		context.$entered.trigger(event, context);

		context.$entered.on('mousemove', null, null, context._elementHandlers.dragover);
	},

	__dragOverHandler: function ($el, context, ev) {
		var event = this._createCustomDomEvent("drag:over", ev);
		$(ev.target).trigger(event, context);
	},

	_createCustomDomEvent: function (name, event, merge) {
		if (!merge)
			merge = ["pageX", "pageY", "clientX", "clientY", "offsetX", "offsetY"];

		var customEvent = jQuery.Event(name);
		_(merge).each(function (prop) {
			customEvent[prop] = event[prop];
		});

		return customEvent;
	},

	_clearAllHandlers: function ($el, context) {
		let $doc = $(document);
		_(context._documentHandlers).each(function (handler, name) {
			$doc.off(name, null, handler);
		});
		_(context._triggerHandlers).each(function (handler, name) {
			$el.off(name, null, handler);
		});

		if (context.$entered) {
			context.$entered.off('mousemove', null, context._elementHandlers.dragover)
		}

	}
});

let dragAndDrop = new DragAndDropSingleton();

export default dragAndDrop;
 