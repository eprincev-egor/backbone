// jshint browser: false
"use strict";

var path = require("path");
var webpack = require("webpack");

var config = {
    devtool: 'source-map',
    context: path.join(__dirname, 'src'),
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "backbone.js"
    },
    
    resolve: {
        alias: {
        }
    },
    
    plugins: [
    ],
    
    module: {
        rules: [
        ]
    }
};

module.exports = config;