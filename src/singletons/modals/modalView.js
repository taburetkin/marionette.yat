import _ from 'underscore';
import config from './config';
import Bb from 'backbone';
import Mn from 'backbone.marionette';
import YatView from './../../YatView.js';
import mix from './../../helpers/mix';
import OptionProperty from './../../mixins/get-option-property';
let template = _.template(
`<% if(show.bg) {%><div <%= css('bg') %> data-role="modal-bg"></div><% } %>
<div <%= css('contentWrapper') %> data-role="modal-content-wrapper">
	<% if(show.close) {%><button  <%= css('close') %> data-role="modal-close"><%= label('close') %></button><% } %>
	<% if(show.header) {%><header <%= css('header') %> data-role="modal-header"><%= header %></header><% } %>
	<div <%= css('content') %> data-role="modal-content"><%= text %></div>
	<% if(show.actions) {%>
	<div <%= css('actions') %> data-role="modal-actions">
		<% if(show.resolve) {%><button <%= css('resolve') %> data-role="modal-resolve"><%= label('resolve') %></button><% } %>
		<% if(show.reject) {%><button <%= css('reject') %> data-role="modal-reject"><%= label('reject') %></button><% } %>
	</div>
	<% } %>
</div>
`);



const ModalView = mix(YatView).with(OptionProperty).extend({

	renderOnReady: true,
	template: template,

	attributes(){
		return {'data-role':'modal-wrapper'};
	},

	initialize(options){
		this.mergeOptions(options, ['content', 'header', 'text']);
		
		let _this = this;

		if(this.getOption('asPromise') === true){
			this.promise = new Promise(function(resolve, reject){
				_this.once('resolve',(arg) => resolve(arg));
				_this.once('reject',(arg) => reject(arg));
			});
		}

		this.once('resolve reject',(arg, destroying) => {
			this.preventClose = false;
			
			if(this.getConfigValue('options','closeOnPromise') && !destroying){
				console.log('YAY');
				this.destroy();
			}			
		});

	},

	canBeClosed(){
		return this.getProperty('preventClose') !== true;
	},
	destroy(){
		
		if(!this.canBeClosed()) return;

		return Mn.View.prototype.destroy.apply(this, arguments);

	},

	ui:{
		'bg': '[data-role="modal-bg"]',
		'contentWrapper': '[data-role="modal-content-wrapper"]',		
		'text':'[data-role="modal-content"]',
		'header':'[data-role="modal-header"]',
		'close':'[data-role="modal-close"]',
		'resolve':'[data-role="modal-resolve"]',
		'reject':'[data-role="modal-reject"]',
	},
	triggers:{
		'click @ui.close':{ event: 'click:close', stopPropagation: true },
		'click @ui.reject':{ event: 'click:reject', stopPropagation: true },
		'click @ui.resolve':{ event: 'click:resolve', stopPropagation: true },
		'click @ui.text':{ event: 'click:content', stopPropagation: true },
		'click @ui.contentWrapper': { event: 'click:content:wrapper', stopPropagation: true },
		'click @ui.bg':{ event: 'click:bg', stopPropagation: true },
		'click': { event: 'click:wrapper', stopPropagation: true },
	},
	onBeforeDestroy(){ 
		this.trigger('reject', this.getProperty('reject'), true);
	},

	onClickClose(){ this.destroy(); },

	onClickResolve(){ 
		this.trigger('resolve', this.getProperty('resolve'));
	},
	onClickReject(){ 
		this.trigger('reject', this.getProperty('reject'));
	},

	onClickBg(){ this.clickedOutsideOfModal(); },
	onClickWrapper(){ this.clickedOutsideOfModal(); },

	clickedOutsideOfModal(){
		if(this.getConfigValue('options','closeOnClickOutside') === true)
			this.destroy();

	},


	onBeforeRender(){
		//apply wrapper class here;
		let cfg = this.getConfig();
		cfg.css.wrapper && this.$el.addClass(cfg.css.wrapper);
		
		this.$el.appendTo($('body'));
	},
	onRender(){
		if(this.content instanceof Bb.View){
			this.showChildView('content', this.content);
			this.content.inModal = this;
		}
	},
	
	_getModalOptions(){
		let h = {};
		if(this.getOption('closeOnClickOutside') != null)
			h.closeOnClickOutside = this.getOption('closeOnClickOutside');
		if(this.getOption('closeOnPromise') != null)
			h.closeOnPromise = this.getOption('closeOnPromise');
		if(this.getOption('preventClose') != null)
			h.preventClose = this.getOption('preventClose');
		if(this.getOption('asPromise') != null)
			h.asPromise = this.getOption('asPromise');

		return h;
	},
	getConfigValue(section,name){
		let cfg = this.getConfig() || {};
		return (cfg[section] || {})[name];
	},
	getConfig(key){		
		if(this.config) return this.config;

		let typeName = this.getOption('type') || 'simple';
		let type = _.extend({},config.get('types.' + typeName) || {});

		type.show = _.extend({}, config.get('dafaultShow'), type.show, this.getOption('show'));
		type.labels = _.extend({}, config.get('defaultLabels'), type.labels, this.getOption('labels'));
		type.css= _.extend({}, config.get('defaultCss'), type.css, this.getOption('css'));
		
		type.options = _.extend({}, config.get('defaultOptions'), type.options, this._getModalOptions());

		if(type.show.header == null && this.getOption('header'))
			type.show.header = true;
		
		if(type.show.resolve == null && (this.getOption('resolve') || type.options.asPromise))
			type.show.resolve = true;
		if(type.show.reject == null && this.getOption('reject'))
			type.show.reject = true;

		if(type.show.actions == null && (type.show.resolve || type.show.reject))
			type.show.actions = true;

		console.log(typeName,type);
		console.log(config);

		return this.config = type;
	},

	templateContext(){
		let cfg = this.getConfig();
		return {
			css(name){
				return cfg.css[name] ? ` class="${cfg.css[name]}"` : '';
			},
			label(name){
				return cfg.labels[name] || '';
			},
			show : cfg.show,
			text: this.getOption('text'),
			header: this.getOption('header'),
		}
	}
});

export default ModalView;
