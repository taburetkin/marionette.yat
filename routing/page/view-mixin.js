import { isView } from '../../utils/is-utils';
import { buildViewByKey } from '../../utils/build-utils';
export default {
	getView(req) {
		if (isView(this._view) && !this._view.isDestroyed()) {
			return this._view;
		}
		let view = this._view = this.buildView(req);
		this.listenTo(view, 'destroy', () => this.stopListening(view));
		return view;
	},
	buildView(req) {
		let defaultOptions = {
			app: this.app,
			page: this,
			req
		};
		return buildViewByKey(this, 'view', { defaultOptions });
	},
}
