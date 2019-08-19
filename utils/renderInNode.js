import { Region } from '../vendors';

function normalizeElement(selector) {
	if (selector instanceof Element) {
		return selector
	} else if (selector && selector.jquery) {
		return selector.get(0);
	} else if (typeof selector === 'string') {
		return document.querySelector(selector);
	}
}


const BaseNodeRegion = Region;
// .extend({
// 	onEmpty() {
// 		let shouldDestroy = this.getOption('destroyOnEmpty');
// 		if (shouldDestroy) {
// 			this.destroy();
// 			this.el.remove();
// 		}
// 	},
// });

// const RegionOptions = {
// 	onEmpty() {
// 		let shouldDestroy = this.getOption('destroyOnEmpty');
// 		if (shouldDestroy) {
// 			this.destroy();
// 			this.el.remove();
// 		}
// 	},
// }


const renderInNode = function(view, opts) {
	let options = Object.assign({}, renderInNode.config, opts);
	let { el, appendToEl, strictRegionElement, replaceElement, destroyOnEmpty } = options;
	let regionEl;
	//const NodeRegion = options.Region;
	el = normalizeElement(el);
	if (!(el instanceof Element)) {
		if (strictRegionElement) {
			throw new Error('unable to create region, region el is undefined');
		} else {
			destroyOnEmpty = true;
			el = document.body;
			appendToEl = true;
		}
	}

	if (appendToEl !== false) {
		replaceElement = replaceElement != null ? replaceElement : true;
		regionEl = document.createElement('div');
		el.appendChild(regionEl);
	} else {
		regionEl = el;
	}

	const region = renderInNode.config.createRegion({ el: regionEl, replaceElement, destroyOnEmpty });
	region.show(view);
	return region;
};

renderInNode.config = {
	//destroyOnEmpty: false,
	//replaceElement: false,
	Region: BaseNodeRegion,
	RegionOptions: {
		onEmpty() {
			let shouldDestroy = this.getOption('destroyOnEmpty');
			if (shouldDestroy) {
				this.destroy();
				this.el.remove();
			}
		},
	},
	createRegion(options) {
		options = Object.assign({}, renderInNode.config.RegionOptions, options);
		return new renderInNode.config.Region(options); /**/
	}
};

export default renderInNode;
