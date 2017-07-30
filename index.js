const path = require('path')
const fs = require('fs')
const loaderUtils = require("loader-utils")

let mainContents = {}

let getLibMainContent = function (projectDir, libName) {
  if (mainContents[libName]) {
    return mainContents[libName]
  }
  let libDir = projectDir + path.sep + 'node_modules' + path.sep + libName
  let packageFile = libDir + path.sep + 'package.json'
  let pkg = require(packageFile)
  let mainFile = pkg.main || 'index.js'
  mainFile = path.join(libDir + path.sep + mainFile)
  mainContents[libName] = [fs.readFileSync(mainFile).toString().trim(), mainFile]
  return mainContents[libName]
}

let getReplacedStatement = function (projectDir, libname, target) {
  // import Page from './components/page/index.vue'
  let main = getLibMainContent(projectDir, libname)
  let mainContent = main[0], mainFile = main[1]
  let reg = new RegExp('import[ |\\t]+'+target.trim()+'[ |\\t]+from[ |\\t]+[\'|"][^\'|^"]+[\'|"]', 'i')
  console.log(reg)
  //console.log(mainContent)
  let matchs = mainContent.match(reg)
  if (matchs) {
    let targetPath = matchs[0].split('from')[1].trim().substr(1)
    targetPath = targetPath.substr(0, targetPath.length-1)
    return matchs[0].split('from')[0] + ' from "' + path.join(path.dirname(mainFile), targetPath) + '"'
  }
  return null
}

module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  if (!options || !options.libname || this.resourcePath.indexOf('node_modules') > -1) {
    return source
  }
  let projectDir = options.projectDir || process.cwd()
  console.log("\n")
  console.log(this.resourcePath)

  let libname = options.libname
  // import {Page, Spinner} from 'spd-ui'
  const reg = new RegExp('import[ |\\t]+{[\\w|,| |\\t]+}[ |\\t]+from[ |\\t]+[\'|"]'+options.libname+'[\'|"]', 'gi')
  const matchs = source.match(reg)
  if (matchs) {
    for (let i=0; i<matchs.length; i++) {
      let replacement = []
      matchs[i].split('{')[1].split('}')[0].split(',').forEach(target => {
        let statement = getReplacedStatement(projectDir, options.libname, target)
        console.log(statement)
        if (statement) {
          replacement.push(statement)
        }
      })
      source = source.replace(matchs[i], replacement.join(";"))
    }
    //console.log(source)
  }
  return source
}
