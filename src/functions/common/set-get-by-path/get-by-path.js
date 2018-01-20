import _ from 'underscore';
import getByPathArray from './_get-by-path-array';

function getByPath (obj, pathStr) {

	if(obj == null || !_.isObject(obj)) return;
	if (pathStr == null || typeof pathStr != 'string' || pathStr == '')
		throw new Error('can not get value from object by path. path is empty');

	var pathArray = pathStr.split('.');
	var prop = pathArray.shift();

	return getByPathArray.call(obj, prop, arr);
}

export default getByPath;
