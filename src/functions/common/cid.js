import _ from 'underscore';
export default function(arg){
	
	let cid = (this.cid || '').toString();
	if(!cid) return arg;

	if(arg == null) return cid;

	return cid + ':' + arg.toString();

}
