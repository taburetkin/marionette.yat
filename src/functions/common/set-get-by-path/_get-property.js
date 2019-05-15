import _ from 'underscore';
import Bb from 'backbone';
function getProperty(context, name)
{
	if(context == null || !_.isObject(context) || name == null || name == '') return;
	if (context instanceof Bb.Model)
		return context.get(name);
	else
		return context[name];
}
export default getProperty;	
