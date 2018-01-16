import _ from 'underscore';
import Mn from 'backbone.marionette';
import dragAndDrop from '../singletons/drag-and-drop';

var DraggableBehavior = Mn.Behavior.extend({
	events: {
		'dragged:over': function (event, part, context) {
			event.stopPropagation();
			event.preventDefault();

			if (this.wrongScope(context)) return;
			this.view.triggerMethod('dragged:over', part, context, this);
			this.view.triggerMethod('dragged:over:' + part, context, this);
		}
	},
	onInitialize: function () {
		this._setup();
	},
	getScope: function () {
		return this.getOption("scope") || "default";
	},
	wrongScope: function (context) {
		return this.getScope() !== context.scope;
	},
	onDragStart: function (ev, context) {

		var ghost = this.getOption('ghost') || "clone";

		if (ghost == 'clone') {
			var $g = this.$ghost = this.$el.clone();
			$g.css({
				top: (ev.pageY) + 'px',
				left: ev.pageX + 'px',
				width: this.$el.width(),
			});

			if (this.getOption('elementClass'))
				this.$el.addClass(this.getOption('elementClass'));
			if (this.getOption('ghostClass'))
				$g.addClass(this.getOption('ghostClass'));

			var $dragContext = $('body');
			var ghostContext = this.getOption('ghostContext');
			var $dragContext = ghostContext == null ? $('body')
				: ghostContext == "parent" ? this.$el.parent()
					: $(ghostContext);
			$g.appendTo($dragContext);

		}

	},
	onDrag: function (ev) {
		if (!this.$ghost) return;
		this.$ghost.css({
			top: (ev.pageY) + 'px',
			left: ev.pageX + 'px',
		});
	},
	onDragEnd: function () {

		if (this.$ghost)
			this.$ghost.remove();

		if (this.getOption('elementClass'))
			this.$el.removeClass(this.getOption('elementClass'));
	},
	startDragOnDistance: 50,
	getDragTrigger: function () {
		if (this.getOption('dragTrigger'))
			return this.getOption('dragTrigger');

		return this.$el;
	},
	_setup: function () {
		dragAndDrop.setupDraggable(this.getDragTrigger(), this);
	},
});

export default DraggableBehavior;
