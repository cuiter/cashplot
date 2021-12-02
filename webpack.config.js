const path = require("path");
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    entry: "./src/main.ts",
    mode: "production",
    devtool: "source-map",
    plugins: [
        new VueLoaderPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                }
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: { 'vue$': 'vue/dist/vue.esm.js' }
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "src/frontend/js"),
    },
};
