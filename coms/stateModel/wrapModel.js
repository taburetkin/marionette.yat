import _ from 'underscore';
import stateMixin from './stateModel-mixin';
import Model from './model';
import { isInstance } from '../../utils';

export default function createManager(model) {
	if (model == null) {
		return new Model();
	} else if (isInstance(model, Model)) {
		return model;
	} else {
		return _.extend({}, stateMixin, {
			trackChanges: false,
			attributes: model.attributes,
			// _listeners: model._listeners,
			// cid: model.cid,
			// id: model.id,
			getEventsModel: () => model,
			get() {
				return model.get.apply(model, arguments);
			},
			set() {
				return model.set.apply(model, arguments);
			},
			// on() {
			// 	return model.on.apply(model, arguments);
			// },
			// off() {
			// 	return model.off.apply(model, arguments);
			// },
			// stopListening() {
			// 	return model.stopListening.apply(model, arguments);
			// },
			// listenTo() {
			// 	return model.listenTo.apply(model, arguments);
			// },
		});
	}
}
