import {Object} from 'backbone.marionette';
export default (Base) => {
	let Mixin = Base.extend({
		constructor(...args){
			Base.apply(this, args);
			let initRadioOnInitialize = !(this.getProperty('initRadioOnInitialize') === true);
			this._initRadio({skip: initRadioOnInitialize});
		},
		getChannel () {
			if(!this._channel) this._initRadio({skip:false});
			return this._channel;
		},
		_initRadio(opts = {skip:true}){
			if(opts.skip == true) return;

			let channelName = this.getProperty('channelName');
			if(!channelName){
				let channel = this.getProperty('channel');
				if(channel)
					this.channelName = channel.channelName;
			}
			Object.prototype._initRadio.call(this);
		},
		radioRequest(...args){
			let channel = this.getChannel();
			if(channel) channel.request(...args);
		},
		radioTrigger(...args){
			let channel = this.getChannel();
			if(channel) channel.trigger(...args);
		},
	});

	return Mixin;
}
