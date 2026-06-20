const fs = require('fs')
const path = require('path')

require('babel-core/register')({
  presets: ['es2015'],
})

const testFiles = fs.readdirSync(__dirname)
  .filter(file => /\.test\.js$/.test(file))
  .sort()

testFiles.forEach(file => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(path.join(__dirname, file))
})

console.log(`${testFiles.length} test files passed`)
