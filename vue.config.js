const path = require('path');
function resolve(dir) {
    return path.join(__dirname, dir)
}
module.exports = {
    chainWebpack: (config)=>{
        config.resolve.alias
            .set('styles',resolve('src/assets/styles'))
            .set('common',resolve('src/common'))
            .set('js',resolve('src/assets/js'))
    },

    devServer: {
        proxy: {
            // proxy all requests starting with /api to jsonplaceholder
            '/api': {
                target: 'http://120.78.3.66:8088',   //代理接口
                // target: 'http://localhost:8081',   //代理接口
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/'    //代理的路径
                }
            }
        }
    },

    publicPath: '/', //  ./表示相对路径， 可以部署在任意路径下，如果为 / 则只能在nginx的html的根路径下面，如果指定为/app/ ，则可以部署在/app下面，默认为/
    outputDir: 'furnadmin', // 构建输出目录
    assetsDir: 'assets', // 静态资源目录 (js, css, img, fonts)

    configureWebpack: {
        performance: {
            hints:'warning',
            //入口起点的最大体积 整数类型（以字节为单位）
            maxEntrypointSize: 50000000,
            //生成文件的最大体积 整数类型（以字节为单位 300k）
            maxAssetSize: 30000000,
            //只给出 js 文件的性能提示
            assetFilter: function(assetFilename) {
                return assetFilename.endsWith('.js')
            }
        }
    },
}