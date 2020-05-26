/***************************************************
 * Created by nanyuantingfeng on 2020/5/25 20:31. *
 ***************************************************/

const config = require('hollow-cli/webpack.simple.dev.config')

config.patch.entry('./example/index.tsx')

module.exports = config.toConfig()
