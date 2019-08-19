import extend from '../utils/extend';
import { mixWith } from '../utils/mix';

const BaseClass = function() {};
BaseClass.extend = extend;
BaseClass.mixWith = mixWith;

export default BaseClass;
