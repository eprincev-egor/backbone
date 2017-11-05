"use strict";

var Backbone = require("./main"),
    Events = require("./Events"),
    Vdom = require("./Vdom"),
    _ = Backbone._;

// Backbone.View
// -------------

// Backbone Views are almost more convention than they are actual code. A View
// is simply a JavaScript object that represents a logical chunk of UI in the
// DOM. This might be a single item, an entire list, a sidebar or panel, or
// even the surrounding frame which wraps your whole app. Defining a chunk of
// UI as a **View** allows you to define your DOM events declaratively, without
// having to worry about render order ... and makes it easy for the view to
// react to specific changes in the state of your models.

// Creating a Backbone.View creates its initial element outside of the DOM,
// if an existing element is not provided...
var View = function View(options) {
    this.cid = _.uniqueId('view');
    this.preinitialize.apply(this, arguments);
    _.extend(this, _.pick(options, viewOptions));

    if (
        (this.Model || this.model) &&
        !(this.model instanceof Backbone.Model)
    ) {
        var Model = this.Model || Backbone.Model;
        this.model = new Model(this.model);
    }

    if (
        (this.Collection || this.collection) &&
        !(this.collection instanceof Backbone.Collection)
    ) {
        var Collection = this.Collection || Backbone.Collection;
        this.collection = new Collection(this.collection);
    }

    this.ui = {};

    // need for detach handlers
    this._processEvents = this._processEvents.bind(this);
    // handlers, who was called
    this._events = _.extend({}, this.events);
    this._attachedEvents = {};

    if (!options || options.createElement !== false) {
        this._ensureElement();
    }

    this.initialize.apply(this, arguments);
};

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

var addEventListener,
    removeEventListener;
if (Backbone.$) {
    addEventListener = function(el, eventName, handler) {
        $(el).on(eventName, handler);
    };
    removeEventListener = function(el, eventName, handler) {
        $(el).off(eventName, handler);
    };
} else {
    addEventListener = function(el, eventName, handler) {
        el.addEventListener(eventName, handler);
    };
    removeEventListener = function(el, eventName, handler) {
        el.removeEventListener(eventName, handler);
    };
}

var _eventKey2nameAndSelector = function(key) {
    key = key.trim();
    key = key.split(/\s+/);

    var type = key[0],
        selector = key.slice(1).join(" ");

    return {
        type: type,
        selector: selector
    };
};

// List of view options to be set as properties.
var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

