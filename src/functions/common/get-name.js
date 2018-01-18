import get from './smart-get';
export default (context, opts = {}) => {
	let fields = ['getName', 'name', 'getLabel', 'label', 'getValue', 'value'];
	opts.fields = fields.concat(opts.fields || []);
	return get(context, opts);
}
