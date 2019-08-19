import _ from 'underscore';
export default function takeFirst(key, ...contexts) {
	if (key == null) return;
	let founded;
	_.some(contexts, context => {
		if (context && context[key] != null) {
			founded = context[key];
			return true;
		}
	});
	return founded;
}
