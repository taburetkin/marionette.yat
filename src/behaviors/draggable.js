import _ from 'underscore';
import $ from 'jquery';
import BaseDraggable from './_base-draggable';

const DraggableBehavior = BaseDraggable.extend({

	useGhost: true,
	viewCssClass: 'dragging',
	ghostCssClass: 'ghost',

	constructor: function(...args){
		
		BaseDraggable.apply(this, args);

		this.on('drag', this._onDrag);
		this.on('drag:start', this._onDragStart);
		this.on('drag:end', this._onDragEnd);

	},

	events:{
		'drag:enter'(e, dragging){
			if(!this.shouldHandleDomEvents(dragging)) return;
		},
		'drag:over'(e, dragging){
			if(!this.isSameScope(dragging)) return;
			e.stopPropagation();

			let newEvent = this._createCustomDomEvent('drag:over', e);

			let parent = this.$el.parent();
			if(parent)
				parent.trigger(newEvent, [dragging, this]);			
		}
	},


	_onDragEnd(ev){

		if(this.getOption('useGhost'))
			this._removeGhost();
		if(this.getOption('viewCssClass'))
			this.view.$el.removeClass(this.getOption('viewCssClass'));

		this._clearDragData();
	},
	_onDragStart(ev){
		if(this.getOption('useGhost'))
			this._createGhost();
		if(this.getOption('viewCssClass'))
			this.view.$el.addClass(this.getOption('viewCssClass'));
	},
	_onDrag(ev){
		this.setGhostPosition(ev.pageY, ev.pageX);
	},
	_removeGhost(){
		this.$ghost.remove();
		delete this.$ghost;
	},
	createGhost(){
		let $g = this.$el.clone();
		let {top,left} = this.$el.offset();
		$g.css({
			top: top + 'px',
			left: left + 'px',
			width: this.$el.outerWidth(),
			height: this.$el.outerHeight(),
		});
		return $g;
	},
	_createGhost(){
		var $g = this.createGhost();
		if($g.css('position') != 'absolute')
			$g.css('position','absolute');

		let addClasses = this.getOption('ghostCssClass');
		if(addClasses)
			$g.addClass(addClasses);

		$g.appendTo($('body'));
		this._setGhost($g);
	},
	_setGhost($g){
		this.$ghost = $g;
	},
	getGhost(){
		return this.$ghost;	
	},
	setGhostPosition(top, left){
		
		let $ghost = this.getGhost();
		if (!$ghost) return;

		$ghost.css({
			top: top + 'px',
			left: left + 'px',
		});		

	}

});


export default DraggableBehavior;
