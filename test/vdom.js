(function(QUnit) {
    "use strict";

    var view;

    QUnit.module('Backbone.Vdom');


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

    QUnit.test("render template <h1>hello <%- name %>></h1>", function(assert) {
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

    QUnit.test("2 input with one key, vdom render", function(assert) {
        var View = Backbone.View.extend({
            template: "<input class='input1' <%= value('name') %>/><input class='input2' <%= value('name') %>/><span><%- name %></span>"
        });

        var view, $input1, $input2, $span;

        view = new View({
            model: {
                name: "test"
            }
        });
        view.render();

        $input1 = view.$(".input1");
        $input2 = view.$(".input2");
        $span = view.$("span");

        assert.equal( $input1.val(), "test" );
        assert.equal( $input2.val(), "test" );
        assert.equal( $span.text(), "test" );

        $input1.val("test2").trigger("input");

        assert.equal( $input1.val(), "test2" );
        assert.equal( $input2.val(), "test2" );
        assert.equal( $span.text(), "test2" );

        $input2.val("test3").trigger("input");

        assert.equal( $input1.val(), "test3" );
        assert.equal( $input2.val(), "test3" );
        assert.equal( $span.text(), "test3" );
    });

    QUnit.test("<%= value(options, key) %>", function(assert) {
        var View = Backbone.View.extend({
            template: "<input class='input' <%= value(options, 'name') %>/><span><%- options.name  %></span>",

            options: {
                name: {
                    default: "<Y>"
                }
            }
        });

        var view, $input, $span;

        view = new View();
        view.render();

        $input = view.$(".input");
        $span = view.$("span");

        assert.equal( $input.val(), "<Y>" );
        assert.equal( $span.text(), "<Y>" );

        $input.val("<Y&>").trigger("input");

        assert.equal( $input.val(), "<Y&>" );
        assert.equal( $span.text(), "<Y&>" );
        assert.equal( view.options.name, "<Y&>" );
    });

    QUnit.test("<%= value(anyObject, key) %>", function(assert) {
        var testObj = {
            name: "<nice>"
        };
        var View = Backbone.View.extend({
            template: "<input class='input' <%= value(this.testObj, 'name') %>/><span><%- this.testObj.name  %></span>",

            initialize: function() {
                this.testObj = testObj;
            }
        });

        var view, $input, $span;

        view = new View();
        view.render();

        $input = view.$(".input");
        $span = view.$("span");

        assert.equal( $input.val(), "<nice>" );
        assert.equal( $span.text(), "<nice>" );

        $input.val("<nice&>").trigger("input");

        assert.equal( $input.val(), "<nice&>" );
        assert.equal( $span.text(), "<nice&>" );
        assert.equal( testObj.name, "<nice&>" );
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

            events: {
                "click .toggle": "onClickToggle"
            },

            onClickToggle: function() {
                this.model.set("opened", !this.model.get("opened"));
            },

            model: {
                opened: false,
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
                    opened: true,
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

        treeView.$(".toggle").eq(1).trigger("click");
        assert.equal( treeView.$("span").length, 3 );
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
            template: "<% Child() %>",
            Views: {
                Child: ChildView
            }
        });

        var parentView = new ParentView();
        parentView.render();

        assert.equal( parentView.$("input").val(), "nice" );
    });

    QUnit.test("menu", function(assert) {
        var MenuItemView = Backbone.View.extend({
            tagName: "li",
            template: "#menu-item-template",

            options: {
                lvl: {
                    type: Number,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                children: {
                    type: Array,
                    default: []
                }
            },

            className: function() {
                var children = this.options.children,
                    classes = [];

                if ( children && children.length ) {
                    classes.push("has-children");
                }

                classes.push("lvl-" + this.options.lvl);

                return classes;
            }
        });

        var MenuCollectionView = Backbone.View.extend({
            tagName: "ul",
            template: "#menu-collection-template",
            className: function() {
                return "lvl-" + this.options.lvl;
            },

            options: {
                lvl: {
                    type: Number,
                    default: 1
                }
            },

            Views: {
                Item: MenuItemView
            }
        });

        MenuItemView.addView("Menu", MenuCollectionView);

        var menu = new MenuCollectionView({
            collection: [
                {
                    name: "Item 1"
                },
                {
                    name: "Item 2",
                    children: [
                        {
                            name: "Item 2.1"
                        },
                        {
                            name: "Item 2.2"
                        }
                    ]
                }
            ]
        });

        menu.render();

        assert.equal(menu.$("a").eq(0).text(), "Item 1");
        assert.equal(menu.$("a").eq(1).text(), "Item 2");
        assert.equal(menu.$("a").eq(2).text(), "Item 2.1");
        assert.equal(menu.$("a").eq(3).text(), "Item 2.2");

        assert.ok(menu.$el.hasClass("lvl-1"));

        assert.ok( !menu.$("li").eq(0).hasClass("has-children") );
        assert.ok( menu.$("li").eq(0).hasClass("lvl-1") );

        assert.ok( menu.$("li").eq(1).hasClass("has-children") );
        assert.ok( menu.$("li").eq(1).hasClass("lvl-1") );

        assert.ok( menu.$("ul").hasClass("lvl-2") );
        assert.ok( menu.$("ul li").eq(0).hasClass("lvl-2") );
        assert.ok( menu.$("ul li").eq(1).hasClass("lvl-2") );
    });

    QUnit.test("view attributes", function(assert) {
        var ChildView = Backbone.View.extend({
            tagName: "span",
            attributes: {
                id: 1,
                class: "nice",
                "some-attr": "<"
            }
        });

        var ParentView = Backbone.View.extend({
            Views: {Child: ChildView},
            template: "<% Child() %>"
        });

        var view = new ParentView();
        view.render();

        assert.equal( view.$("span").attr("id"), 1 );
        assert.equal( view.$("span").attr("class"), "nice" );
        assert.equal( view.$("span").attr("some-attr"), "<" );
    });

    QUnit.test("remove and create tag", function(assert) {

        var View = Backbone.View.extend({
            template: `
                <div>fixed</div>
                <% if ( flag ) { %>
                    <h1>1</h1>
                <% } else { %>
                    <h2>2</h2>
                <% } %>
            `
        });

        var view = new View({model: {flag: true}});
        view.render();

        var $div = view.$("div");
        assert.ok( !!$div.length );
        var div = $div[0];

        assert.ok( !!view.$("h1").length );
        assert.ok( !view.$("h2").length );

        view.model.set("flag", false);

        assert.ok( div.parentNode === view.el );
        assert.ok( !view.$("h1").length );
        assert.ok( !!view.$("h2").length );

        view.model.set("flag", true);

        assert.ok( div.parentNode === view.el );
        assert.ok( !!view.$("h1").length );
        assert.ok( !view.$("h2").length );
    });

    QUnit.test("setOptions on live render", function(assert) {
        var view1,
            view2;

        var ChildView = Backbone.View.extend({
            template: "<%- options.x %>",
            options: {
                x: Number
            },

            initialize: function() {
                if ( this.options.x == 1 && !view1 ) {
                    view1 = this;
                }
                else if ( this.options.x == 2 && !view2 ) {
                    view2 = this;
                }
            }
        });

        var ParentView = Backbone.View.extend({
            template: `<%
                Child({x: 1});

                if ( flag ) {
                    Child({x: 2});
                } else {
                    Child({x: 3});
                }
            %>`,

            Views: {
                Child: ChildView
            }
        });

        var parentView = new ParentView({ model: {flag: true} });
        parentView.render();

        assert.ok( !!view1 );
        assert.ok( !!view2 );
        assert.equal( view1.$el.text(), "1" );
        assert.equal( view2.$el.text(), "2" );

        parentView.model.set("flag", false);

        assert.equal( view1.$el.text(), "1" );
        assert.equal( view2.$el.text(), "3" );

        parentView.model.set("flag", 0);

        assert.equal( view1.$el.text(), "1" );
        assert.equal( view2.$el.text(), "3" );

        parentView.model.set("flag", true);

        assert.equal( view2.$el.text(), "2" );
        assert.equal( view1.$el.text(), "1" );
    });


})(QUnit);
