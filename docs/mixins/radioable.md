# Radioable mixin
extends marionette radio functionality.

differences from marionette functionality
* radio functionality do not initialized by default.
* understand `channel` option. You can pass `channelName` as usual or a `channel` with radio channel
* has method `radioTrigger`
* has method `radioRequest`

`radioTrigger`, `radioRequest` or `getChannel` will initialize radio if it not initialized.

you can set instance property `initRadioOnInitialize` to true for initializing radio at the instance initialize.
