import mix from './helpers/mix';
import Stateable from './mixins/stateable';
import YatObject from './YatObject';

const IDENTITY_CHANNEL = 'identity';

let Base = mix(YatObject).with(Stateable);
let YatUser = Base.extend({	
	constructor(...args){
		Base.apply(this, args);
		this._initializeYatUser();
	},
	_initializeYatUser(){},	
	channelName: IDENTITY_CHANNEL,
	isAnonym(){
		return !this.getState('id');
	},
	isUser(){
		return !this.isAnonym();
	},
	isMe(id){
		return id && this.getState('id') === id;
	},
	update(hash){
		this.setState(hash);
		this.trigger('change');
	},
	logIn(hash){
		if(!hash.id) return;
		this.update(hash);
		this.trigger('log:in');
	},
	logOut(){
		this.clearState();
		this.trigger('change');
		this.trigger('log:out');
	}
});
let user = new YatUser();
export default user;
