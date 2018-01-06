import {Error} from 'backbone.marionette';
import mix from './helpers/mix';


let YatError = Error.extend({},{
	Http400(message){
		return this.Http(400,message);
	},
	Http401(message){
		return this.Http(401,message);
	},
	Http403(message){
		return this.Http(403,message);
	},
	Http404(message){
		return this.Http(404, message);
	},
	Http500(message){
		return this.Http(500, message);
	},
	Http(status, message){
		let error = new this({message:message, name:"HttpError"});
		error.status = status;
		return error;
	},
	NotFound(message){
		return this.Http404(message);
	},
	NotAuthorized(message){
		return this.Http401(message);
	},
	Forbidden(message){
		return this.Http403(message);
	},
});

export default YatError;
