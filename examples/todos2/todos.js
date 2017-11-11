// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone.localStorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
(function() {
    "use strict";
    
    // Todo Model
    // ----------

    // Our basic **Todo** model has `title`, `order`, and `done` attributes.
    var Todo = Backbone.Model.extend({

        // Default attributes for the todo item.
        defaults: function() {
            return {
                title: "empty todo...",
                order: Todos.nextOrder(),
                done: false
            };
        },

        // Toggle the `done` state of this todo item.
        toggle: function() {
            this.save({
                done: !this.get("done")
            });
        }

    });

    // Todo Collection
    // ---------------

    // The collection of todos is backed by *localStorage* instead of a remote
    // server.
    var TodoList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Todo,

        // Save all of the todo items under the `"todos-backbone"` namespace.
        localStorage: new Backbone.LocalStorage("todos-backbone"),

        // Filter down the list of all todo items that are finished.
        done: function() {
            return this.where({
                done: true
            });
        },

        // Filter down the list to only todo items that are still not finished.
        remaining: function() {
            return this.where({
                done: false
            });
        },

        // We keep the Todos in sequential order, despite being saved by unordered
        // GUID in the database. This generates the next order number for new items.
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        // Todos are sorted by their original insertion order.
        comparator: 'order'

    });

    // Create our global collection of **Todos**.
    var Todos = new TodoList();

    // Todo Item View
    // --------------

    // The DOM element for a todo item...
    var TodoView = Backbone.View.extend({

        //... is a list tag.
        tagName: "li",

        // Cache the template function for a single item.
        template: '#item-template',
        
        ui: {
            $input: "input.edit"
        },
        
        className: function() {
            var classes = [];
            if( this.model.get("done") ) {
                classes.push("done");
            }
            return classes;
        },

        // The DOM events specific to an item.
        events: {
            "click .toggle": "toggleDone",
            "dblclick .view": "edit",
            "click a.destroy": "clear",
            "keypress .edit": "updateOnEnter",
            "blur .edit": "close"
        },

        // Toggle the `"done"` state of the model.
        toggleDone: function() {
            this.model.toggle();
        },

        // Switch this view into `"editing"` mode, displaying the input field.
        edit: function() {
            this.$el.addClass("editing");
            this.ui.$input.focus();
        },

        // Close the `"editing"` mode, saving changes to the todo.
        close: function() {
            var value = this.ui.$input.val();
            if (!value) {
                this.clear();
            } else {
                this.model.save({
                    title: value
                });
                this.$el.removeClass("editing");
            }
        },

        // If you hit `enter`, we're through editing the item.
        updateOnEnter: function(e) {
            if (e.keyCode == 13) this.close();
        },

        // Remove the item, destroy the model.
        clear: function() {
            this.model.destroy();
        }

    });
    
    var FooterView = Backbone.View.extend({
        tagName: "footer",
        // Our template for the line of statistics at the bottom of the app.
        template: "#footer-template",
        
        options: {
            done: Number,
            remaining: Number
        }
    });

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    var AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#todoapp"),
        
        template: "#app-template",
        
        Views: {
            TodoItem: TodoView,
            Footer: FooterView
        },
        
        ui: {
            $input: "#new-todo",
            $allCheckbox: "#toggle-all"
        },
        
        // Delegated events for creating new items, and clearing completed ones.
        events: {
            "keypress @ui.$input": "createOnEnter",
            "click #clear-completed": "clearCompleted",
            "click @ui.$allCheckbox": "toggleAllComplete"
        },

        // If you hit return in the main input field, create new **Todo** model,
        // persisting it to *localStorage*.
        createOnEnter: function(e) {
            if (e.keyCode != 13) return;
            if (!this.ui.$input.val()) return;

            this.collection.create({
                title: this.ui.$input.val()
            });
            this.ui.$input.val('');
        },

        // Clear all done todo items, destroying their models.
        clearCompleted: function() {
            _.invoke(this.collection.done(), 'destroy');
            return false;
        },

        toggleAllComplete: function() {
            var done = this.ui.$allCheckbox.prop("checked");
            this.collection.each(function(todo) {
                todo.save({
                    'done': done
                });
            });
        }

    });

    // Finally, we kick things off by creating the **App**.
    var App = new AppView({
        collection: Todos
    });
    App.render();
    Todos.fetch();
    window.App = App;

})();
