import _ from 'underscore';
import Bb from 'backbone';
import getProperty from './_get-property'
import setProperty from './_set-property';

function setByPathArr(propertyName, pathArr, value, force, silent) {

	if (typeof propertyName !== 'string' || propertyName == '')
		throw new Error('can not set value on object by path. propertyName is empty');

	if (pathArr.length == 0)
		return setProperty.call(this, propertyName, value);

	var prop = getProperty.call(this, propertyName);
	if (!_.isObject(prop) && !force)
		return;
	else if (!_.isObject(prop) && force)
		prop = setProperty.call(this, propertyName, {});


	var nextName = pathArr.shift();

	return setByPathArr.call(prop, nextName, pathArr, value, force);
}

export default setByPathArr;
