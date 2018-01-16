
let getCompareABModel = (arg) => {
	if (arg instanceof Bbe.Model)
		return arg;
	else if (arg instanceof Mn.View)
		return arg.model;
	else
		return;
}
let getCompareABView = (arg) => {
	if (arg instanceof Backbone.View)
		return arg;
	else
		return;
}

let compareAB = (a, b, func) => {
	if (typeof func === 'function') {
		a = func.call(a, getCompareABModel(a), getCompareABView(a));
		b = func.call(b, getCompareABModel(b), getCompareABView(b));
	}
	return a < b ? -1
		: a > b ? 1
			: 0;
};

export default compareAB;
