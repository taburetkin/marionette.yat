import _ from 'underscore';
import Mn from 'backbone.marionette';
import Behavior from './behavior';

const DynamicClass = Behavior.extend({	
	updateElementClass(changeSource){
		let viewCls = _.result(this.view, 'className') || '';
		let addCls = _.result(this.view, 'dynamicClassName') || '';
		this.$el.attrs({
			class: viewCls + ' ' + addCls
		});

	},

	refreshOnModelChange: true,
	refreshOnDomChange: false,
	refreshOnViewRefresh: true,
	refreshOnViewBeforeRender: true,
	refreshOnViewRender: false,

	modelEvents:{
		'change'(){ this.getProperty('refreshOnModelChange') && this.updateElementClass('model:change'); }
	},
	events:{
		'change'(){ this.getProperty('refreshOnDomChange') && this.updateElementClass('dom:change'); }
	},
	onRefresh(){
		this.getProperty('refreshOnViewRefresh') && this.updateElementClass('view:refresh'); 
	},
	onRender(){
		this.getProperty('refreshOnViewRender') && this.updateElementClass('view:render'); 
	},
	onBeforeRender(){
		this.getProperty('refreshOnViewBeforeRender') && this.updateElementClass('view:before:render'); 
	},
	onRefreshCssClass(){
		this.updateElementClass();
	},
	onSetupRefreshCssClass(setup){
		if(setup == null || !_.isObject(setup)) return;
		let properties = ['refreshOnModelChange','refreshOnDomChange','refreshOnViewRefresh','refreshOnViewBeforeRender','refreshOnViewRender'];
		_(setup).each((value, property) => {
			this[property] = value === true;
		});
	},
});

export default DynamicClass;
