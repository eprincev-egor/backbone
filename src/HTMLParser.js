"use strict";

var Backbone = require("./main"),
    _ = Backbone._;

function HTMLParser(str) {
    this.str = str;
    this.n = str.length;
    this.i = 0;
}

_.extend(HTMLParser.prototype, {
    readTo: function(stopRegExp) {
        var i, str;

        str = this.str.slice(this.i);
        i = str.search(stopRegExp);
        if (i == -1) {
            this.i = this.n;
            return str;
        } else {
            this.i += i;
            return str.slice(0, i);
        }
    },

    isNotEnd: function() {
        return this.i < this.n;
    },

    skipSpace: function() {
        while (this.isNotEnd()) {
            var symb = this.str[this.i];

            if (!/\s/.test(symb)) {
                break;
            }
            this.i++;
        }
    },

    readQuotes: function(q) {
        var subStr = "";
        this.i++;
        for (var n = this.n, str = this.str, s; this.i < n; this.i++) {
            s = str[this.i];

            if (s == q) {
                this.i++;
                break;
            }

            subStr += s;
        }

        return subStr;
    },

    isQuotes: function() {
        var symb = this.str[this.i];
        return symb == "'" || symb == "\"";
    },

    parseAttrs: function() {
        var attrs = [],
            symb,
            key;

        this.skipSpace();
        while (this.isNotEnd()) {
            symb = this.str[this.i];

            if (symb == "/" || symb == ">") {
                break;
            } else if (/\s/.test(symb)) {
                this.skipSpace();
            } else {
                key = this.readTo(/[\s=/>]/).toLowerCase();
                var attr = {
                    name: key
                };

                this.skipSpace();
                symb = this.str[this.i];

                if (symb == "=") {
                    this.i++;
                    this.skipSpace();

                    if (this.isQuotes()) {
                        attr.value = this.readQuotes(this.str[this.i]);
                    } else {
                        attr.value = this.readTo(/[\s/>]/);
                    }
                    if ( key == "cid" ) {
                        attrs.cid = attr.value;
                    }
                }

                attrs.push(attr);
            }
        }

        return attrs;
    },

    parseTag: function() {
        // skip "<"
        if (this.str[this.i] == "<") {
            this.i++;
        }
        // < div
        this.skipSpace();

        var parent = {
            nodeName: this.readTo(/[\s>/]/),
            attrs: this.parseAttrs(),
            childNodes: []
        };

        if ( !parent.attrs.cid ) {
            parent.nodeName = parent.nodeName.toLowerCase();
        } else {
            parent.cid = parent.attrs.cid;
            delete parent.attrs.cid;
        }

        var symb, child,
            closeTagName;

        symb = this.str[this.i];

        if (symb == "/") {
            this.i++;
            this.skipSpace();

            symb = this.str[this.i];
            if (symb != ">") {
                throw new Error("expected />");
            }

            if (parent.nodeName == "textarea") {
                throw new Error("invalid html, textarea is multi tag");
            }

            this.i++;
            return parent;
        } else if (symb == ">") {
            this.i++;
        }

        if (parent.nodeName == "input") {
            throw new Error("invalid html, input is single tag");
        }

        while (this.isNotEnd()) {
            symb = this.str[this.i];

            if (symb == "<") {
                this.i++;
                this.skipSpace();
                symb = this.str[this.i];

                // is close tag
                if (symb == "/") {
                    this.i++;
                    this.skipSpace();

                    closeTagName = this.readTo(/[\s>]/).toLowerCase();
                    symb = this.str[this.i];

                    // <input/>
                    if (symb == ">") {
                        this.i++;
                        break;
                    }

                    if (closeTagName != parent.nodeName) {
                        throw new Error("invalid closeTagName");
                    }

                    this.skipSpace();
                    symb = this.str[this.i];

                    if (symb != ">") {
                        throw new Error("invalid closeTagName");
                    }
                    this.i++;

                    break;
                } else {
                    child = this.parseTag();
                    parent.childNodes.push(child);
                }
            } else {
                child = this.parseTextNode();
                parent.childNodes.push(child);
            }
        }

        return parent;
    },

    parseTextNode: function() {
        return {
            nodeName: "#text",
            value: this.readTo(/[<]/)
        };
    },

    // entry point
    parse: function() {
        var elements = [],
            symb,
            el;

        while (this.isNotEnd()) {
            symb = this.str[this.i];

            if (symb == "<") {
                el = this.parseTag();
                elements.push(el);
            } else {
                el = this.parseTextNode();
                elements.push(el);
            }
        }

        return elements;
    },

    parseFragment: function() {
        return {
            nodeName: "#fragment",
            attrs: [],
            childNodes: this.parse()
        };
    }
});

HTMLParser.parse = function(html) {
    return new HTMLParser(html).parse();
};
HTMLParser.parseFragment = function(html) {
    return new HTMLParser(html).parseFragment();
};

Backbone.HTMLParser = HTMLParser;

module.exports = HTMLParser;
