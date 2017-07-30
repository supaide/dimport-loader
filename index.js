const path = require('path')
const fs = require('fs')
const loaderUtils = require("loader-utils")

module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  if (!options || !options.libname) {
    return source
  }

  let libname = options.libname

  return source
}
