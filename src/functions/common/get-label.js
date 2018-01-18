import get from './smart-get';
export default (context, opts = {}) => {
	let fields = ['getLabel', 'label', 'getName', 'name', 'getValue', 'value'];
	opts.fields = fields.concat(opts.fields || []);
	return get(context, opts);
}
