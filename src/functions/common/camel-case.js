import _ from 'underscore';

// camelCase('asd:qwe:zxc') -> asdQweZxc
// camelCase('asd:qwe:zxc', true) -> AsdQweZxc
export default function camelCase(text, first) {
	if (!_.isString(text)) return text;
	var splitter = first === true ? /(^|:)(\w)/gi : /(:)(\w)/gi;
	return text.replace(splitter, (match, prefix, text) => text.toUpperCase());
}
