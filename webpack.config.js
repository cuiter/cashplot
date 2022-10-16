const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const LiveReloadPlugin = require("webpack-livereload-plugin");

module.exports = {
    entry: "./src/main.ts",
    mode: "production",
    devtool: "source-map",
    plugins: [new VueLoaderPlugin(), new LiveReloadPlugin()],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader",
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
            {
                test: /\.(html|css)$/i,
                use: "raw-loader",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: { vue$: "vue/dist/vue.esm.js" },
    },
    performance: {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "src/web/static/js"),
    },
};
