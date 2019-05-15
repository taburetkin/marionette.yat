## Startable mixin
Promiseable start and stop behavior for an instance.


* derived from [Stateable](./stateable.md)
* has special `life` state lifecycle
* has static field `Startable` equal to `true`

### properties
* `allowStartWithoutStop` (default: unset) - if true do not check current life state, by default startable can not be started if its already started or starting
* `allowStopWithoutStart` (default: unset) - if true do not check current life state, by default startable can not be stopped if its already stopped or stopping
* `freezeWhileStarting` (default: false) - if true, invokes `freezeUI` while in start process and `unFreezeUI` at the end.
* `startPromises` (default: unset) - can be a property or a function, should return nothing or an array of promises for start process
* `stopPromises` (default: unset) - can be a property or a function, should return nothing or an array of promises for stop process

### methods
* `start` - call it when you need to start
* `triggerStart` - invokes at the end of start process, triggers `start` event on an instance
* `stop`- call it when you need to stop
* `triggerStop` - invokes at the end of stop process, triggers `stop` event on an instance
* `isStartNotAllowed` - if you need special logic to determine is it possible to start, override it. should return undefined to allow or `YatError` if start is not allowed
* `isStopNotAllowed` - if you need special logic to determine is it possible to stop, override it. should return undefined to allow or `YatError` if stop is not allowed
* `addStartPromise` - use this for adding own start promisses at runtime
* `addStopPromise` - use this for adding own stop promisses at runtime
* `freezeUI` - invokes in beginning of start process. by default is empty, put your own logic here
* `unFreezeUI` - invokes at the end of start process. by default is empty, put your own logic here

### state lifecycle
* `initialized` (idle)
	* `starting` (process)
		* `running` (idle)
	* `stopping` (process)
* `waiting` (idle)

also there is a `destroyed` state. Instance get this state after `destroy()`.

By default instance can not start if its not in idle or already started

Instance can not stop if its not `running`.

This behavior can be changed via properties `allowStartWithoutStop` and `allowStopWithoutStart`

### examples

#### start/stop promises

you can set start or stop promises array by property

promise should be any promisable object or a function returning promiseable object

```js
let Page1 = Yat.Page.extend({
	startPromises:[Promise1, () => { return promise2 }],
	stopPromises:[Promise3, () => { return promise4 }]
});


let Page2 = Yat.Page.extend({
	startPromises(){
		return [Promise1, () => { return promise2 }];
	},
	stopPromises(){
		return [Promise3, () => { return promise4 }];
	},
});


```

You can also add promises at runtime

```js
let Page1 = Yat.Page.extend({
	onBeforeStart(){
		this.addStartPromise(startPromise1);
		this.addStartPromise(() => {
			return startPromise2;
		});

		this.addStopPromise(stopPromise1);
		this.addStopPromise(() => {
			return stopPromise2;
		});
		
	}
});

```

Runtime promisess are checked only on start process, while permanent promisess checks always

```js

const ContactsPage = Yat.Page.extend({
	route:'contacts',
	onBeforeStart(){
		this.addStartPromise(specialContactsPromise);
	},
});

const RootPage = Yat.Page.extend({
	route:'',
	startPromises:[globalPromise1],
	onBeforeStart(){
		this.addStartPromise(specialRootPagePromise);
	},
	children:[ContactsPage]
});

const PageManager = Yat.PageManager.extend({
	id: 'allpages',
	children:[RootPage],
});

const manager = new PageManager();

manager.navigate('contacts');

/*

on navigating to `contacts` page the ContactPage will start after resolving this promises:

• globalPromise1
• specialContactsPromise

and specialRootPagePromise will be ignored because its a runtime rpomise for starting root page only



*/


```

#### isStartNotAllowed / isStopNotAllowed

this method invokes inside start and stop process for check is operation allowed or not

```js

const ContactsPage = Yat.Page.extend({
	route:'contacts',
	isStartNotAllowed(){
		if(identity.isLoged() && identity.hasNoRightsFor('contacts'))
			return YatError.Forbidden('you are not allowed to see this page');
		else if(identity.isLoged() === false && ShouldNotRedirectToLoginPage === true)
			return YatError.NotAuthorized('you are not logged');
		else if(identity.isLoged() === false)
			return YatError.HttpRedirect('login');
		
		//if start is allowed return undefined.

	}
});

const PageManager = Yat.PageManager.extend({
	id: 'allpages',
	children:[RootPage],
	onError401(error){
		this.execute('*NotAuthorized'); // will execute *NotAuthorized page without changing the url
	},
	onError403(error){
		this.execute('*Forbidden'); // will execute *Forbidden page without changing the url
	},	
	onError301(error){
		this.navigate(error.message);
	}
});

```
