import _ from 'underscore';
import viewsStack from './stack';
import renderInNode from '../../utils/renderInNode';
import { buildViewByKey } from '../../utils/build-utils';
import { isViewClass, isView } from '../../utils/is-utils';
import { View } from '../../vendors';

console.warn('viewsStack', viewsStack);

export const modalsConfig = {
	modalView: void 0,
	modalViewOptions: void 0,
	deferRender: false,
	textToView(text) {
		return new View({ template: _.template(text)});
	},
	argToView(arg) {
		return;
	},
	return(view) {
		return view;
	},
}

function convertArgToView(arg, options) {
	options = (options || {});

	if (options.modalView != null) {

		return buildViewByKey(options, 'modalView', { options: { content: arg } });

	} else if (typeof arg == 'string') {

		return modalsConfig.textToView(arg, options)

	} else if (isViewClass(arg)) {

		return buildViewByKey({ view: arg, viewOptions: options.viewOptions }, 'view');

	} else if (isView(arg)) {

		return arg;

	} else if (typeof arg === 'function') {

		return convertArgToView(arg(), options);

	} else {

		return modalsConfig.argToView(arg);
	}

}

function renderView(view, options) {
	let { renderOptions, stackOptions } = (options || {});
	let region = renderInNode(view, renderOptions);
	addToStack(view, stackOptions);
	return region;
}

export function addToStack(view, stackOptions) {
	viewsStack.push(view, stackOptions);
}


function getReturnValue(view, options) {
	if (options && typeof options.return === 'function') {
		return options.return(view);
	} else {
		return view;
	}
}

export function modal(arg, options) {
	options = _.extend({}, _.omit(modalsConfig, 'textToView', 'argToView'), options);
	let view = convertArgToView(arg, options);
	if (!view) {
		throw new Error('Modal view not constructed');
	}
	let region = renderView(view, options);
	if (typeof options.afterShow == 'function') {
		options.afterShow({
			region,
			modalView: view,
		});
	}
	return getReturnValue(view, options);
}


modal.config = modalsConfig;
