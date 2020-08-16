const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    //by https://blog.csdn.net/moshowgame
    //当entry是个数组的时候，里面同样包含入口js文件，另外一个参数可以是用来配置webpack提供的一个静态资源服务器，webpack-dev-server。webpack-dev-server会监控项目中每一个文件的变化，实时的进行构建，并且自动刷新页面：
    //当entry是个对象的时候，我们可以将不同的文件构建成不同的文件，按需使用，比如在我的hello页面中只要\引入hello.js即可：
    entry: './src/index.js',
    //打包後生成的檔案路徑
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index_bundle.js'
    },
    //自动补全,后缀可以省略不写
    //webpack在构建包的时候会按目录的进行文件的查找，resolve属性中的extensions数组中用于配置程序可以自行补全哪些文件后缀：
    //onfiguration.resolve.extensions[0] should be an non-empty string.A non-empty string .请把[]中得''去掉
    resolve: {
        extensions: ['.js', '.jsx', '.css', '.scss', '.json'],
        alias: {
            //配置后可以直接用@来表示这个位置,直接应用目录下得文件,是绝对路径
            '@': path.join(__dirname, './src')
        }
    },
    //設置 eval 或 SourceMap 屬性，debug 用
    //devtool: 'cheap-module-eval-source-map',
    module: {
        rules: [
            {
                //自動編譯 JSX 或 JS 檔 （require 可載入 JSX 了）
                test: /\.(js|jsx)$/,
                use: { loader: 'babel-loader' },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ],
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }],
                exclude: /node_modules/
            }
        ]
    },
    node: {
        fs: 'empty'
    },
    devServer: {
        contentBase: './dist',
        hot: true
    },
    plugins: [
        //https://github.com/jantimon/html-webpack-plugin
        //This will generate a file dist/index.html and autp-import index_bundle.js
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html'
        })
    ],
    externals: [
        {
            './cptable': 'var cptable',
            '../xlsx.js': 'var _XLSX'
        }
    ]
}
