export default function (Base) {
	return Base.extend({
		getName(){
			return this.getProperty('name') || this.id || this.cid;
		},
		getLabel(){
			return this.getProperty('label') || this.getName();
		}
	});
}

