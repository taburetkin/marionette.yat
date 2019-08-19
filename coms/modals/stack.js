import { isView } from '../../utils/is-utils';
import { Events } from '../../vendors';

const isEscapeKey = key => key === 'Escape' || key === 'Esc' || key === 27;
const ViewsStack = function() {
	this.items = [];
	this.itemsByCid = {};
	this._settleEscapeListener();
	//this._settleOutsideClickHandler();
}
ViewsStack.prototype = Object.assign({
	//NOT USED
	_settleOutsideClickHandler(view, context) {
		//console.log('SETTLE OCH');
		let handlerCount = 0;
		let handler = event => {
			if (event.defaultPrevented) {
				return;
			}
			if (handlerCount++ > 0 && this.tryRemoveView(view, { reason: 'outsideClick', outsideEl: event.target })) {
				event.preventDefault();
				event.stopImmediatePropagation();
			}
		};
		document.addEventListener('click', handler);
		view.once('destroy', () => {
			document.removeEventListener('click', handler);
		});
	},

	_settleEscapeListener() {
		let handler = event => {
			if (event.defaultPrevented) {
				return;
			}
			if (isEscapeKey(event.key || event.keyCode) && this.tryRemoveLast({ reason: 'escape' })) {
				event.stopImmediatePropagation();
			}
		};
		document.addEventListener('keyup', handler);
	},

	push(view, options = {}) {
		view = this.ensureView(view);
		if (!view) return;

		let storedContext = this._buildContext(view, options);

		if (options.cleanStack === true) {
			this._destroyStackViews(storedContext.stackName)
		}

		this._pushContext(storedContext);
		this._setupView(view, storedContext);

	},
	_buildContext(view, options = {}) {
		let { stackName = 'default' } = options;
		//let index = this.items.length;
		return { view, stackName, options };
	},
	_pushContext(context) {
		this.items.push(context);
		this.itemsByCid[context.view.cid] = context;
	},
	_removeContex(context) {
		delete this.itemsByCid[context.view.cid];
		let index = this.items.indexOf(context);
		this.items.splice(index, 1);
	},
	_setupView(view, context) {
		view.once('destroy', () => {
			this._remove(view);
		});
		//this._settleOutsideClickHandler(view, context);
	},
	_remove(view) {
		let context = view && this.getViewContext(view);
		if (!context) return;

		this._removeContex(context);
		this.stopListening(view);
		return true;
		// let index = context.index;
		// if (this.items[index] != context) {
		// 	throw new Error('ViewsStack removed view index mismatch: ' + view.cid + ', index:' + index);
		// }
		// this.stopListening(view);
		// if (index == this.items.length - 1) {
		// 	delete this.itemsByCid[view.cid];
		// 	this.items.pop();
		// } else {
		// 	this.items.splice(index, 1);
		// }
		//return true;
	},
	remove(view, removeOptions = {}) {
		if (!this._viewCanBeRemoved(removeOptions)) {
			return false;
		}
		if (this._remove(view) && removeOptions.destroy) {
			view.destroy();
		}
	},
	_viewCanBeRemoved({ reason, preventRemove, removeOnEsc, removeOnOutsideClick, viewEl, outsideEl } = {}) {
		if (preventRemove === true) {
			return false;
		}
		if (reason === 'escape' && removeOnEsc === false) {
			return false;
		}
		if (reason === 'outsideClick') {
			if (removeOnOutsideClick !== false) {
				return viewEl && !viewEl.contains(outsideEl);
			} else {
				return false;
			}
		}
		return true;
	},
	tryRemoveLast(removeOptions) {
		let context = this.items[this.items.length - 1];
		return this._tryRemoveContext(context, removeOptions);
	},
	tryRemoveView(view, removeOptions) {
		let context = this.getViewContext(view);
		return this._tryRemoveContext(context, removeOptions);
	},
	_tryRemoveContext(context, removeOptions) {
		if (!context) return false;
		let options = Object.assign({}, context.options, removeOptions, { destroy: context.options.destroyOnRemove !== false, viewEl: context.view.el });
		return this.remove(context.view, options);
	},
	_destroyStackViews(stackName) {
		let contexts = this.items.filter(f => f.stackName == stackName);
		contexts.forEach(context => context.view.destroy());
	},
	getViewContext(view) {
		return this.itemsByCid[view.cid];
	},
	ensureView(view) {
		return isView(view) && !view.isDestroyed() && view;
	},
}, Events);

export default new ViewsStack();
