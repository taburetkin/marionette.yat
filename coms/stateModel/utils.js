export const toStateValue = function(name, value) {
	if (value === true) {
		return name;
	} else if (value) {
		return value;
	}
}
