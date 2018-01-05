export default (Base) => {
	class Mixin extends Base{
		constructor(...args){
			super(...args);
			let initRadioOnInitialize = !(this.getProperty('initRadioOnInitialize') === true);
			this._initRadio({skip: initRadioOnInitialize});
		}
		getChannel () {
			if(!this._channel) this._initRadio({skip:false});
			return this._channel;
		}
		_initRadio(opts = {skip:true}){
			if(opts.skip == true) return;

			let channelName = this.getProperty('channelName');
			if(!channelName){
				let channel = this.getProperty('channel');
				if(channel)
					this.channelName = channel.channelName;
			}

			super._initRadio();
		}
		radioRequest(...args){
			let channel = this.getChannel();
			if(channel) channel.request(...args);
		}
		radioTrigger(...args){
			let channel = this.getChannel();
			if(channel) channel.trigger(...args);
		}
	}

	return Mixin;
}