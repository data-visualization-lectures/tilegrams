const assert = require('assert')
const {installBrowserStubs} = require('./helpers/browserStubs')

installBrowserStubs()
const datasetResource = require('../source/resources/DatasetResource').default

// numeric codes, zero padding, ISO codes and prefecture names resolve to the same id
assert.deepStrictEqual(
  datasetResource.parseCsv('13,100\n01,5\nJP-27,7\n東京都,3', 'Japan'),
  [[13, 100], [1, 5], [27, 7], [13, 3]]
)

// a header row is skipped, full-width digits and thousands separators are accepted
assert.deepStrictEqual(
  datasetResource.parseCsv('都道府県,人口\n北海道,"5,224,614"\n沖縄県,１４６７４８０', 'Japan'),
  [[1, 5224614], [47, 1467480]]
)

// custom uploads drop rows with unknown ids or non-positive values
// and warn about them (header absent in node, so the warning falls back to console.warn)
const warnings = []
const originalWarn = console.warn
console.warn = message => warnings.push(message)
const custom = datasetResource.buildDatasetFromCustomCsv('Japan', '13,10\n99,5\n27,0\n大阪府,4')
console.warn = originalWarn
assert.strictEqual(custom.geography, 'Japan')
assert.deepStrictEqual(custom.data, [[13, 10], [27, 4]])
assert.strictEqual(warnings.length, 1)
assert(warnings[0].includes('"99"') && warnings[0].includes('"27"'))

// bundled datasets cover every prefecture
const population = datasetResource.getDatasetsByGeography('Japan')[0]
assert.strictEqual(population.data.length, 47)
assert(population.data.every(([id, value]) => typeof id === 'number' && value > 0))

console.log('DatasetResource tests passed')
