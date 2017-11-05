(function(QUnit) {
    "use strict";

    QUnit.module('HTMLParser');

    function checkAttrs(attrs, mustBe) {
        if ( attrs.length != mustBe.length) {
            return false;
        }
        else {
            for (var i = 0, n = attrs.length; i < n; i++) {
                var attr = attrs[i],
                    mustBeAttr = mustBe[i];

                if ( attr.name != mustBeAttr.name ) {
                    return false;
                }

                if ( attr.value != mustBeAttr.value ) {
                    return false;
                }
            }
        }

        return true;
    }

    function checkNodes(nodes, mustBe) {
        if ( nodes.length != mustBe.length) {
            return false;
        }

        for (var i = 0, n = nodes.length; i < n; i++) {
            var node = nodes[i],
                mustBeNode = mustBe[i];

            if ( mustBeNode.nodeName != mustBeNode.nodeName ) {
                return false;
            }

            if ( node.nodeName == "#text" ) {
                if ( node.value != mustBeNode.value ) {
                    return false;
                }
            }
            else if ( !checkAttrs(node.attrs, mustBeNode.attrs) ) {
                return false;
            }
            else if ( !checkNodes(node.childNodes, mustBeNode.childNodes) ) {
                return false;
            }
        }

        return true;
    }

    function testAttrs(assert, html, mustBe, needError) {
        var attrs,
            isOk = true,
            isError = false,
            text = "`" + html + "` mustBe: " + JSON.stringify(mustBe, null, 4);

        try {
            attrs = new Backbone.HTMLParser(html).parseAttrs();
        } catch(err) {
            isError = true;
        }

        if ( needError ) {
            text = "need error in html: " + html;
        }

        if ( needError && !isError ) {
            isOk = false;
        }
        else if ( isError ) {
            isOk = !!needError;
        }
        else {
            isOk = checkAttrs( attrs, mustBe );
        }

        assert.ok( isOk, text );
    }

    function testHTML(assert, html, mustBe, needError) {
        var nodes,
            isOk = true,
            isError = false,
            text = "`" + html + "` mustBe: " + JSON.stringify(mustBe, null, 4);

        try {
            nodes = new Backbone.HTMLParser(html).parse();
        } catch(err) {
            isError = true;
        }

        if ( needError ) {
            text = "need error in html: " + html;
        }

        if ( needError && !isError ) {
            isOk = false;
        }
        else if ( isError ) {
            isOk = !!needError;
        }
        else {
            isOk = checkNodes( nodes, mustBe );
        }

        assert.ok( isOk, text );
    }

    QUnit.test('parse attrs', function(assert) {
        testAttrs(assert, "x=1", [{
            name: "x",
            value: 1
        }]);
        testAttrs(assert, "x=1 x=1", [{
            name: "x",
            value: 1
        }, {
            name: "x",
            value: 1
        }]);
        testAttrs(assert, "x='1' x=1", [{
            name: "x",
            value: 1
        }, {
            name: "x",
            value: 1
        }]);
        testAttrs(assert, "x='1' x='1'", [{
            name: "x",
            value: 1
        }, {
            name: "x",
            value: 1
        }]);
        testAttrs(assert, '  x  = "1"  x=  "1" ', [{
            name: "x",
            value: 1
        }, {
            name: "x",
            value: 1
        }]);

        testAttrs(assert, '', []);
        testAttrs(assert, '   ', []);
        testAttrs(assert, ' \u0010  ', [{name: "\u0010"}]);
        testAttrs(assert, ' \u0010=1  ', [{name: "\u0010", value: 1}]);
        testAttrs(assert, ' \u0010 =1  ', [{name: "\u0010", value: 1}]);
        testAttrs(assert, ' \u0010 = 1  ', [{name: "\u0010", value: 1}]);
        testAttrs(assert, ' \u0010 = "1"  ', [{name: "\u0010", value: 1}]);

        testAttrs(assert, 'x=1/> a=2', [{
            name: "x",
            value: 1
        }]);

        testAttrs(assert, 'X=1/> a=2', [{
            name: "x",
            value: 1
        }]);

        testAttrs(assert, 'x=1> a=2', [{
            name: "x",
            value: 1
        }]);

        testAttrs(assert, 'x> a=2', [{
            name: "x"
        }]);

        testAttrs(assert, '/', []);
    });

    QUnit.test("parseFragment", function(assert) {

        testHTML(assert, "<input/>", [
            {
                nodeName: "input",
                attrs: [],
                childNodes: []
            }
        ]);
        testHTML(assert, "<input></input>", [
            {
                nodeName: "input",
                attrs: [],
                childNodes: []
            }
        ], true);

        testHTML(assert, "<textarea></textarea>", [
            {
                nodeName: "textarea",
                attrs: [],
                childNodes: []
            }
        ]);

        testHTML(assert, "<textarea/>", [
            {
                nodeName: "textarea",
                attrs: [],
                childNodes: []
            }
        ], true);

        testHTML(assert, "<div></div>", [
            {
                nodeName: "div",
                attrs: [],
                childNodes: []
            }
        ]);

        testHTML(assert, "<Div></div>", [
            {
                nodeName: "div",
                attrs: [],
                childNodes: []
            }
        ]);

        testHTML(assert, "<DIV></div>", [
            {
                nodeName: "div",
                attrs: [],
                childNodes: []
            }
        ]);

        testHTML(assert, "<div ></div>", [
            {
                nodeName: "div",
                attrs: [],
                childNodes: []
            }
        ]);

        testHTML(assert, "< div></div>", [
            {
                nodeName: "div",
                attrs: [],
                childNodes: []
            }
        ]);

        testHTML(assert, "<div>< /div>", [
            {
                nodeName: "div",
                attrs: [],
                childNodes: []
            }
        ]);

        testHTML(assert, "<div></ div>", [
            {
                nodeName: "div",
                attrs: [],
                childNodes: []
            }
        ]);

        testHTML(assert, "<div></div><div></div>", [
            {
                nodeName: "div",
                attrs: [],
                childNodes: []
            },
            {
                nodeName: "div",
                attrs: [],
                childNodes: []
            }
        ]);

        testHTML(assert, "<div><div></div></div>", [
            {
                nodeName: "div",
                attrs: [],
                childNodes: [{
                    nodeName: "div",
                    attrs: [],
                    childNodes: []
                }]
            }
        ]);

        testHTML(assert, `<input  __tmp-id="val13" /><a href="javascript:void 0" class="remove" data-index="0"></a>`, [
            {
                nodeName: "input",
                attrs: [
                    {
                        "name": "__tmp-id",
                        "value": "val13"
                    }
                ],
                childNodes: []
            },
            {
                nodeName: "a",
                attrs: [
                    {
                        name: "href",
                        value: "javascript:void 0" // jshint ignore: line
                    },
                    {
                        name: "class",
                        value: "remove"
                    },
                    {
                        name: "data-index",
                        value: "0"
                    }
                ],
                childNodes: []
            }
        ]);

        testHTML(assert, `  <h1>List of most popular given names in USA</h1>  <div>  <input  __tmp-id="val13" />  <a href="javascript:void 0" class="remove" data-index="0">  remove name James  </a>  </div>  <div>  <input placeholder="enter name"  __tmp-id="val23" />  <button class="add">add item</button>  </div><div>Total count: 10</div>`,
        [
            {
                nodeName: "#text",
                value: `  `
            }       ,
            {
                nodeName: "h1",
                attrs: [],
                childNodes: [
                    {
                        nodeName: "#text",
                        value: "List of most popular given names in USA"
                    }
                ]
            },
            {
                nodeName: "#text",
                value: `  `
            },
            {
                nodeName: "div",
                attrs: [],
                childNodes: [
                    {
                        nodeName: "#text",
                        value: `  `
                    },
                    {
                        nodeName: "input",
                        attrs: [
                            {
                                name: "__tmp-id",
                                value: "val13"
                            }
                        ],
                        childNodes: []
                    },
                    {
                        nodeName: "#text",
                        value: `  `
                    },
                    {
                        nodeName: "a",
                        attrs: [
                            {
                                name: "href",
                                value: "javascript:void 0" // jshint ignore: line
                            },
                            {
                                name: "class",
                                value: "remove"
                            },
                            {
                                name: "data-index",
                                value: "0"
                            }
                        ],
                        childNodes: [
                            {
                                nodeName: "#text",
                                value: `  remove name James  `
                            }
                        ]
                    },
                    {
                        nodeName: "#text",
                        value: `  `
                    }
                ]
            },
            {
                nodeName: "#text",
                value: "  "
            },
            {
                nodeName: "div",
                attrs: [],
                childNodes: [
                    {
                        nodeName: "#text",
                        value: "  "
                    },
                    {
                        nodeName: "input",
                        attrs: [
                            {
                                name: "placeholder",
                                value: "enter name"
                            },
                            {
                                name: "__tmp-id",
                                value: "val23"
                            }
                        ],
                        childNodes: []
                    },
                    {
                        nodeName: "#text",
                        value: "  "
                    },
                    {
                        nodeName: "button",
                        attrs: [
                            {
                                name: "class",
                                value: "add"
                            }
                        ],
                        childNodes: [
                            {
                                nodeName: "#text",
                                value: "add item"
                            }
                        ]
                    },
                    {
                        nodeName: "#text",
                        value: "  "
                    },
                ]
            },
            {
                nodeName: "div",
                attrs: [],
                childNodes: [{
                    nodeName: "#text",
                    value: "Total count: 10"
                }]
            }
        ]);

    });
})(QUnit);
