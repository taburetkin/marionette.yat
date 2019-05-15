## Behavior
* `listenViewInitialize` - if true, triggers `view:initialize` on the behavior. Main goal to fix order of `onInitialize` and `onRender` calls when view rendered inside initialize method. `view:initialize` will be executed before view renders in any case.

Can be a function. Default value is set to `false`. 

* `getModel()` - returns view model.
* `cidle(argument)` - wraps argument with view cid. `let name = this.cidle('userName'); // "view123:userName"`, 
* `unCidle(argument)` - unwraps cidled argument. `let rawname = this.unCidle(name); // "userName"`
