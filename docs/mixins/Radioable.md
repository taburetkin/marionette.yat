# Radioable mixin
extends marionette radio functionality.

differences from marionette functionality
* radio initializes after `initialize` only if instance has property `initRadioOnInitialize` equal to true
or when accessed channel view `getChannel`
* understand `channel` option. You can pass `channelName` as usual or a `channel` with radio channel
* has method `radioTrigger`
* has method `radioRequest`

`radioTrigger`, `radioRequest` or `getChannel` will initialize radio if it not initialized.
