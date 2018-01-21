import _ from 'underscore';
import Bb from 'backbone';
import getProperty from './_get-property';

function setProperty(context, name, value, options) {
	if (context instanceof Bb.Model) {
		context.set(name, value, { silent: true });
	}
	else {
		context[name] = value;
	}

	if(value instanceof Bb.Model){
		options.models.push({
			path: options.passPath.join(':'),
			property: name,
			model: value
		});		
	}

	options.passPath.push(name);

	return getProperty(context, name);
}

export default setProperty;
