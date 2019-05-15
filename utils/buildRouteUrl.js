import _ from 'underscore';

function replaceKeys(text, data) {
	let result = text.replace(/:(\w+)/g, (founded, dataKey) => {
		return data[dataKey];
	});
	return result;
}

export default function buildRouteUrl(route, data = {}, search = '', hash = '') {

	// normalizing search and hash;
	search = search && search.toString() || ''; // if its a URLSearchParams
	if (search && search[0] !== '?') {
		search = '?' + search;
	}

	if (hash && hash[0] !== '#') {
		hash = '#' + hash;
	}


	// in-first: look up for temporary chunks
	let replaced = route.replace(/\([^:)]*(:[^:)]+)+\)/g, (match) => {
		let keys = match.match(/:\w+/g);
		if (!keys || !keys.length) return '';
		keys = _.map(keys, key => key.substring(1));
		let present = _.every(keys, key => data[key] != null);

		// all keys should present in hash, otherwise remove whole temporary block
		if (!present) return '';

		let result = replaceKeys(match, data);

		return result.substring(1, result.length - 1);
	});

	//in-seconde: replace required parameters
	replaced = replaceKeys(replaced, data);

	replaced = replaced.replace(/\*(.+$)/g,(found, key) => data[key] || '');

	return replaced + search + hash;

}
