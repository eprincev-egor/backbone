"use strict";

var Backbone = require("./main"),
    Events = require("./Events"),
    Model = require("./Model"),
    Collection = require("./Collection"),
    Router = require("./Router"),
    History = require("./History"),
    View = require("./View"),
    _ = Backbone._;

require("./sync");

Backbone.Events = Events;
Backbone.Model = Model;
Backbone.Collection = Collection;
Backbone.Router = Router;
Backbone.History = History;
Backbone.View = View;

if (typeof window !== "undefined") {
    window.Backbone = Backbone;
}

// Proxy Backbone class methods to Underscore functions, wrapping the model's
// `attributes` object or collection's `models` array behind the scenes.
//
// collection.filter(function(model) { return model.get('age') > 10 });
// collection.each(this.addView);
//
// `Function#apply` can be slow so we use the method's arg count, if we know it.
var addMethod = function(base, length, method, attribute) {
    switch (length) {
        case 1:
            return function() {
                return base[method](this[attribute]);
            };
        case 2:
            return function(value) {
                return base[method](this[attribute], value);
            };
        case 3:
            return function(iteratee, context) {
                return base[method](this[attribute], cb(iteratee, this), context);
            };
        case 4:
            return function(iteratee, defaultVal, context) {
                return base[method](this[attribute], cb(iteratee, this), defaultVal, context);
            };
        default:
            return function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this[attribute]);
                return base[method].apply(base, args);
            };
    }
};

var addUnderscoreMethods = function(Class, base, methods, attribute) {
    _.each(methods, function(length, method) {
        if (base[method]) Class.prototype[method] = addMethod(base, length, method, attribute);
    });
};

// Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
var cb = function(iteratee, instance) {
    if (_.isFunction(iteratee)) return iteratee;
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
    if (_.isString(iteratee)) return function(model) {
        return model.get(iteratee);
    };
    return iteratee;
};
var modelMatcher = function(attrs) {
    var matcher = _.matches(attrs);
    return function(model) {
        return matcher(model.attributes);
    };
};

// Underscore methods that we want to implement on the Collection.
// 90% of the core usefulness of Backbone Collections is actually implemented
// right here:
var collectionMethods = {
    forEach: 3,
    each: 3,
    map: 3,
    collect: 3,
    reduce: 0,
    foldl: 0,
    inject: 0,
    reduceRight: 0,
    foldr: 0,
    find: 3,
    detect: 3,
    filter: 3,
    select: 3,
    reject: 3,
    every: 3,
    all: 3,
    some: 3,
    any: 3,
    include: 3,
    includes: 3,
    contains: 3,
    invoke: 0,
    max: 3,
    min: 3,
    toArray: 1,
    size: 1,
    first: 3,
    head: 3,
    take: 3,
    initial: 3,
    rest: 3,
    tail: 3,
    drop: 3,
    last: 3,
    without: 0,
    difference: 0,
    indexOf: 3,
    shuffle: 1,
    lastIndexOf: 3,
    isEmpty: 1,
    chain: 1,
    sample: 3,
    partition: 3,
    groupBy: 3,
    countBy: 3,
    sortBy: 3,
    indexBy: 3,
    findIndex: 3,
    findLastIndex: 3
};


// Underscore methods that we want to implement on the Model, mapped to the
// number of arguments they take.
var modelMethods = {
    keys: 1,
    values: 1,
    pairs: 1,
    invert: 1,
    pick: 0,
    omit: 0,
    chain: 1,
    isEmpty: 1
};

// Mix in each Underscore method as a proxy to `Collection#models`.

_.each([
    [Collection, collectionMethods, "models"],
    [Model, modelMethods, "attributes"]
], function(config) {
    var Base = config[0],
        methods = config[1],
        attribute = config[2];

    Base.mixin = function(obj) {
        var mappings = _.reduce(_.functions(obj), function(memo, name) {
            memo[name] = 0;
            return memo;
        }, {});
        addUnderscoreMethods(Base, obj, mappings, attribute);
    };

    addUnderscoreMethods(Base, _, methods, attribute);
});

// Create the default Backbone.history.
Backbone.history = new History();

// Helpers
// -------

// Helper function to correctly set up the prototype chain for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(className, protoProps, staticProps) {
    if (!_.isString(className)) {
        staticProps = protoProps;
        protoProps = className;
        className = "Child" + _.uniqueId();
    }
    if (!/^[a-z]\w*$/i.test(className, "")) {
        throw new Error("invalid className: '" + className + "'\n className must be are word");
    }

    if (!protoProps) {
        protoProps = {};
    }

    if (!staticProps) {
        staticProps = {};
    }

    var parent = this;
    var child;

    if (parent._beforeExtend) {
        parent._beforeExtend(className, protoProps, staticProps);
        staticProps._beforeExtend = parent._beforeExtend;
    }

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, "constructor")) {
        child = protoProps.constructor;
    } else {
        // when need debugg memory leaks, you need find object by className
        child = new Function("parent", "return function " + className + "(){return parent.apply(this, arguments)};")(parent); // jshint ignore: line
    }
    child.className = className;

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    if (parent._afterExtend) {
        parent._afterExtend(child);
    }

    return child;
};

// Set up inheritance for the model, collection, router, view and history.
Model.extend = Collection.extend = Router.extend = View.extend = History.extend = View.TemplateScope.extend = Events.extend = extend;
