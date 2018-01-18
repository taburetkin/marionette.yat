import get from './smart-get';
export default (context, opts = {}) => {
	let fields = ['getValue', 'value', 'getId', 'id', 'getName', 'name', 'getLabel', 'label', 'cid'];
	opts.fields = fields.concat(opts.fields || []);
	return get(context, opts);
}
