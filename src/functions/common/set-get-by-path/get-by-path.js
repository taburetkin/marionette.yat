import _ from 'underscore';
import getByPathArray from './_get-by-path-array';

function getByPath (obj, path) {

	if(obj == null || !_.isObject(obj) || path == null || path == '') return;

	var pathArray = typeof path === 'string' ? path.split('.') 
					: path instanceof Array ? [].slice.call(path)
					: [path];

	var prop = pathArray.shift();

	return getByPathArray(obj, prop, pathArray);
}

export default getByPath;
