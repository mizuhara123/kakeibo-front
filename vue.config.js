const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      if (args && args[0]) {
        args[0].title = '管理系統';
      }
      return args;
    });
  }
});

