import _ from 'underscore';
import setByPath from '../set-get-by-path/set-by-path';

function unFlattenObject(obj) {

	if (obj == null || !_.isObject(obj)) return;
	var res = {};
	for (var e in obj) {
		setByPath(res, e, obj[e], true);
	}
	return res;

}

export default unFlattenObject;
