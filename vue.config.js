const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  publicPath: './', // 让打包路径相对化（防止白屏）

  devServer: {
    port: 8080,
  },

  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '家計簿システム';
      return args;
    });
  }
})

