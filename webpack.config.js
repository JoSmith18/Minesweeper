const path = require('path');
const fs = require('fs');
const R = require('ramda');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const pages = fs.readdirSync(path.resolve('src', 'pages'));

const entries = R.zipObj(
    pages,
    pages.map(p => path.resolve('src', 'pages', p, p + '.js'))
);

const htmlPagesToCopy = pages.map(p => ({
    from: path.resolve('src', 'pages', p, p + '.html'),
    to: path.resolve('dist', p, 'index.html')
}));

const assetsToCopy = fs.exists('assets')
    ? [{ from: 'assets', to: path.resolve('dist', 'assets') }]
    : [];

const filesToCopy = R.concat(htmlPagesToCopy, assetsToCopy);

module.exports = {
    entry: entries,
    output: {
        filename: '[name]/[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [new CopyWebpackPlugin(filesToCopy)]
};
