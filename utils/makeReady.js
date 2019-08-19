//import config from './config';
export default function makeReady(view) {
	if (view._supportsReady) {
		view.ready();
	} else {
		let multipleReady = view.getOption('multipleReadyAllowed');
		if (view._isReady && !multipleReady) return;
		view._isReady = true;
		view.triggerMethod
			? view.triggerMethod('ready')
			: view.trigger('ready')
	}
}
//config.makeReadyUtil = makeReady;
//export default makeReady;
