import LinkModel from '../models/link';
export default (url, label = url) => {
	return new Model({
		url:url,
		label: url
	});
}