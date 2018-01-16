import _ from 'underscore';
import Mn from 'backbone.marionette';

let SortByDrag = Mn.Behavior.extend({
	events: {				
		'drag:drop': '_dragDrop',
		'drag:over': '_dragOver',
	},
	_dragOver: (ev, context) => {
		if (this.wrongScope(context)) return;
		ev.stopPropagation();
		ev.preventDefault();

		if (ev.target === this.$el.get(0)) {
			this._insert(context)
			return;
		}

		var oldpos = this.dragOverPosition || '';
		var m = { y: ev.pageY, x: ev.pageX };
		var $el = this.getChildEl(ev.target);
		var position = "top:left";
		if ($el.length) {
			var i = this._get$elInfo($el);
			var hor = m.x < i.center.x ? 'left' : 'right';
			var ver = m.y < i.center.y ? 'top' : 'bottom';
			position = ver + ":" + hor;
		} else {
			console.warn(ev.target);
		}

		var dragBy = this.getOption("dragBy") || "both";
		if (oldpos != position) {
			var apos = oldpos.split(':');

			var eventContext = $el;
			var _this = this;
			if (dragBy == "both") {
				eventContext.trigger('dragged:over', [position, context]);
			}
			if (apos.indexOf(hor) === -1 && (dragBy === "horizontal" || dragBy === "both")) {
				eventContext.trigger('dragged:over', [hor, context]);
			}
			if (apos.indexOf(ver) == -1 && (dragBy === "vertical" || dragBy === "both")) {					
				eventContext.trigger('dragged:over', [ver, context]);
			} 
			this.dragOverPosition = position;
		}
	},
	_dragDrop: function (ev, context) {
		if (this.wrongScope(context)) return;
		ev.stopPropagation();
		ev.preventDefault();
		
		this._tryInsertBetween(context);
		return false;
	},
	_tryInsertBetween: function (context) {

		var model = context.model;
		var view = context.view;

		if (!this.view.collection) {
			console.warn('collection not defined');
			return;
		}

		view.$el.detach();
		view.destroy();


		this.removeModelFromCollection(model);
		this.insertModelAt(model, context.insertAt);

	},
	removeModelFromCollection: function (model) {
		var col = model.collection;
		if (!col) return;
		col.remove(model);
		delete model.collection;
		col.each(function (m, i) { m.set("order", i) });
	},
	insertModelAt: function (model, at) {
		var col = this.view.collection;
		if (!col) return;
		
		if(at <= 0) at = 0;

		if (at >= col.length) {
			model.set('order', col.length);
			model.collection = col;
			col.push(model);
		} else {
			model.set('order', at);
			model.collection = col;

			if(at > 0)
				col.add(model, { at: at });
			else
				col.unshift(model);

			col.each(function (exist, ind) {
				exist.set('order', ind);
			});
		}

		this.view.sort();
	},

	getScope: function () {
		return this.getOption("scope") || "default";
	},
	wrongScope: function (context) {
		return this.getScope() !== context.scope;
	},
	getChildEl: function (el) {
		var selector = this.getOption('childSelector');
		return $(el).closest(selector);
	},
	_get$elInfo: function ($el, force) {
		var i = this._$elInfo = {
			size: { width: $el.width(), height: $el.height() },				
			offset: $el.offset()
		};
		i.center = { x: i.size.width / 2 + i.offset.left, y: i.size.height / 2 + i.offset.top };
		return i;
	},
	getOrder: function (beh) {
		return beh.view.model.getOrder() || 0;
	},
	_updateInsert: function (context, order) {
		context.insertAt = order ;
	},


	onChildviewDraggedOverLeft: function (context, childBeh) {
		this._insert(context, "insertBefore", childBeh);
	},
	onChildviewDraggedOverTop: function (context, childBeh) {
		this._insert(context, "insertBefore", childBeh);
	},
	onChildviewDraggedOverRight: function (context, childBeh) {
		this._insert(context, "insertAfter", childBeh);
	},
	onChildviewDraggedOverBottom: function (context, childBeh) {
		this._insert(context, "insertAfter", childBeh);
	},
	_insert: function (context, method, childBeh) {
		var order = childBeh ? this.getOrder(childBeh) : 0;

		if (method)
			context.view.$el[method](childBeh.$el);
		else
			context.view.$el.appendTo(this.$el);

		this._updateInsert(context, order);
	},
});


export default SortByDrag;
