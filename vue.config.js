module.exports = {
  chainWebpack: config => {
    config
        .plugin('html')
        .tap(args => {
            args[0].title = "Loopbar";
            return args;
        })
  },
  lintOnSave: true
}
