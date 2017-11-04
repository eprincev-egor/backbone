"use strict";

    var Backbone = require("./main"),
        Events = require("./Events"),
        _ = Backbone._;

    require("../vendor/parse5");
    var htmlParser = new window.Parser();

    var Vdom = function Vdom() {};

    _.extend(Vdom.prototype, {
        // call for first build
        build: function(domNode, html) {
            this.vnode = htmlParser.parseFragment( html );
            this.setDomNode(this.vnode, domNode);
        },

        setDomNode: function(vnode, domNode) {
            vnode.domNode = domNode;

            if ( !_.isArray(vnode.childNodes) ) {
                return;
            }

            for (var i=0, n=vnode.childNodes.length; i<n; i++) {
                this.setDomNode(vnode.childNodes[i], domNode.childNodes[i]);
            }
        },

        // call for live render
        update: function(domNode, newHtml) {
            var oldNode = this.vnode;
            var newNode = htmlParser.parseFragment( newHtml );

            this.updateChildren(domNode, oldNode.childNodes, newNode.childNodes);
            this.vnode = newNode;
        },

        updateDom: function (previous, vnode) {
            var domNode = previous.domNode;
            var textUpdated = false;
            if (previous === vnode) {
                return false;    // By contract, VNode objects may not be modified anymore after passing them to maquette
            }
            var updated = false;
            if ( vnode.nodeName === '#text' ) {
                if (vnode.value != previous.value) {
                    domNode.textContent = vnode.value;
                    vnode.domNode = domNode;
                    textUpdated = true;
                    return textUpdated;
                }
            } else {
                updated = this.updateChildren(domNode, previous.childNodes, vnode.childNodes) || updated;
                updated = this.updateProperties(domNode, vnode, previous) || updated;
            }
            vnode.domNode = previous.domNode;
            return textUpdated;
        },

        updateChildren: function (domNode, oldChildren, newChildren, projectionOptions) {
            if (oldChildren === newChildren) {
                return false;
            }
            oldChildren = oldChildren || [];
            newChildren = newChildren || [];
            var oldChildrenLength = oldChildren.length;
            var newChildrenLength = newChildren.length;
            var oldIndex = 0;
            var newIndex = 0;
            var i;
            var textUpdated = false;
            while (newIndex < newChildrenLength) {
                var oldChild = oldIndex < oldChildrenLength ? oldChildren[oldIndex] : undefined;
                var newChild = newChildren[newIndex];
                if (oldChild !== undefined && this.same(oldChild, newChild)) {
                    textUpdated = this.updateDom(oldChild, newChild) || textUpdated;
                    oldIndex++;
                } else {
                    var findOldIndex = this.findIndexOfChild(oldChildren, newChild, oldIndex + 1);
                    if (findOldIndex >= 0) {
                        // Remove preceding missing children
                        for (i = oldIndex; i < findOldIndex; i++) {
                            this.nodeToRemove(oldChildren[i]);
                        }
                        textUpdated = this.updateDom(oldChildren[findOldIndex], newChild) || textUpdated;
                        oldIndex = findOldIndex + 1;
                    } else {
                        // New child
                        this.createDom(newChild, domNode, oldIndex < oldChildrenLength ? oldChildren[oldIndex].domNode : undefined);
                    }
                }
                newIndex++;
            }
            if (oldChildrenLength > oldIndex) {
                // Remove child fragments
                for (i = oldIndex; i < oldChildrenLength; i++) {
                    this.nodeToRemove(oldChildren[i]);
                }
            }
            return textUpdated;
        },

        same: function (vnode1, vnode2) {
            return vnode1.nodeName === vnode2.nodeName;
       },

       findIndexOfChild: function (children, sameAs, start) {
           if (sameAs.nodeName !== '#text') {
               // Never scan for text-nodes
               for (var i = start; i < children.length; i++) {
                   if ( this.same(children[i], sameAs) ) {
                       return i;
                   }
               }
           }
           return -1;
       },

       nodeToRemove: function (vNode) {
           var domNode = vNode.domNode;
           if (domNode.parentNode) {
               domNode.parentNode.removeChild(domNode);
           }
       },

       createDom: function (vnode, parentNode, insertBefore) {
           var domNode, i, c, start = 0, type, found;
           var doc = parentNode.ownerDocument;
           if (vnode.nodeName === '#text') {
               domNode = vnode.domNode = doc.createTextNode(vnode.value);
               if (insertBefore !== undefined) {
                   parentNode.insertBefore(domNode, insertBefore);
               } else {
                   parentNode.appendChild(domNode);
               }
           } else {
               domNode = vnode.domNode = vnode.domNode || doc.createElement( vnode.tagName );

               if (insertBefore !== undefined) {
                   parentNode.insertBefore(domNode, insertBefore);
               } else if (domNode.parentNode !== parentNode) {
                   parentNode.appendChild(domNode);
               }

               this.initPropertiesAndChildren(domNode, vnode);
           }
       },

       initPropertiesAndChildren: function (domNode, vnode) {
           this.addChildren(domNode, vnode.childNodes);
           this.updateProperties(domNode, vnode);
       },

       addChildren: function (domNode, children) {
           if (!children) {
               return;
           }
           for (var i = 0; i < children.length; i++) {
               this.createDom(children[i], domNode, undefined);
           }
       },

       updateProperties: function (domNode, vnode, previous) {
           var oldAttrs, newAttrs;

           if ( !_.isArray(vnode && vnode.attrs) ) {
               newAttrs = [];
           } else {
               newAttrs = vnode.attrs;
           }

           if ( !_.isArray(previous && previous.attrs) ) {
               oldAttrs = [];
           } else {
               oldAttrs = previous.attrs;
           }

           var propertiesUpdated = false,
                i, n, attr,
                oldValue,
                tmp = {};

           for (i=0, n=oldAttrs.length; i<n; i++) {
               attr = oldAttrs[ i ];
               tmp[ attr.name ] = attr.value;
           }
           oldAttrs = tmp;

           tmp = {};
           for (i=0, n=newAttrs.length; i<n; i++) {
               attr = newAttrs[ i ];
               oldValue = oldAttrs[ attr.name ];

               if ( attr.value != oldValue ) {
                   propertiesUpdated = true;

                   if ( attr.name == "class" ) {
                       domNode.className = attr.value;
                   }
                   else if ( this.isProp( vnode, attr ) ) {
                       domNode[ attr.name ] = attr.value;
                   }
                   else {
                       domNode.setAttribute( attr.name, attr.value );
                   }
               }
               tmp[ attr.name ] = attr.value;
           }
           newAttrs = tmp;

           for (var key in oldAttrs) {
               if ( key in newAttrs ) {
                   continue;
               }
               propertiesUpdated = true;
               domNode.removeAttribute( key );
           }

           return propertiesUpdated;
       },

       isProp: function(vnode, attr) {
           return attr.name == "value";
       }
    });

module.exports = Vdom;