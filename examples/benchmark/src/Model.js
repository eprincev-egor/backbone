'use strict';

function _random(max) {
    return Math.round(Math.random()*1000)%max;
}

let index = 0;
const Model = Backbone.Model.extend({
    defaults: () => ({
        data: [],
        selected: null
    }),
    buildData(count = 1000) {
        var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
        var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
        var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
        var data = [];
        for (var i = 0; i < count; i++)
            data.push({id: ++index, label: adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)] });
        return data;
    },
    updateData(mod = 10) {
        // Just assigning setting each tenth this.data doesn't cause a redraw, the following does:
        var newData = [],
            data = this.get("data");
        for (let i = 0; i < data.length; i ++) {
            if (i%10===0) {
                newData[i] = Object.assign({}, data[i], {label: data[i].label + ' !!!'});
            } else {
                newData[i] = data[i];
            }
        }
        this.set("data", newData);
    },
    addRows() {
        this.set("data", this.get("data").concat(this.buildData(1000)) );
    },
    run() {
        this.set({
            data: this.buildData(),
            selected: null
        });
    },
    updateRows() {
        this.updateData();
    },
    runLots() {
        this.set({
            data: this.buildData(10000),
            selected: null
        });
    },
    clearRows() {
        this.set({
            data: [],
            selected: null
        });
    },
    swapRows() {
        var data = this.get("data");
    	if(data.length > 10) {
    		let d4 = data[4];
			let d9 = data[9];

			var newData = data.map(function(data, i) {
				if(i === 4) {
					return d9;
				}
				else if(i === 9) {
					return d4;
				}
				return data;
			});
			this.set("data", newData);
    	}
    },


    selectRow(id) {
        this.set("selected", id);
    },
    removeRow(id) {
        var idx = this.data.findIndex(row => row.id==id);
        this.get("data").splice(idx, 1);
        this.trigger("change");
    }
});

export default Model;
