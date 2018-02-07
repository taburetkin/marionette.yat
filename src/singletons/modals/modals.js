import $ from 'jquery';
import _ from 'underscore';
import Bb from 'backbone';
import mixin from './../../helpers/mix.js';
import YatObject from './../../YatObject.js';
import Stateable from './../../mixins/stateable.js';
import YatError from './../../YatError.js';
import View from './../../YatView.js';
import __ from './../../functions/common/common.js';
import ModalView from './modalView';
import config from './config';

let ModalEngine = mixin(YatObject).with(Stateable).extend({
	constructor(...args){
		this.modals = [];
		YatObject.apply(this, args);
		this.listenForEsc = _.bind(this._listenForEsc, this);
		$(() => {
			this.doc = $(document);
			this.doc.on('keyup', this.listenForEsc);
		});
	},
	channelName:'modals',
	
	show(...args){
		let options = this._normalizeArguments(...args);
		return this._create(options);
	},
	remove(modal){

		if(!modal)
			modal = _.last(this.modals);

		modal && modal.destroy();
	},

	_listenForEsc(){

		if(this.modals.length)
			this.remove();
	},
	_create(options){
		let modal = new ModalView(options);
		let _this = this;
		this.listenToOnce(modal, 'destroy', function(){ _this._remove(modal); })
		this.modals.push(modal);
		return modal;
	},
	_remove(modal){

		if(!modal) return;

		let ind = this.modals.indexOf(modal);
		if(ind > -1) this.modals.splice(ind, 1);

		this.stopListening(modal);

	},
	_normalizeArguments(...args){
		
		let options = {};
		let len = args.length;
		if(!len)
			return;

		if(len === 1){
			if(__.isView(args[0]))
				options.content = args[0];
			else if(_.isString(args[0]))
				options.text = args[0];
			else if(_.isObject(args[0]))
				_.extend(options, args[0]);
		} else if (len === 2){
			if(_.isString(args[0]) && _.isString(args[1])){
				options.header = args[0];
				options.text = args[1];
			}else if(_.isString(args[0]) && __.isView(args[1])){
				options.header = args[0];
				options.content = args[1];
			}else if(_.isString(args[1]) && __.isView(args[0])){
				options.header = args[1];
				options.content = args[0];
			}else if(_.isString(args[0]) && _.isObject(args[1])){
				_.extend(options, args[1]);
				if(__.isView(options.content))
					options.header = args[0];
				else
					options.text = args[0];
			}else if(__.isView(args[0]) && _.isObject(args[1])){
				_.extend(options, args[1]);
				options.content = args[0];
			}
		} else {
			if(_.isObject(args[3]))
				_.extend(options, args[3]);
			if(_.isObject(args[2]))
				_.extend(options, args[2]);
			else if(_.isString(args[2]))
				options.type = args[2];

			let two = this._normalizeArguments(args[0], args[1]);
			_.extend(options, two);
		}

		return options;
	},
	onBeforeDestroy(){
		if(this.doc)
			this.doc.off('keyup',this.listenForEsc);
	}
});

const modalEngine = new ModalEngine();


export default {
	show(...args){
		return modalEngine.show(...args);
	},
	addTypeConfig(name, cfg){
		if(!name || !_.isString(name)) return;
		config.set('types.'+name,cfg);
	},
	getTypeConfig(name){
		if(!name || !_.isString(name)) return;
		return config.get('types.'+name);
	},
};
