(function(QUnit) {
    "use strict";

    var view;

    QUnit.module('Backbone.View', {

        beforeEach: function() {
            $('#qunit-fixture').append(
                '<div id="testElement"><h1>Test</h1></div>'
            );

            view = new Backbone.View({
                id: 'test-view',
                className: 'test-view',
                other: 'non-special-option'
            });
        },

        afterEach: function() {
            $('#testElement').remove();
            $('#test-view').remove();
        }

    });

    QUnit.test('constructor', function(assert) {
        assert.expect(3);
        assert.equal(view.el.id, 'test-view');
        assert.equal(view.el.className, 'test-view');
        assert.equal(view.el.other, void 0);
    });

    QUnit.test('$', function(assert) {
        assert.expect(2);
        var myView = new Backbone.View();
        myView.setElement('<p><a><b>test</b></a></p>');
        var result = myView.$('a b');

        assert.strictEqual(result[0].innerHTML, 'test');
        assert.ok(result.length === +result.length);
    });

    QUnit.test('$el', function(assert) {
        assert.expect(3);
        var myView = new Backbone.View();
        myView.setElement('<p><a><b>test</b></a></p>');
        assert.strictEqual(myView.el.nodeType, 1);

        assert.ok(myView.$el instanceof Backbone.$);
        assert.strictEqual(myView.$el[0], myView.el);
    });

    QUnit.test('initialize', function(assert) {
        assert.expect(1);
        var View = Backbone.View.extend({
            initialize: function() {
                this.one = 1;
            }
        });

        assert.strictEqual(new View().one, 1);
    });

    QUnit.test('preinitialize', function(assert) {
        assert.expect(1);
        var View = Backbone.View.extend({
            preinitialize: function() {
                this.one = 1;
            }
        });

        assert.strictEqual(new View().one, 1);
    });

    QUnit.test('preinitialize occurs before the view is set up', function(assert) {
        assert.expect(2);
        var View = Backbone.View.extend({
            preinitialize: function() {
                assert.equal(this.el, undefined);
            }
        });
        var _view = new View({});
        assert.notEqual(_view.el, undefined);
    });

    QUnit.test('render', function(assert) {
        assert.expect(1);
        var myView = new Backbone.View();
        assert.equal(myView.render(), myView, '#render returns the view instance');
    });

    QUnit.test('delegateEvents', function(assert) {
        assert.expect(6);
        var counter1 = 0,
            counter2 = 0;

        var myView = new Backbone.View({
            el: '#testElement'
        });
        myView.increment = function() {
            counter1++;
        };
        myView.$el.on('click', function() {
            counter2++;
        });

        var events = {
            'click h1': 'increment'
        };

        myView.delegateEvents(events);
        myView.$('h1').trigger('click');
        assert.equal(counter1, 1);
        assert.equal(counter2, 1);

        myView.$('h1').trigger('click');
        assert.equal(counter1, 2);
        assert.equal(counter2, 2);

        myView.delegateEvents(events);
        myView.$('h1').trigger('click');
        assert.equal(counter1, 3);
        assert.equal(counter2, 3);
    });

    QUnit.test('delegate', function(assert) {
        assert.expect(3);
        var myView = new Backbone.View({
            el: '#testElement'
        });
        myView.delegate('click', 'h1', function() {
            assert.ok(true);
        });
        myView.delegate('click', function() {
            assert.ok(true);
        });
        myView.$('h1').trigger('click');

        assert.equal(myView.delegate(), myView, '#delegate returns the view instance');
    });

    QUnit.test('delegateEvents allows functions for callbacks', function(assert) {
        assert.expect(3);
        var myView = new Backbone.View({
            el: '<p></p>'
        });
        myView.counter = 0;

        var events = {
            click: function() {
                this.counter++;
            }
        };

        myView.delegateEvents(events);
        myView.$el.trigger('click');
        assert.equal(myView.counter, 1);

        myView.$el.trigger('click');
        assert.equal(myView.counter, 2);

        myView.delegateEvents(events);
        myView.$el.trigger('click');
        assert.equal(myView.counter, 3);
    });

    QUnit.test('delegateEvents ignore undefined methods', function(assert) {
        assert.expect(0);
        var myView = new Backbone.View({
            el: '<p></p>'
        });
        myView.delegateEvents({
            click: 'undefinedMethod'
        });
        myView.$el.trigger('click');
    });

    QUnit.test('undelegateEvents', function(assert) {
        assert.expect(7);
        var counter1 = 0,
            counter2 = 0;

        var myView = new Backbone.View({
            el: '#testElement'
        });
        myView.increment = function() {
            counter1++;
        };
        myView.$el.on('click', function() {
            counter2++;
        });

        var events = {
            'click h1': 'increment'
        };

        myView.delegateEvents(events);
        myView.$('h1').trigger('click');
        assert.equal(counter1, 1);
        assert.equal(counter2, 1);

        myView.undelegateEvents();
        myView.$('h1').trigger('click');
        assert.equal(counter1, 1);
        assert.equal(counter2, 2);

        myView.delegateEvents(events);
        myView.$('h1').trigger('click');
        assert.equal(counter1, 2);
        assert.equal(counter2, 3);

        assert.equal(myView.undelegateEvents(), myView, '#undelegateEvents returns the view instance');
    });

    QUnit.test('undelegate', function(assert) {
        assert.expect(1);
        var myView = new Backbone.View({
            el: '#testElement'
        });
        myView.delegate('click', function() {
            assert.ok(false);
        });
        myView.delegate('click', 'h1', function() {
            assert.ok(false);
        });

        myView.undelegate('click');

        myView.$('h1').trigger('click');
        myView.$el.trigger('click');

        assert.equal(myView.undelegate(), myView, '#undelegate returns the view instance');
    });

    QUnit.test('undelegate with passed handler', function(assert) {
        assert.expect(1);
        var myView = new Backbone.View({
            el: '#testElement'
        });
        var listener = function() {
            assert.ok(false);
        };
        myView.delegate('click', listener);
        myView.delegate('click', function() {
            assert.ok(true);
        });
        myView.undelegate('click', listener);
        myView.$el.trigger('click');
    });

    QUnit.test('undelegate with selector', function(assert) {
        assert.expect(2);
        var myView = new Backbone.View({
            el: '#testElement'
        });
        myView.delegate('click', function() {
            assert.ok(true);
        });
        myView.delegate('click', 'h1', function() {
            assert.ok(false);
        });
        myView.undelegate('click', 'h1');
        myView.$('h1').trigger('click');
        myView.$el.trigger('click');
    });

    QUnit.test('undelegate with handler and selector', function(assert) {
        assert.expect(2);
        var myView = new Backbone.View({
            el: '#testElement'
        });
        myView.delegate('click', function() {
            assert.ok(true);
        });
        var handler = function() {
            assert.ok(false);
        };
        myView.delegate('click', 'h1', handler);
        myView.undelegate('click', 'h1', handler);
        myView.$('h1').trigger('click');
        myView.$el.trigger('click');
    });

    QUnit.test('tagName can be provided as a string', function(assert) {
        assert.expect(1);
        var View = Backbone.View.extend({
            tagName: 'span'
        });

        assert.equal(new View().el.tagName, 'SPAN');
    });

    QUnit.test('tagName can be provided as a function', function(assert) {
        assert.expect(1);
        var View = Backbone.View.extend({
            tagName: function() {
                return 'p';
            }
        });

        assert.ok(new View().$el.is('p'));
    });

    QUnit.test('_ensureElement with DOM node el', function(assert) {
        assert.expect(1);
        var View = Backbone.View.extend({
            el: document.body
        });

        assert.equal(new View().el, document.body);
    });

    QUnit.test('_ensureElement with string el', function(assert) {
        assert.expect(3);
        var View = Backbone.View.extend({
            el: 'body'
        });
        assert.strictEqual(new View().el, document.body);

        View = Backbone.View.extend({
            el: '#testElement > h1'
        });
        assert.strictEqual(new View().el, $('#testElement > h1').get(0));

        View = Backbone.View.extend({
            el: '#nonexistent'
        });
        assert.ok(!new View().el);
    });

    QUnit.test('with className and id functions', function(assert) {
        assert.expect(2);
        var View = Backbone.View.extend({
            className: function() {
                return 'className';
            },
            id: function() {
                return 'id';
            }
        });

        assert.strictEqual(new View().el.className, 'className');
        assert.strictEqual(new View().el.id, 'id');
    });

    QUnit.test('with attributes', function(assert) {
        assert.expect(2);
        var View = Backbone.View.extend({
            attributes: {
                'id': 'id',
                'class': 'class'
            }
        });

        assert.strictEqual(new View().el.className, 'class');
        assert.strictEqual(new View().el.id, 'id');
    });

    QUnit.test('with attributes as a function', function(assert) {
        assert.expect(1);
        var View = Backbone.View.extend({
            attributes: function() {
                return {
                    'class': 'dynamic'
                };
            }
        });

        assert.strictEqual(new View().el.className, 'dynamic');
    });

    QUnit.test('should default to className/id properties', function(assert) {
        assert.expect(4);
        var View = Backbone.View.extend({
            className: 'backboneClass',
            id: 'backboneId',
            attributes: {
                'class': 'attributeClass',
                'id': 'attributeId'
            }
        });

        var myView = new View();
        assert.strictEqual(myView.el.className, 'backboneClass');
        assert.strictEqual(myView.el.id, 'backboneId');
        assert.strictEqual(myView.$el.attr('class'), 'backboneClass');
        assert.strictEqual(myView.$el.attr('id'), 'backboneId');
    });

    QUnit.test('multiple views per element', function(assert) {
        assert.expect(3);
        var count = 0;
        var $el = $('<p></p>');

        var View = Backbone.View.extend({
            el: $el,
            events: {
                click: function() {
                    count++;
                }
            }
        });

        var view1 = new View();
        $el.trigger('click');
        assert.equal(1, count);

        var view2 = new View();
        $el.trigger('click');
        assert.equal(3, count);

        view1.delegateEvents();
        $el.trigger('click');
        assert.equal(5, count);
    });

    QUnit.test('custom events', function(assert) {
        assert.expect(2);
        var View = Backbone.View.extend({
            el: $('body'),
            events: {
                fake$event: function() {
                    assert.ok(true);
                }
            }
        });

        var myView = new View();
        $('body').trigger('fake$event').trigger('fake$event');

        $('body').off('fake$event');
        $('body').trigger('fake$event');
    });

    QUnit.test('#1048 - setElement uses provided object.', function(assert) {
        assert.expect(2);
        var $el = $('body');

        var myView = new Backbone.View({
            el: $el
        });
        assert.ok(myView.$el === $el);

        myView.setElement($el = $($el));
        assert.ok(myView.$el === $el);
    });

    QUnit.test('#986 - Undelegate before changing element.', function(assert) {
        assert.expect(1);
        var button1 = $('<button></button>');
        var button2 = $('<button></button>');

        var View = Backbone.View.extend({
            events: {
                click: function(e) {
                    assert.ok(myView.el === e.target);
                }
            }
        });

        var myView = new View({
            el: button1
        });
        myView.setElement(button2);

        button1.trigger('click');
        button2.trigger('click');
    });

    QUnit.test('#1172 - Clone attributes object', function(assert) {
        assert.expect(2);
        var View = Backbone.View.extend({
            attributes: {
                foo: 'bar'
            }
        });

        var view1 = new View({
            id: 'foo'
        });
        assert.strictEqual(view1.el.id, 'foo');

        var view2 = new View();
        assert.ok(!view2.el.id);
    });

    QUnit.test('views stopListening', function(assert) {
        assert.expect(0);
        var View = Backbone.View.extend({
            initialize: function() {
                this.listenTo(this.model, 'all x', function() {
                    assert.ok(false);
                });
                this.listenTo(this.collection, 'all x', function() {
                    assert.ok(false);
                });
            }
        });

        var myView = new View({
            model: new Backbone.Model(),
            collection: new Backbone.Collection()
        });

        myView.stopListening();
        myView.model.trigger('x');
        myView.collection.trigger('x');
    });

    QUnit.test('Provide function for el.', function(assert) {
        assert.expect(2);
        var View = Backbone.View.extend({
            el: function() {
                return '<p><a></a></p>';
            }
        });

        var myView = new View();
        assert.ok(myView.$el.is('p'));
        assert.ok(myView.$el.has('a'));
    });

    QUnit.test('events passed in options', function(assert) {
        assert.expect(1);
        var counter = 0;

        var View = Backbone.View.extend({
            el: '#testElement',
            increment: function() {
                counter++;
            }
        });

        var myView = new View({
            events: {
                'click h1': 'increment'
            }
        });

        myView.$('h1').trigger('click').trigger('click');
        assert.equal(counter, 2);
    });

    QUnit.test('remove', function(assert) {
        assert.expect(2);
        var myView = new Backbone.View();
        document.body.appendChild(view.el);

        myView.delegate('click', function() {
            assert.ok(false);
        });
        myView.listenTo(myView, 'all x', function() {
            assert.ok(false);
        });

        assert.equal(myView.remove(), myView, '#remove returns the view instance');
        myView.$el.trigger('click');
        myView.trigger('x');

        // In IE8 and below, parentNode still exists but is not document.body.
        assert.notEqual(myView.el.parentNode, document.body);
    });

    QUnit.test('setElement', function(assert) {
        assert.expect(3);
        var myView = new Backbone.View({
            events: {
                click: function() {
                    assert.ok(false);
                }
            }
        });
        myView.events = {
            click: function() {
                assert.ok(true);
            }
        };
        var oldEl = myView.el;
        var $oldEl = myView.$el;

        myView.setElement(document.createElement('div'));

        $oldEl.click();
        myView.$el.click();

        assert.notEqual(oldEl, myView.el);
        assert.notEqual($oldEl, myView.$el);
    });

    QUnit.test('set className in extend', function(assert) {
        assert.expect(3);

        var ChildView1 = Backbone.View.extend("ChildView1");
        assert.equal(ChildView1.className, "ChildView1");

        var ChildView2 = Backbone.View.extend("ChildView2", {});
        assert.equal(ChildView2.className, "ChildView2");

        var ChildView3 = Backbone.View.extend("ChildView3", {}, {});
        assert.equal(ChildView3.className, "ChildView3");
    });

    QUnit.test("render #test1 with model(name: '<test>')", function(assert) {
        assert.expect(2);

        var View = Backbone.View.extend({
            template: "#test1"
        });

        var view = new View({
            model: new Backbone.Model({
                name: "<test>"
            })
        });
        view.render();

        var $input = view.$("input");
        assert.ok(!!$input.length);
        assert.ok($input.val() == "<test>");

    });

    QUnit.test("render #test2", function(assert) {
        assert.expect(2);

        var View = Backbone.View.extend({
            template: "#test2"
        });

        var view = new View({
            model: new Backbone.Model({
                name: "<test textarea &>"
            })
        });
        view.render();

        var $textarea = view.$("textarea");
        assert.ok(!!$textarea.length);
        assert.ok($textarea.val() == "<test textarea &>");

    });

    QUnit.test("render template <h1hello <%- name %>></h1>", function(assert) {
        assert.expect(2);

        var View = Backbone.View.extend({
            template: "<h1>hello <%- name %></h1>"
        });

        var view = new View({
            model: new Backbone.Model({
                name: "<bob>"
            })
        });
        view.render();

        var $h1 = view.$("h1");
        assert.ok(!!$h1.length);
        assert.ok($h1.text() == "hello <bob>");

    });

    QUnit.test("input binding, vdom render", function(assert) {


        var View = Backbone.View.extend({
            template: "<input <%= value('name') %>/><span><%- name %></span>"
        });

        var view, $input, $span;

        view = new View({
            model: new Backbone.Model({
                name: "<bob>"
            })
        });
        view.render();

        $input = view.$("input");
        assert.ok(!!$input.length);
        assert.ok($input.val() == "<bob>");

        $span = view.$("span");
        assert.ok(!!$span.length);
        assert.ok($span.text() == "<bob>");

        $input.val("not <bob>");
        $input.trigger("input");

        assert.ok(!!$input.length);
        assert.ok($input.val() == "not <bob>");

        assert.ok(!!$span.length);
        assert.ok($span.text() == "not <bob>");

        view = new View();
        view.render();

        $input = view.$("input");
        assert.ok(!!$input.length);
        assert.ok($input.val() === "");

        $span = view.$("span");
        assert.ok(!!$span.length);
        assert.ok($span.text() === "");

        $input.val("<bob>");
        $input.trigger("input");

        assert.ok($input.val() == "<bob>");
        assert.ok($span.text() == "<bob>");
    });

    QUnit.test("textarea", function(assert) {
        var TextareaView = Backbone.View.extend({
            template: "<textarea <%= value('name') %>></textarea><div><%- name %></div>"
        });

        var textareaView, $textarea, $div;

        textareaView = new TextareaView();
        textareaView.render();

        $textarea = textareaView.$("textarea");
        assert.ok($textarea.length == 1);
        assert.strictEqual($textarea.val(), "");

        $div = textareaView.$("div");
        assert.ok($div.length == 1);
        assert.strictEqual($div.text(), "");

        $textarea.val("<text>");
        $textarea.trigger("input");

        assert.equal(textareaView.model.get("name"), "<text>");
        assert.strictEqual($div.text(), "<text>");

        textareaView = new TextareaView({
            model: {
                name: "<nice!/>"
            }
        });
        textareaView.render();

        $textarea = textareaView.$("textarea");
        assert.ok($textarea.length == 1);
        assert.strictEqual($textarea.val(), "<nice!/>");

        $div = textareaView.$("div");
        assert.ok($div.length == 1);
        assert.strictEqual($div.text(), "<nice!/>");
    });

    QUnit.test("checkbox", function(assert) {
        var CheckboxView = Backbone.View.extend({
            template: "<input type='checkbox' <%= value('someFlag') %>/><div><%= someFlag ? 'enabled' : 'disabled' %></div>",
            model: {
                someFlag: false
            }
        });

        var checkboxView, $checkbox, $div;

        checkboxView = new CheckboxView();
        checkboxView.render();

        $checkbox = checkboxView.$("input");
        assert.ok($checkbox.length == 1);
        assert.strictEqual($checkbox.prop("checked"), false);

        $div = checkboxView.$("div");
        assert.ok($div.length == 1);
        assert.strictEqual($div.text(), "disabled");

        $checkbox.prop("checked", true);
        $checkbox.trigger("change");

        assert.equal(checkboxView.model.get("someFlag"), true);
        assert.strictEqual($div.text(), "enabled");

        checkboxView = new CheckboxView({
            model: {
                someFlag: true
            }
        });
        checkboxView.render();

        $checkbox = checkboxView.$("input");
        assert.ok($checkbox.length == 1);
        assert.strictEqual($checkbox.prop("checked"), true);

        $div = checkboxView.$("div");
        assert.ok($div.length == 1);
        assert.strictEqual($div.text(), "enabled");
    });

    QUnit.test("treeView", function(assert) {

        var TreeView = Backbone.View.extend("TreeView", {
            template: "#tree-view-template",
            model: {
                name: "",
                childs: []
            }
        });

        var data = {
            name: "item 1",
            opened: true,
            childs: [{
                    name: "item 1.1"
                },
                {
                    name: "item 1.2",
                    childs: [{
                            name: "item 1.2.1"
                        },
                        {
                            name: "item 1.2.2"
                        },
                        {
                            // without name
                        }
                    ]
                }
            ]
        };

        var treeView = new TreeView({
            model: data
        });
        treeView.render();

        // check order
        assert.equal(treeView.$("span").eq(0).text(), "item 1");
        assert.equal(treeView.$("span").eq(1).text(), "item 1.1");
        assert.equal(treeView.$("span").eq(2).text(), "item 1.2");
        assert.equal(treeView.$("span").eq(3).text(), "item 1.2.1");
        assert.equal(treeView.$("span").eq(4).text(), "item 1.2.2");
        assert.equal(treeView.$("span").eq(5).text(), "");

        // check structure
        assert.equal(treeView.$("> span").eq(0).text(), "item 1");
        assert.equal(treeView.$("div span").eq(0).text(), "item 1.1");
        assert.equal(treeView.$("div span").eq(1).text(), "item 1.2");
        assert.equal(treeView.$("div div span").eq(0).text(), "item 1.2.1");
        assert.equal(treeView.$("div div span").eq(1).text(), "item 1.2.2");

    });

    QUnit.test("inputList", function(assert) {
        var InputListView = Backbone.View.extend("InputListView", {
            template: "#input-list-template",

            events: {
                "click .remove": "onClickRemove",
                "click .add": "onClickAdd"
            },

            model: {
                newName: ""
            },

            onClickRemove: function(e) {
                var index = e.target.getAttribute("data-index"),
                    model = this.collection.at(index);

                this.collection.remove(model);
            },

            onClickAdd: function(e) {
                var newName = this.model.get("newName").trim();

                if (!newName) {
                    return;
                }

                this.collection.add({
                    name: newName
                });
                this.model.set({
                    newName: ""
                });
            }
        });

        var inputListView = new InputListView({
            collection: [{
                    name: "James"
                },
                {
                    name: "John"
                },
                {
                    name: "Robert"
                },
                {
                    name: "Michael"
                },
                {
                    name: "William"
                },
                {
                    name: "David"
                },
                {
                    name: "Richard"
                },
                {
                    name: "Charles"
                },
                {
                    name: "Joseph"
                },
                {
                    name: "Thomas"
                }
            ]
        });
        inputListView.render();

        assert.equal(inputListView.$("a.remove").eq(0).text().trim(), "remove name James");
        assert.equal(inputListView.$("a.remove").eq(1).text().trim(), "remove name John");
        assert.equal(inputListView.$("a.remove").eq(2).text().trim(), "remove name Robert");
        assert.equal(inputListView.$("a.remove").eq(3).text().trim(), "remove name Michael");
        assert.equal(inputListView.$("a.remove").eq(4).text().trim(), "remove name William");
        assert.equal(inputListView.$("a.remove").eq(5).text().trim(), "remove name David");
        assert.equal(inputListView.$("a.remove").eq(6).text().trim(), "remove name Richard");
        assert.equal(inputListView.$("a.remove").eq(7).text().trim(), "remove name Charles");
        assert.equal(inputListView.$("a.remove").eq(8).text().trim(), "remove name Joseph");
        assert.equal(inputListView.$("a.remove").eq(9).text().trim(), "remove name Thomas");

        assert.equal(inputListView.$(".total").text().trim(), "Total count: 10");

        inputListView.$("a.remove").eq(0).trigger("click");
        assert.equal(inputListView.collection.length, 9);

        assert.equal(inputListView.$(".total").text().trim(), "Total count: 9");

        inputListView.$("input[placeholder]").val("test add");
        inputListView.$(".add").trigger("click");

        assert.equal(inputListView.collection.last().get("name"), "Thomas");

        inputListView.$("input[placeholder]").trigger("input");
        inputListView.$(".add").trigger("click");

        assert.equal(inputListView.collection.last().get("name"), "test add");
        assert.equal(inputListView.collection.length, 10);

        var $input = inputListView.$("input").eq(3);
        assert.equal($input.val(), "William");

        $input.val("nice");
        $input.trigger("input");

        assert.equal(inputListView.collection.at(3).get("name"), "nice");
        assert.equal(inputListView.$("a.remove").eq(3).text().trim(), "remove name nice");

        assert.equal(inputListView.$(".total").text().trim(), "Total count: 10");
    });

    QUnit.test("resizeView", function(assert) {
        var ResizeView = Backbone.View.extend("ResizeView", {
            template: "#resize-template",

            ui: {
                text: ".text"
            },

            model: {
                text: "test text size",
                width: 0,
                height: 0
            },

            onRender: function() {
                var size = this.ui.text.getBoundingClientRect();
                this.model.set("width", size.width);
                this.model.set("height", size.height);
            }
        });

        var resizeView = new ResizeView();

        document.body.appendChild(resizeView.el);
        resizeView.render();

        assert.notEqual(resizeView.$("div").text().replace(/\s/g, ""), "Width:0pxHeight:0px");

        resizeView.remove();
    });

    QUnit.test("button counter", function(assert) {
        var CounterView = Backbone.View.extend("CounterView", {
            template: "<button>click #<%- count %></button>",

            model: {
                count: 0
            },

            events: {
                "click button": function() {
                    this.model.set("count", this.model.get("count") + 1);
                }
            }
        });

        var counterView = new CounterView();
        counterView.render();

        var $button = counterView.$("button");

        assert.equal($button.text(), "click #0");

        $button.click();
        assert.equal($button.text(), "click #1");

        $button.click();
        assert.equal($button.text(), "click #2");

    });

    QUnit.test("sub elem", function(assert) {
        var ChildView = Backbone.View.extend({
            template: "<input <%= value('name') %>/>",
            ui: {
                input: "input"
            },
            model: {
                name: "nice"
            }
        });
        var ParentView = Backbone.View.extend({
            template: "<% this.child = Child() %>",
            Views: {
                Child: ChildView
            }
        });

        var parentView = new ParentView();
        parentView.render();

        assert.equal( parentView.child.ui.input.value, "nice" );
    });

    QUnit.test("{events: '.some'}, check event.target on right selector", function(assert) {
        var counter1 = 0,
            counter2 = 0,
            counter3 = 0,
            counter4 = 0;

        var ChildView = Backbone.View.extend("ChildView", {
            template: "<div class='div1'><div class='div1-div'></div></div><div class='div2'><div class='div2-div'></div></div>",
            events: {
                "click .div1": function() {
                    counter1++;
                },
                "click .div2": function() {
                    counter2++;
                },
                "click .div1-div": function() {
                    counter3++;
                },
                "click .div2-div": function() {
                    counter4++;
                }
            }
        });

        var view = new ChildView();
        view.render();

        view.$(".div1").trigger("click");
        assert.equal(counter1, 1);
        assert.equal(counter2, 0);
        assert.equal(counter3, 0);
        assert.equal(counter4, 0);

        view.$(".div2").trigger("click");
        assert.equal(counter1, 1);
        assert.equal(counter2, 1);
        assert.equal(counter3, 0);
        assert.equal(counter4, 0);

        view.$(".div1-div").trigger("click");
        assert.equal(counter1, 2);
        assert.equal(counter2, 1);
        assert.equal(counter3, 1);
        assert.equal(counter4, 0);

        view.$(".div2-div").trigger("click");
        assert.equal(counter1, 2);
        assert.equal(counter2, 2);
        assert.equal(counter3, 1);
        assert.equal(counter4, 1);

    });

    QUnit.test("child view elems events not propagation", function(assert) {
        var counter1 = 0,
            counter2 = 0;

        var ChildView = Backbone.View.extend("ChildView", {
            template: "<button></button>",
            events: {
                "click button": function() {
                    counter1++;
                }
            }
        });

        var ParentView = Backbone.View.extend("ParentView", {
            template: "<button></button><% ChildView() %>",
            Views: [ChildView],

            events: {
                "click button": function() {
                    counter2++;
                }
            }
        });

        var parentView = new ParentView();
        parentView.render();

        parentView.$("button").eq(1).trigger("click");

        assert.equal(counter1, 1);
        assert.equal(counter2, 0);

        parentView.$("button").eq(0).trigger("click");

        assert.equal(counter1, 1);
        assert.equal(counter2, 1);

    });

})(QUnit);
