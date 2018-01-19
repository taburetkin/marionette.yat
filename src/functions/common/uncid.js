import _ from 'underscore';
export default function(arg){
	let cid = (this.cid || '').toString();
	if(!cid) return arg;
	if(arg == null || (typeof arg !== 'string')) return arg;

	let pattern = new RegExp(`^${cid}:`);
	return arg.replace(pattern, '');
}
