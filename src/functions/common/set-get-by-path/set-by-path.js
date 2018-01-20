import _ from 'underscore';
import Bb from 'backbone';
import setByPathArray from './_set-by-path-array';

const setByPath = function (obj, pathStr, value, force, silent) {
	
	if(obj == null || !_.isObject(obj)) return obj;

	if (_.isObject(pathStr)) {
		value = pathStr.value;
		force = pathStr.force;
		silent = pathStr.silent;
		pathStr = pathStr.path;
	}
	if (pathStr == null || typeof pathStr !== 'string' || pathStr == '')
		throw new Error('can not set value to object by path. path is empty');

	var pathArray = pathStr.split('.');
	var arrlen = pathArray.length;
	var prop = pathArray.shift();
	force = force != false; 

	setByPathArray.call(obj, prop, pathArray, value, force, silent);

	if (obj instanceof Bb.Model && arrlen > 1 && !silent) {
		obj.trigger('change:' + prop, this);
		obj.trigger('change', this);
	}

	return obj;
};

export default setByPath;
