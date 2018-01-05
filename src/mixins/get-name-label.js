export default (Base) => class extends Base {
	getName(){
		return this.getProperty('name') || this.id || this.cid;
	}
	getLabel(){
		return this.getProperty('label') || this.getName();
	}
}