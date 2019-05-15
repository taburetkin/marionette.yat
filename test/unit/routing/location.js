
let Location = function(href) {
	this.replace(href);
};

_.extend(Location.prototype, {
	parser: document.createElement('a'),

	replace: function(href) {
		this.parser.href = href;
		_.extend(
			this,
			_.pick(
				this.parser,
				'href',
				'hash',
				'host',
				'search',
				'fragment',
				'pathname',
				'protocol'
			)
		);

		// In IE, anchor.pathname does not contain a leading slash though
		// window.location.pathname does.
		if (!/^\//.test(this.pathname)) this.pathname = '/' + this.pathname;
	},

	toString: function() {
		return this.href;
	}
});

export default Location;
