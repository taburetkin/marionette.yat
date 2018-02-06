import _ from 'underscore';
import Behavior from './behavior';

const BaseDraggable = Behavior.extend({

	triggerEl: undefined, //drag initialization element, if not set equal to view.$el
	moveBeforeStart: 10,
	scope: 'drag',

	getDragEventsContext(){
		return this.$doc;
	},
	getDragEventsElementSelector(){
		return '*';
	},
	getTriggerEl(){
		if(this._$el) return this._$el;

		let el = this.getOption('triggerEl');
		if(el == null && this.view.$el)
			this._$el = this.view.$el;
		else if(el && el.jquery) this._$el = el
		else if(el instanceof HTMLElement) this._$el = $(el)
		else if(typeof el === 'string' && el.length)
			this._$el = this.view.$(el);
		else
			throw new Error('trigger element should be a DOM or jQuery object or string selector.', el);

		return this._$el;
	},

	isSameScope(dragging){
		return dragging.scope === this.scope;
	},

	shouldHandleDomEvents(dragging){
		return this.isSameScope(dragging) && this !== dragging;
	},

	constructor: function(...args){
		
		this._clearDragData();
		
		this.$doc = $(document);

		Behavior.apply(this, args);

		this._defineDocumentBindings();

	},
	_clearDragData(){
		this._dragData = {};
	},
	_defineDocumentBindings(){
		this.__b = {};
		this.__b.setupDragDetection = _.bind(this._setupDragDetection, this);
		this.__b.handleMouseUp = _.bind(this._handleMouseUp, this);
		this.__b.handleMoveAfterMouseDown = _.bind(this._handleMoveAfterMouseDown, this);
		this.__b.handleDragMove = _.bind(this._handleDragMove, this);
		this.__b.handleElementEnter = _.bind(this._handleElementEnter, this);
		this.__b.handleElementLeave = _.bind(this._handleElementLeave, this);
		this.__b.handleElementOver = _.bind(this._handleElementOver, this);
	},

	onInitialize(){
		this._initializeDragListener();
	},


	_initializeDragListener(){
		let $el = this.getTriggerEl();
		$el.one('mousedown', this.__b.setupDragDetection);
	},
	_setupDragDetection(e){
		if(this.view.dragDisabled === true){ 
			this._initializeDragListener();
			return;
		}

		e.stopPropagation();

		this.$doc.one('mouseup', this.__b.handleMouseUp);

		this._dragData.startX = e.pageX;
		this._dragData.startY = e.pageY;
		this.$doc.on('mousemove', this.__b.handleMoveAfterMouseDown);

	},
	_handleMouseUp(e){
		if(this._dragData.dragging)
			this._handleDragEnd(e);
		else
			this._handleEndWithoutDrag(e);

		this._initializeDragListener();
	},
	_handleEndWithoutDrag(e){
		this.$doc.off('mousemove', this.__b.handleMoveAfterMouseDown);
	},
	_handleDragEnd(e){
		this._dragData.dragging = false;

		this.$doc.off('mousemove', this.__b.handleDragMove);

		let $context = this.getDragEventsContext();
		$context.off('mouseenter', this.__b.handleElementEnter);
		$context.off('mousemove', this.__b.handleElementOver);

		if(this._dragData.drop && this._dragData.drop.context){
			this._dragData.drop.context.catchDraggable(this, this._dragData.drop);
			this.triggerMethod('drag:drop', this._dragData.drop);
		}

		this.triggerMethod('drag:end');

	},

	_handleMoveAfterMouseDown(e){
		e.stopPropagation();

		let distance = this._getStartPositionPixelOffset(e);
		let startIfMoreThan = this.getOption('moveBeforeStart');
		if(distance >= startIfMoreThan)
			this._startDragSession();
	},
	_getStartPositionPixelOffset(e){
		let x = Math.abs(e.pageX - this._dragData.startX);
		let y = Math.abs(e.pageY - this._dragData.startY);
		return x > y ? x : y;
	},
	_startDragSession(){
		this._dragData.dragging = true;
		this.$doc.off('mousemove', this.__b.handleMoveAfterMouseDown);

		this.$doc.on('mousemove', this.__b.handleDragMove);

		let $context = this.getDragEventsContext();
		let selector = this.getDragEventsElementSelector();

		$context.on('mouseenter', selector, this.__b.handleElementEnter);

		$context.on('mousemove', selector, this.__b.handleElementOver);


		this.view.triggerMethod('drag:start');
	},
	_handleDragMove(ev){
		ev.stopPropagation();

		this.triggerMethod('drag', ev);

	},
	_handleElementEnter(e){
		let $over = $(e.target);


		if(this._dragData.over != $over){
			this._dragData.over = $over;
			$over.trigger('drag:enter', this);
			$over.one('mouseleave', () => this.trigger('drag:leave', this));

		}
	},
	_handleElementLeave(e){
		let $over = $(e.target);
		$over.trigger('drag:leave', this);
	},
	_handleElementOver(e){
		let $over = $(e.target);
		let event = this._createCustomDomEvent('drag:over', e);
		$over.trigger(event, this);
	},
	_createCustomDomEvent: function (name, event, merge) {
		if (!merge)
			merge = ["pageX", "pageY", "clientX", "clientY", "offsetX", "offsetY", "target"];

		var customEvent = jQuery.Event(name);
		_(merge).each((prop) => customEvent[prop] = event[prop]);

		return customEvent;
	},	
});

export default BaseDraggable;
