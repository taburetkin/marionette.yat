import _ from 'underscore';
import getProperty from './get-property';

function getByPathArray(propertyName, pathArr) {
	if (!_.isObject(this))
		return;

	if (typeof propertyName != 'string' || propertyName == '')
		throw 'can not get value from object by path. propertyName is empty';

	var prop = getProperty.call(this, propertyName);

	if (pathArr.length == 0)
		return prop;

	var nextName = pathArr.shift();

	return getByPathArray.call(prop, nextName, pathArr);

}

export default getByPathArray;
