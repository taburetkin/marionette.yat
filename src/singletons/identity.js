
import mix from '../helpers/mix';
import Stateable from '../mixins/stateable';
import YatObject from '../YatObject';
import Bb from 'backbone';
import _ from 'underscore';
import YatError from '../YatError';

const IDENTITY_CHANNEL = 'identity';

let Base = mix(YatObject).with(Stateable);

let nativeAjax = $ && $.ajax;

let Identity = Base.extend({	
	constructor(...args){
		Base.apply(this, args);
		this._initializeYatUser();
	},
	_initializeYatUser(){},	
	bearerTokenUrl: undefined,
	bearerTokenRenewUrl: undefined, //if empty `bearerTokenUrl` will be used
	identityUrl: undefined, //if set then there will be a request to obtain identity data	
	channelName: IDENTITY_CHANNEL,
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

let identity = new Identity();
export default identity;
