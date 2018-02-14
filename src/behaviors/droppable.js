import _ from 'underscore';
import $ from 'jquery';
import Behavior from './behavior';

const DroppableBehavior = Behavior.extend({
	scope:'drag',
	events:{
		'drag:over':'_onDomDragOver'
	},

	//because of mn 3.5.1 bug of first render isAtached flag
	_skipFirstAttach: true,

	isSameScope(dragging){
		return dragging.scope === this.scope;
	},
	getEventXY(e){
		return {x: e.pageX, y: e.pageY};
	},
	getChildren(){
		return _(this.view.children._views).filter((v) => v.model && v.isRendered() && v.isAttached());
	},
	catchDraggable(draggable, dropContext){
		this._onDrop(draggable, dropContext);
	},
	
	
	constructor: function(...args){
		Behavior.apply(this, args);
		this._initReorderBehavior();
	},
	_initReorderBehavior(){
		this.listenToOnce(this.view, 'render', () => {
			this.reOrder({ silent: true })
			this.listenTo(this.view.collection, 'update', function (collection, options) {
				let changes = (options || {}).changes || {};
				this.reOrder();
			});
		});
	},
	reOrder(options = {}){
		
		this.view.sort();

		var children = this.children = [];
		var skipAttach = this._skipFirstAttach
		_(this.view.children._views).each((view, index) => {
			if (!view.model) return;
			view.model.set('order', index);
			if (view.isRendered() && (skipAttach || view.isAttached()))
				children.push(view);
		});

		this.hasChildren = this.children.length > 0;

		if (options.silent != true && this.view.collection)
			this.view.collection.trigger('reordered');

		this._skipFirstAttach = false;

	},

	// _triggerChildrenReady(){ this.triggerMethod('children:ready',this); },
	// _onChildrenReady(){
	// 	this._refreshChildren();
	// },
	// _refreshChildren(){
		
	// 	this.children = this.getChildren();
	// 	this.hasChildren = this.children.length > 0;

	// 	this.view.collection.trigger('reordered', this.view.collection.cid);
	// },


	_onDomDragOver(e, dragging, child){
		if(!this.isSameScope(dragging)) return;
		e.stopPropagation();
		

		if(dragging === child || (this.hasChildren && !child)) return;

		dragging._dragData.drop || (dragging._dragData.drop = {});
		let storedDrop = dragging._dragData.drop;

		let xy = this.getEventXY(e);

		let drop = this._getDropContext(xy, child);
		drop.context = this;

		let mixedDrop = _.extend({}, storedDrop, drop);
		let keys = _.keys(mixedDrop);
		let hasChanges = _(keys).some((k) => storedDrop[k] !== drop[k]);
		if(hasChanges){
			dragging._dragData.drop = drop;
			this._onDropContextChange(dragging, drop);
		}

	},
	_getDropContext(xy, child){

		let children = this.children || [];
		if(!children.length) return {insert:'before'};

		let $el = child ? child.$el : this.$el;
		let position = this._getPositionByEventXY(xy, $el);
		return this._getDropContextByPosisiton(position, child);

	},
	_getPositionByEventXY(xy, $el){

		let elOffset = $el.offset();
		let elDimension = {width: $el.outerWidth(), height: $el.outerHeight()};
		let xHalf = elOffset.left + elDimension.width / 2;
		let yHalf = elOffset.top + elDimension.height / 2;
		let r = {x:undefined, y:undefined};

		r.x = xy.x <= xHalf ? 'left' : 'right'
		r.y = xy.y <= yHalf ? 'top' : 'bottom';

		return r;
	},
	_getDropContextByPosisiton(position, child){

		let direction = this.getOption('direction') || 'vertical';

		let insert = direction == 'horizontal' 
			? position.x == 'left' ? 'before' : 'after'
			: position.y == 'top' ? 'before' : 'after';

		var childView = undefined;

		if(child){
			childView = child.view;
		}else{
			childView = insert == 'before' ? this.children[0] : (this.children.length && _(this.children).last());
		}

		let index = this.view.children._views.indexOf(childView);

		return {
			insert,
			childView,
			index,
			noChild: !child,
		}

	},
	_onDropContextChange(dragging, context){
		this.triggerMethod('drop:context:change', dragging, context);
	},
	_onDrop(draggable, dropContext){
		this.triggerMethod('drop', draggable, dropContext);
	},
});



export default DroppableBehavior;
