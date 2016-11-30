const path = require('path'); //处理路径
const merge = require('webpack-merge'); //合并配置项
const validator = require('webpack-validator'); //验证配置项是否合理
const HtmlWebpackPlugin = require('html-webpack-plugin'); //生成html
const CleanWebpackPlugin = require('clean-webpack-plugin'); //每次都清空build文件夹
const webpack = require('webpack');


const PATHS = {
    app: path.resolve(__dirname, "app", "index.jsx"),
    build: path.resolve(__dirname, "build")
};

//公共配置项
const common_config = {
    entry: {
        app: PATHS.app
    },
    output: {
        path: PATHS.build,
        filename: "[name].js"
    },
    plugins: [
        new CleanWebpackPlugin(PATHS.build, {
            root: process.cwd()
        }),
        new HtmlWebpackPlugin({
            template: require('html-webpack-template'), //生成模版html
            title: "鹰视利|我们的眼护专家",
            appMountId: "app",
            inject: false
        })
    ],

    module: {
        loaders: [{
            test: /\.(js|jsx)$/,
            loader: "babel",
            query: {
                presets: ["es2015", "react"]
            },
            exclude: /node_module/
        }]
    }

};

let config;
switch (process.env.npm_lifecycle_event) {
    case "dll":
        config = common_config;
        break;
    default:
        config = common_config;
}

module.exports = validator(config);
