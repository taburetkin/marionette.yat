import Model from './model'
export default Model.extend({
	defaults:{
		url: undefined,
		label: undefined,
		target: '_self',
		level: 0,
	}
});