module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Loopbar'
        return args
      })
  },
  pwa: {
    workboxOptions: {
      skipWaiting: true,
    },
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/loopbar/'
    : '/',
  lintOnSave: true
}
