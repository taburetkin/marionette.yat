import mix from '../utils/mix';
import getOption from './getOptionMixin';
import ready from './readyMixin';
import asyncTrigger from './asyncTriggerMixin';

const commonMixin = Base => mix(Base).with(getOption, ready, asyncTrigger);

export default commonMixin;
