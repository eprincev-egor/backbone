"use strict";

var Backbone = {},
    previousBackbone;

// Current version of the library. Keep in sync with `package.json`.
Backbone.VERSION = "1.3.4";

if (typeof window !== "undefined") {
    // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
    // the `$` variable.
    Backbone.$ = window.$;

    Backbone._ = window._;

    previousBackbone = window.Backbone;
}


// Wrap an optional error callback with a fallback error event.
var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
        if (error) error.call(options.context, model, resp, options);
        model.trigger("error", model, resp, options);
    };
};
Backbone.wrapError = wrapError;

// Throw an error when a URL is needed, and none is supplied.
var urlError = function() {
    throw new Error("A \"url\" property or function must be specified");
};
Backbone.urlError = urlError;

Backbone.noConflict = function() {
    window.Backbone = previousBackbone;
    return this;
};

module.exports = Backbone;
