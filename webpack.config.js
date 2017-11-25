"use strict";

var path = require("path");

var config = {
    devtool: "source-map",
    entry: path.join(__dirname, "src/index.js"),
    output: {
        path: path.join(__dirname, "dist"),
        filename: "backbone.js"
    },

    module: {
        rules: [
            {
                exclude: /(node_modules|bower_components|videojs|underscore)/,
                test: /\.js$/,
                loader: "babel-loader",
                query: {
                    presets: ["es2015"]
                }
            }
        ]
    }
};

module.exports = config;
