// jshint browser: false
"use strict";

const path = require("path");
const webpack = require("webpack");

module.exports = {
    devtool: 'source-map',
    entry: {
        main: path.join(__dirname, './src/main.js')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "[name].js"
    },

    module: {
        rules: [
            {
                exclude: [/(node_modules)/],
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader?presets[]=es2015&presets[]=stage-0'
                }]
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: [{
                    loader: "html-loader"
                }]
            }
        ]
    }
};
