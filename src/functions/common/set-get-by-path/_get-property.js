import _ from 'underscore';
import Bb from 'backbone';
function getProperty(name)
{
	if (this instanceof Bb.Model)
		return this.get(name);
	else
		return this[name];
}
export default getProperty;	
