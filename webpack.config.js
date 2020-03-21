const webpack               = require('webpack');
const path                  = require('path');
const MiniCssExtractPlugin  = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const VueLoaderPlugin       = require('vue-loader/lib/plugin');
// const UglifyJsPlugin        = require("uglifyjs-webpack-plugin");
const ZipPlugin             = require('zip-webpack-plugin');
const CopyWebpackPlugin     = require('copy-webpack-plugin');
const isProd                = process.env.NODE_ENV === 'production';

let config = {
    entry: {
        content: './content.js'
    },

    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].js',
    },

    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            vue: `vue/dist/vue${isProd ? '.min' : ''}.js`
        }
    },

    stats: {
        maxModules: 5,
        timings: true,
        modules: false,
        entrypoints: false
    },

    plugins: [
      new webpack.HashedModuleIdsPlugin(),
      new VueLoaderPlugin(),
	    new MiniCssExtractPlugin({
		    filename:'css.css'
	    }),
        new CopyWebpackPlugin(['./copy'])
    ],

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader'
            }],
        }, {
            test: /\.vue$/,
            exclude: /node_modules/,
            use: [{
                loader: 'vue-loader'
            }]
        },{
            test: /\.(less|css)$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
                'less-loader'
            ],
        },{
            test: /\.html$/,
            use: ['html-loader']
        },{
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        },{
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: [
                'file-loader'
            ]
        }]
    }
};

if (isProd) {
    config.mode = 'production';
    config.plugins.push(
		new OptimizeCSSAssetsPlugin(),
		new ZipPlugin({ path: '../', filename: 'BetterRuler.zip' })
    );
} else {
    config.mode = 'development';
    config.devtool = 'cheap-eval-source-map';
}

module.exports = config;
