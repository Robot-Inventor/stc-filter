const path = require("path");

module.exports = {
    mode: "development",
    devtool: false,
    entry: {
        build: "./src/build.ts"
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    }
};
