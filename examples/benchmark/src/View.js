"use strict";

import Model from "./Model";
import template from "./View.html";

var startTime, lastMeasure;
var startMeasure = function(name) {
    startTime = performance.now();
    lastMeasure = name;
};
var stopMeasure = function() {
    var last = lastMeasure;
    if (lastMeasure) {
        window.setTimeout(function () {
            lastMeasure = null;
            var stop = performance.now();
            console.log(last+" took "+(stop-startTime));
        }, 0);
    }
};

export default Backbone.View.extend({
    Model,
    template,

    events: {
        "click #run": "run",
        "click #runLots": "runLots",
        "click #add": "add",
        "click #update": "update",
        "click #clear": "clear",
        "click #swapRows": "swapRows",

        "click .select": "select",
        "click .remove": "remove"
    },

    add() {
        startMeasure("add");
        this.model.addRows();
        stopMeasure();
    },
    run() {
        startMeasure("run");
        this.model.run();
        stopMeasure();
    },
    update() {
        startMeasure("update");
        this.model.updateRows();
        stopMeasure();
    },
    runLots() {
        startMeasure("runLots");
        this.model.runLots();
        stopMeasure();
    },
    clear() {
        startMeasure("clear");
        this.model.clearRows();
        stopMeasure();
    },
    swapRows() {
        startMeasure("swapRows");
        this.model.swapRows();
        stopMeasure();
    },


    remove(e) {
        let id = e.target.dataset.id;
        startMeasure("remove");
        this.model.removeRow(id);
        stopMeasure();
    },
    select(e) {
        let id = e.target.dataset.id;
        startMeasure("select");
        this.model.selectRow(id);
        stopMeasure();
    }
});
