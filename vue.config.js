const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '家計簿システム'
      return args
    })

    // ✅ 这段是关键：确保 public/_redirects 被复制进 dist/
    config.plugin('copy').tap(args => {
      args[0][0].from = path.resolve(__dirname, 'public')
      args[0][0].to = path.resolve(__dirname, 'dist')
      return args
    })
  }
})

