const fs = require('fs')

// webpack loads .csv files with raw-loader; mirror that for node
require.extensions['.csv'] = (module, filename) => {
  module.exports = fs.readFileSync(filename, 'utf8')
}

/** minimal window/document so browser-oriented modules can be required in node */
function installBrowserStubs({canvasSize = {width: 800, height: 600}} = {}) {
  const canvasContainer = {
    offsetWidth: canvasSize.width,
    offsetHeight: canvasSize.height,
  }
  const element = () => ({
    style: {},
    appendChild() {},
    addEventListener() {},
    setAttribute() {},
  })
  global.window = global.window || {}
  global.window.devicePixelRatio = 1
  global.window.location = {search: ''}
  global.document = {
    location: {port: ''},
    body: element(),
    querySelector: () => null,
    getElementsByTagName: () => [element()],
    getElementById: id => (id === 'canvas' ? canvasContainer : null),
    createElement: element,
  }
  return {canvasContainer}
}

module.exports = {installBrowserStubs}
