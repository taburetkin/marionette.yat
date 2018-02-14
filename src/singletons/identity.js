
import mix from '../helpers/mix';
import Stateable from '../mixins/stateable';
import YatObject from '../YatObject';
import Bb from 'backbone';
import Mn from 'backbone.marionette';
import _ from 'underscore';
import $ from 'jquery';
import YatError from '../YatError';

const IDENTITY_CHANNEL = 'identity';

let Base = mix(YatObject).with(Stateable);

const Ajax = {
	
	tokenUrl:'',
	nativeAjax: $.ajax,

	ajax(...args){
		return this.ensureToken()
			.then(() => { 
				let options = args[0];
				options.headers = _.extend({}, options.headers, this.getAjaxHeaders());
				return this.nativeAjax.apply($, args)
			})
			.catch((error) =>{ 
				let promise = $.Deferred();
				promise.reject(error);
				return promise;
			});
	},
	tokenXhr(url, data, method = 'POST'){
		return this.nativeAjax({ url, data, method });
	},
	ensureToken(opts = {}){
		let refresh = this.isRefreshNecessary(opts);
		if(!refresh) return Promise.resolve();

		let url = this.getOption('refreshTokenUrl');
		let data = this.getRefreshTokenData();
		return this.requestToken(data, url, {refresh:true});
	},
	requestToken(data, url, options = {}){
		url || (url = this.getOption('tokenUrl'));
		if(!url) return Promise.reject('token url not specified');
		let promise = new Promise((resolve, reject) => {
			this.tokenXhr(url, data)
				.then(
					(token) => { 
						this.setToken(token);
						resolve(token);
					},
					(error) => {
						if([400,401].indexOf(error.status)>-1){
							this.authenticated = false;
							this.triggerMethod('token:expired');
							reject(YatError.Http(error.status));
						}else{
							reject(error);
						}
					}
				);
		});
		return promise;
	},
	getAjaxHeaders(){
		this._ajaxHeaders || (this._ajaxHeaders = {});
		return _.extend({}, this._ajaxHeaders, this.getOption('ajaxHeader'));
	},
	replaceBackboneAjax(){
		let token = this.getTokenValue();
		if(!token)
			Bb.ajax = $.ajax;
		else
			Bb.ajax = (...args) => this.ajax(...args);
	},
	updateAjaxHeaders(){
		this._ajaxHeaders || (this._ajaxHeaders = {});
		let token = this.getTokenValue();
		let headers = this._ajaxHeaders;
		if(token){
			headers.Authorization = 'Bearer ' + token;
			headers.Accept = 'application/json';
		}else{
			delete headers.Authorization;
		}
	},
}

const Token = {
	tokenExpireOffset: undefined,
	getToken(){
		return this.token;
	},
	getTokenValue(){
		let token = this.getToken();
		return token && token.access_token;
	},
	getRefreshTokenData(){
		let token = this.getToken() || {};
		return {
			'grant_type':'refresh_token',
			'refresh_token': token.refresh_token
		};
	},
	getTokenExpires(){
		let token = this.getToken();
		return (token || {}).expires;
	},
	getTokenSeconds(){
		let expires = this.getTokenExpires();
	
		if(expires == null || isNaN(expires.valueOf())) {
			console.warn('expires is null or wrong');
			return 0;
		}
	
		let offset = this.getProperty('tokenExpireOffset');
		if(offset == null) offset = 30000; //30 sec
	
		var deadline = expires.valueOf() - offset;
		var deadlineMs = deadline - Date.now();
		return deadlineMs > 0 ? deadlineMs / 1000 : 0;
	},	
	isRefreshNecessary(opts){
		
		if(opts.force === true) return true;

		let token = this.getTokenValue();
		if(!token) return false;	
		return !this.getTokenSeconds();
	},

	setToken(token, opts = {}){
		
		this.token = this.parseToken(token, opts);

		this.beforeTokenChange(opts);
		this.triggerMethod('before:token:change', this.token, opts);

		if(opts.silent !== true)
			this.triggerMethod('token:change', this.token);
		
		this.afterTokenChange(opts);
		if(opts.identity !== false)
			this.syncUser(opts);

	},
	parseToken(token){
		if(token == null) return token;

		if(token != null && _.isObject(token))
			token.expires = new Date(Date.now() + (token.expires_in * 1000));

		return token;
	},
	beforeTokenChange(opts){
		this.updateAjaxHeaders();
		this.replaceBackboneAjax();		
	},	
	afterTokenChange(){},
}

const Auth = {
	authenticated: false,	
	isAuth(){
		return this.authenticated === true;
	},
	isAnonym(){ return !this.isAuth();},
	isMe(value){
		return value && this.isAuth() && this.me == value;
	},
	setMe(value){
		this.me = value;
	},
}

const User = {
	syncUser(opts){
		let user = this.getUser();
		if(!user) {
			this.triggerChange();
			return;
		}
		user.fetch().then(() => { 
			this.applyUser(user);
		}, () => {
			this.syncUserEror();
		});
	},
	syncUserEror(){
		this.reset();
	},
	applyUser(user){
		let id = user == null ? null : user.id;
		this.setMe(id);
		this.authenticated = id != null;
		this.triggerChange();
	},
	getUser(){
		return this.user;
	},
	setUser(user){
		this.user = user;
		this.applyUser(user);
	},
	isUser(){
		return this.isAuth() && this.user && !!this.user.id;
	},
}

const Identity = mix(YatObject).with(Auth, Ajax, Token, User).extend({
	triggerChange(){
		this.triggerMethod('change');
	},
	reset(){
		this.authorized = false;
		let user = this.getUser();
		user.clear();
		this.setToken(null,{identity: false});
		this.applyUser(user);		
		this.triggerMethod('reset');
	}
});

let identity = new Identity();
export default identity;
