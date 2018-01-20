import _ from 'underscore';
import Bb from 'backbone';
import getProperty from './_get-property';

function setProperty(name, value, silent) {
	if (this instanceof Bb.Model) {
		var hash = {[name]:value};
		//sethash[name] = value;
		var options = { silent };
		//if (silent) optshash.silent = true;
		this.set(hash, options);
	}
	else
		this[name] = value;

	return getProperty.call(this, name);
}

export default setProperty;
