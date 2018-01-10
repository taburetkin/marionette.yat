import mix from './helpers/mix';
import Stateable from './mixins/stateable';
import YatObject from './YatObject';

const USERSTATE_FIELD = 'user';

let Base = mix(YatObject).with(Stateable);
let YatUser = Base.extend({	
	constructor(...args){
		Base.apply(this, args);
		this._initializeYatUser();
	},
	_initializeYatUser(){},	
	channelName: 'identity',
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
	}
});
let user = new YatUser();
export default user;
