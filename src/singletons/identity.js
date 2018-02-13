
import mix from '../helpers/mix';
import Stateable from '../mixins/stateable';
import YatObject from '../YatObject';
import Bb from 'backbone';
import _ from 'underscore';
import YatError from '../YatError';

const IDENTITY_CHANNEL = 'identity';

let Base = mix(YatObject).with(Stateable);

let nativeAjax = $ && $.ajax;

let Identity2 = Base.extend({	
	channelName: IDENTITY_CHANNEL,
	constructor(...args){
		Base.apply(this, args);
		this._initializeYatUser();
	},
	_initializeYatUser(){},	
	bearerTokenUrl: undefined,
	bearerTokenRenewUrl: undefined, //if empty `bearerTokenUrl` will be used
	identityUrl: undefined, //if set then there will be a request to obtain identity data	
	tokenExpireOffset: 120000, // try to renew token on 2 minutes before access token expires 
	isAnonym(){
		return !this.getState('id');
	},
	isUser(){
		return !this.isAnonym();
	},
	isMe(id){
		return id && this.getState('id') === id;
	},
	update(hash){
		this.setState(hash);
		this.trigger('change');
	},
	logIn(hash){
		if(!hash.id) return;
		this.clearState();
		this.update(hash);
		this.trigger('log:in');
	},
	logOut(){
		this.clearState();
		this.trigger('change');
		this.setTokenObject(null);
		this.trigger('log:out');
	},
	getBearerToken(data){
		let url = this.getOption('bearerTokenUrl');
		let promise = new Promise((resolve, reject) => {
			nativeAjax({url, data, method:'POST'})
				.then(
					(token) => { 
						this.setTokenObject(token);
						resolve(token);
						//this.triggerMethod('token', token);
					},
					(error) => reject(error)
				);
	
		});
		return promise;
	},
	getIdentity(){
		if(this.getProperty('identityUrl') == null) return;

		let model = new Bb.Model();
		model.url = this.getProperty('identityUrl');

		let promise = new Promise((resolve, reject) => {
			model.fetch().then(() => {
				let hash = model.toJSON();
				this.logIn(hash)
				resolve(hash);
			},(error) => {				
				reject(error);
			});
		});
		return promise;
	},
	ajax(...args){
		let options = args[0];
		options.headers = _.extend({}, options.headers, this.getAjaxHeaders());
		let needRefresh = this.isTokenRefreshNeeded();
		if(!needRefresh){
			return $.ajax(...args); //nativeAjax.apply($, args);
		}
		else {
			return this.refreshBearerToken()
				.then(() => nativeAjax.apply($, args))
				.catch((error) =>{ 
					let promise = $.Deferred();
					promise.reject(error);
					return promise;
				});
		}
	},
	getAjaxHeaders(){
		this._ajaxHeaders || (this._ajaxHeaders = {});
		return this._ajaxHeaders;
	},
	_updateHeaders(){
		let token = this.getTokenValue();
		let headers = this.getAjaxHeaders();
	
		if(token){
			headers.Authorization = 'Bearer ' + token;
			headers.Accept = 'application/json';
		}else{
			delete headers.Authorization;
		}
	},	
	setTokenObject(token, opts = {}){

		if(token != null && _.isObject(token))
			token.expires = new Date(Date.now() + (token.expires_in * 1000));

		this._token = token;
		if(opts.silent !== true)
			this.triggerMethod('token:change', token);

		this._updateHeaders();
		this._replaceBackboneAjax();

		if(token != null && opts.identity !== false)
			this.getIdentity().catch().then(() => this.triggerMethod('token:identity:change'));
		else
			this.triggerMethod('token:identity:change');
	},
	getTokenObject(){
		return this._token;
	},
	_replaceBackboneAjax(){
		let token = this.getTokenValue();
		if(!token)
			Bb.ajax = $.ajax;//$.ajax = nativeAjax;
		else
			Bb.ajax = (...args) => this.ajax(...args); //$.ajax = (...args) => Yat.identity.ajax(...args);
	},
	getTokenValue(){
		let token = this.getTokenObject();
		return token && token.access_token;
	},
	getRefreshToken(){
		let token = this.getTokenObject();
		return token.refresh_token;
	},
	getTokenExpires(){
		let token = this.getTokenObject();
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
	isTokenRefreshNeeded(){
		let token = this.getTokenValue();
		if(!token) return false;	
		return !this.getTokenSeconds();
	},
	refreshBearerToken(opts = {}){
		let bearerTokenRenewUrl = this.getProperty('bearerTokenRenewUrl') || this.getProperty('bearerTokenUrl');
		let doRefresh = opts.force === true || this.isTokenRefreshNeeded();
		return new Promise((resolve, reject) => {
			if(!doRefresh){
				resolve();
				return;
			}
	
			if(bearerTokenRenewUrl == null){
				reject(new Error('Token expired and `bearerTokenRenewUrl` not set'));
				return;
			}
			let data = {
				'grant_type':'refresh_token',
				'refresh_token': this.getRefreshToken()
			};
			nativeAjax({
				url:bearerTokenRenewUrl, 
				data,
				method:'POST'
			})
				.then((token) => {
					this.setTokenObject(token);
					resolve();
				}, () => {
					this.triggerMethod('refresh:token:expired');
					reject(YatError.Http401());
				});
	
		});
	}
});


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
		return this.requestToken(data, url);
	},
	requestToken(data, url){
		url || (url = this.getOption('tokenUrl'));
		if(!url) return Promise.reject('token url not specified');
		let promise = new Promise((resolve, reject) => {
			this.tokenXhr(url, data)
				.then(
					(token) => { 
						this.setToken(token);
						resolve(token);
					},
					(error) => reject(error)
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
	isRefreshNecessary(){
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
	authorized: false,	
	isAuth(){
		return this.authorized === true;
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
			this.triggerChange();
		}, () => {
			this.syncUserEror();
			this.triggerChange();
		});
	},
	syncUserEror(){
		this.reset();
	},
	applyUser(user){
		let id = user == null ? null : user.id;
		this.setMe(id);
	},
	getUser(){
		return this.user;
	},
	setUser(user){
		this.user = user;
		this.applyUser(user);
	},
	isUser(){
		return this.user && !!this.user.id;
	},
}

const Identity = mix(YatObject).with(Auth, Ajax, Token, User).extend({
	triggerReady(){
		this.triggerMethod('change');
	},
	reset(){
		let user = this.getUser();
		user.clear();
		this.applyUser(user);
		this.authorized = false;
		this.triggerMethod('reset');
	}
});

let identity = new Identity();
export default identity;
