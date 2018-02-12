import Config from './../../YatConfig';

const config = new Config('yat:modals:singleton',{ noRadio: true });

let modalsShowFull = {
	bg: true,
	close:true,
}

let modalsShowSimple = {
	bg:false,
	close:false,
}

let modalOptionsDefault = {
	closeOnClickOutside: true,
	closeOnPromise: true,
	preventClose: false,
	asPromise: false,
};

let modalsCssDefaults = {
	wrapper:'yat-modal-wrapper',
	bg:'yat-modal-bg',
	contentWrapper:'yat-modal-content-wrapper',
	close: 'yat-modal-close',
	header: 'yat-modal-header',
	content: 'yat-modal-content',
	actions: 'yat-modal-actions',
	resolve: 'yat-modal-resolve',
	reject: 'yat-modal-reject',
}

let modalsLabelsDefaults = {
	close: '&times;',
	resolve: 'ok',
	reject: 'cancel'
}

let modalsDefaultModifiers = {
	'after:render':{
		'centering'(){
			let box = this.$('[data-role=modal-content-wrapper]');
			if(!box.length) return;
			let ch = box.outerHeight();
			let wh = $(window).height();
			let dif = (wh - ch) / 3;
			if(dif > 0 && box.length)
				box.css({
					'margin-top':dif + 'px'
				});
		}
	}
}


let modalsTypes = {
	full: {
		css: modalsCssDefaults,
		show: modalsShowFull,
		labels: modalsLabelsDefaults,
		options: modalOptionsDefault,
		modifiers: modalsDefaultModifiers,
	},
	simple: {
		css: modalsCssDefaults,
		show: modalsShowSimple,
		labels: modalsLabelsDefaults,
		options: modalOptionsDefault,
		modifiers: modalsDefaultModifiers,
	},
	confirm: {
		css: modalsCssDefaults,
		show: modalsShowFull,
		labels: modalsLabelsDefaults,
		options: {
			closeOnClickOutside: true,
			closeOnPromise: true,
			preventClose: false,
			asPromise: true,
		},
		modifiers: modalsDefaultModifiers,
	}
}




config.set('types.full', modalsTypes.full);
config.set('types.simple', modalsTypes.simple);
config.set('types.confirm', modalsTypes.confirm);

config.set('defaultShow', modalsShowFull);
config.set('defaultCss', modalsCssDefaults);
config.set('defaultLabels', modalsLabelsDefaults);
config.set('defaultModifiers', modalsDefaultModifiers);

export default config;
