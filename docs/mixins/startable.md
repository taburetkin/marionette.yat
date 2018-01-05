# Startable mixin
* derived from Stateable
* has special `life` state lifecycle
* has static field `Startable` equal to true

## properties
* `allowStartWithoutStop`
* `allowStopWithoutStart`

## methods
* `start`
* `triggerStart`
* `stop`
* `triggerStop`
* `isStartNotAllowed`
* `isStopNotAllowed`
* `addStartPromise`
* `addStopPromise`

## state lifecycle
* `initialized` (idle)
	* `starting` (process)
		* `running` (idle)
  * `stopping` (process)
* `waiting` (idle)

there is a `destroyed` state. instance get this state after `destroy()`.
by default instance can not start if its not in idle or already started

instance can not stop if its not `running`.

this behavior can be changed via properties `allowStartWithoutStop` and `allowStopWithoutStart`