// Set up all inheritable **Backbone.View** properties and methods.
_.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
        if (Backbone.$) {
            return this.$el.find(selector);
        } else {
            return this.el.querySelector(selector);
        }
    },

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the View
    preinitialize: function() {},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function() {},

    render: function() {
        if (!this.template) {
            return this;
        }

        if (this._rendered) {
            this._liveRender();
        } else {
            this._firstRender();
        }

        return this;
    },

    onRender: function() {
        // redefine me
        return this;
    },

    _firstRender: function() {
        //
        // View without model in options or proto
        // var View = Backbone.View.extend({
        //   template: "<input <%= value('name') %>><%- name %>"
        // })
        //
        // new View().render()
        //
        if (!this.model) {
            var Model = this.Model || Backbone.Model;
            this.model = new Model(this.model);
        }


        this.templateCache = this.template();
        this.el.innerHTML = this.templateCache;
        this._listenData();
        this.afterInsertHTML();
    },

    _listenData: function() {
        if (this.model) {
            this.listenTo(this.model, "change", this._onChangeModel);
        }

        if (this.collection) {
            this.listenTo(this.collection, "all", this._onChangeCollection);
        }
    },

    _liveRender: function() {
        if (!this._rendered) {
            return;
        }

        if (!this.vdom) {
            this.vdom = new Vdom();
            // only first live render
            this.vdom.build(this.el, this.templateCache);
        }

        this.templateCache = this.template();
        this.vdom.update(this.el, this.templateCache);

        // rebind ui
        this.afterInsertHTML();
    },

    afterInsertHTML: function() {
        if (!this.el) { // if createElement: false
            var el = document.querySelector("[cid='" + this.cid + "']");
            this.setElement(el);
        }

        // bindUI in subElems
        if (this.children) {
            this.children.forEach(function(childView) {
                childView.afterInsertHTML();
            });
        }

        // this.ui elements
        this._bindUI();

        // system flag
        this._rendered = true;

        // custom logic
        this.onRender();

        // for controllers
        this.trigger("render");
    },

    _onChangeModel: function() {
        this.render();
    },

    _onChangeCollection: function() {
        this.render();
    },

    // example:
    // <%= value( model, key ) %>
    _templateValue: function(model, key) {
        if (arguments.length == 1) {
            key = model;
            model = this.model;
        }

        var tmpId = _.uniqueId("val");

        if (!this._templateTmpEvents) {
            this._templateTmpEvents = {};
        }
        this._templateTmpEvents[tmpId] = [model, key];

        //return ' value="'+ _.escape( model.get(key) ) +'" __tmp-id="'+ tmpId +'" ';
        return ' __tmp-id="' + tmpId + '" ';
    },

    _templateChildView: function(print, options) {
        var className = options.type,
            ChildView = this.Views[className];

        // for Tree
        if (className == this.constructor.className) {
            ChildView = this.constructor;
        }

        // чтобы потомок не создавал DOM элемент
        options.createElement = false;
        var childView = new ChildView(options);

        if (!this.children) {
            this.children = [];
        }
        this.children.push(childView);

        print(childView._outerHTML());

        return childView;
    },

    // called by parent
    _outerHTML: function() {
        var tagName = this.tagName,
            open = "<" + tagName + " cid='" + this.cid + "'>",
            close = "</" + tagName + ">";

        // need for virtual dom
        this.templateCache = this.template();
        this._listenData();

        return open + this.templateCache + close;
    },


    _bindUI: function() {
        this.ui = {};

        for (var uikey in this._ui) {
            var uiSelector = this._ui[uikey];

            if (/^\$/.test(uikey)) {
                this.ui[uikey] = this.$(uiSelector);
            } else {
                this.ui[uikey] = this.el.querySelector(uiSelector);
            }
        }

        if (!this._templateTmpEvents) {
            return;
        }

        var inputsEls = this.el.querySelectorAll("[__tmp-id]");
        inputsEls.forEach(function(inputEl) {
            var tmpId = inputEl.getAttribute("__tmp-id"),
                tmp = this._templateTmpEvents[tmpId],
                model, key, value;

            if (!tmp) {
                return;
            }

            model = tmp[0];
            key = tmp[1];
            value = model.get(key);

            if (inputEl.type == "checkbox") {
                if (value) {
                    inputEl.checked = true;
                } else {
                    inputEl.checked = false;
                }
            } else {
                if (value != null) {
                    inputEl.value = value;
                }
            }
        }, this);
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
        this._removeElement();
        this.stopListening();
        return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
        this._dettachEvents();
        if (Backbone.$) {
            this.$el.remove();
        } else {
            this.el.parentNode.removeChild(this.el);
        }
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function(el) {
        var key;

        // remove old listeners
        this._dettachEvents();
        this._events = _.extend({}, this.events);

        if (Backbone.$) {
            if (el instanceof Backbone.$) {
                this.$el = el;
                this.el = this.$el[0];
            } else {
                this.$el = $(el);
                this.el = this.$el[0];
            }

        } else {
            this.el = el;
        }

        // add new listeners
        this._attachEvents();
        return this;
    },

    _dettachEvents: function() {
        if (!this.el) {
            return;
        }

        for (var key in this._attachedEvents) {
            removeEventListener(this.el, key, this._processEvents);
            delete this._attachedEvents[key];
        }

        removeEventListener(this.el, "input", this._processEvents);
        removeEventListener(this.el, "change", this._processEvents);
    },

    _attachEvents: function() {
        if (!this.el) {
            return;
        }

        for (var eventSelector in this._events) {
            var tmp = this._eventKeyWithUI2nameAndSelector(eventSelector);

            if (this._attachedEvents[tmp.type]) {
                continue;
            }

            addEventListener(this.el, tmp.type, this._processEvents);
            this._attachedEvents[tmp.type] = true;
        }

        addEventListener(this.el, "input", this._processEvents);
        addEventListener(this.el, "change", this._processEvents);
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents: function(events) {
        if (!events) {
            events = _.result(this, 'events');
        }
        if (!events) return this;
        this.undelegateEvents();
        for (var key in events) {
            var method = events[key];
            if (!_.isFunction(method)) method = this[method];
            if (!method) continue;
            var match = key.match(delegateEventSplitter);
            this.delegate(match[1], match[2], _.bind(method, this));
        }
        return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function(eventName, selector, listener) {
        if (!_.isString(selector)) {
            listener = selector;
            selector = "";
        }

        var tmp = _eventKey2nameAndSelector(eventName + " " + selector),
            key = (tmp.type + " " + tmp.selector).trim();

        this._events[key] = listener;
        this._attachEvents();

        return this;
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
        this._events = {};
        return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function(eventName, selector, listener) {
        var tmp, key, eventSelector;

        if (selector) {
            tmp = _eventKey2nameAndSelector(eventName + " " + selector);
            eventSelector = tmp.type + " " + tmp.selector;
            delete this._events[eventSelector];
        } else {
            for (eventSelector in this._events) {
                tmp = _eventKey2nameAndSelector(eventSelector);

                if (tmp.type == eventName) {
                    delete this._events[eventSelector];
                }
            }
        }

        return this;
    },

    _processEvents: function(e) {
        if (!this.el) {
            return;
        }

        // ===============
        // <%= value %>
        // <%= checked %>
        var tmpId = e.target.getAttribute && e.target.getAttribute("__tmp-id"),
            tmp = this._templateTmpEvents && this._templateTmpEvents[tmpId];

        if (tmp && (e.type == "input" || e.type == "change")) {
            var model = tmp[0],
                key = tmp[1];

            if (e.target.type == "checkbox") {
                model.set(key, !!e.target.checked);
            } else {
                model.set(key, e.target.value);
            }
        }
        // ===============

        if (!this._events) {
            return;
        }

        for (var eventSelector in this._events) {
            var method = this._events[eventSelector];
            method = this[method] || method;

            if (!_.isFunction(method)) {
                continue;
            }

            this._processEvent(e, eventSelector, method);
        }
    },

    _processEvent: function(e, eventSelector, method) {
        var tmp = this._eventKeyWithUI2nameAndSelector(eventSelector),
            type = tmp.type,
            selector = tmp.selector;

        if (type != e.type) {
            return;
        }

        // "click": "onClick"
        if (selector === "" && e.target === this.el) {
            return method.call(this, e);
        }

        // "click .btn": "onClickBtn"
        if (this.el.contains(e.target)) {
            return method.call(this, e);
        }
    },

    _eventKeyWithUI2nameAndSelector: function(key) {
        var tmp = _eventKey2nameAndSelector(key);

        if (!this._ui) {
            return tmp;
        }

        var ui = this._ui;

        tmp.selector = tmp.selector.replace(/@ui\s*\.\s*([$\w]+)/, function(str, uiKey) {
            return ui[uiKey];
        });

        return tmp;
    },


    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function(tagName) {
        return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
        if (!this.el) {
            var attrs = _.extend({}, _.result(this, 'attributes'));
            if (this.id) attrs.id = _.result(this, 'id');
            if (this.className) attrs['class'] = _.result(this, 'className');
            this.setElement(this._createElement(_.result(this, 'tagName')));
            this._setAttributes(attrs);
        } else {
            this.setElement(_.result(this, 'el'));
        }
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function(attributes) {
        if (this.$el) {
            this.$el.attr(attributes);
        } else {
            for (var key in attributes) {
                this.el.setAttribute(key, attributes[key]);
            }
        }
    }

});

var TemplateScope = function TemplateScope(view, print) {
    this.view = view;
    this.print = print;
};

_.extend(TemplateScope.prototype, {
    View: function(options) {
        return this.view._templateChildView(this.print, options);
    },

    // lazy helpers::


    // <%= value( state, key ) %>
    //
    // set events for listening:
    // <%= value( state, key ).on("change blur") %>
    value: function(model, key) {
        return this.view._templateValue.apply(this.view, arguments);
    }
});

View.TemplateScope = TemplateScope;

View.prototype.TemplateScope = TemplateScope;

View._beforeExtend = function(className, protoProps, staticProps) {
    if (protoProps.ui) {
        protoProps._ui = protoProps.ui;
        delete protoProps.ui;

        for (var uikey in protoProps._ui) {
            if (/^\$/.test(uikey) && !Backbone.$) {
                throw new Error("for $ui need jquery, please don't use $ in uikey");
            }
        }
    }


    if (protoProps.model) {
        var Model = protoProps.model;

        if (
            _.isObject(Model) &&
            !(Model instanceof Backbone.Model)
        ) {
            Model = Backbone.Model.extend(className + "Model", {
                defaults: Model
            });
        }

        protoProps.Model = Model;
        delete protoProps.model;
    }

    // make template
    if (_.isObject(protoProps) && _.isString(protoProps.template)) {
        var templateString = protoProps.template; // for debug

        try {
            // if templateString is not valid selector,
            // then querySelector throw error
            var templateEl = document.querySelector(templateString);
            if (templateEl) {
                templateString = templateEl.innerHTML;
            }
        } catch (err) {}

        // это позволяет использовать элементы внутри элементов
        templateString = (
            "<%" +
            " scope = new this.TemplateScope(this, print);" +
            " var _modelAttribures = (this.model || {attributes: {}}).attributes || {}; " +
            "with(_modelAttribures) {with(scope) { %>" +
            templateString +
            "<% } } %>"
        );
        protoProps.template = _.template(templateString, {
            variable: "scope"
        });
    }
};

View._afterExtend = function(child) {
    var proto = child.prototype;

    // потомки наследуют scope родителей
    proto.TemplateScope = child.__super__.TemplateScope.extend(child.className + "TemplateScope");

    // proto.Views = [ChildView1, ChildView2, ...]
    // convert to
    // Views.ChildView1 = ChildView1
    // Views.ChildView2 = ChildView2
    // ...
    var Views = {};
    Views[child.className] = child; // for Tree

    if (_.isArray(proto.Views)) {
        _.each(proto.Views, function(ChildView) {
            Views[ChildView.className] = ChildView;
        });
    }
    // proto.Views = { menu: SomeMenuView }
    else if (_.isObject(proto.Views)) {
        _.extend(Views, proto.Views);
    }

    proto.Views = Views;

    // дочерние классы, которые будут использоваться в шаблонах
    _.each(Views, function(value, key) {
        proto.TemplateScope.prototype[key] = function(options) {
            if (!options) {
                options = {};
            }
            var scope = this;
            options.type = key;
            return scope.View(options);
        };
    });

    // наследование стилей
    proto.extendedClassName = "";
    if (child.Parent) {
        var classes = (child.__super__.extendedClassName + " " + child.className).trim();
        classes = classes.split(/\s+/g);
        classes = _.uniq(classes);
        classes = classes.join(" ");
        proto.extendedClassName = classes;
    }

};


module.exports = View;
