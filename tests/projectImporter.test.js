const assert = require('assert')

const projectImporter = require('../source/file/ProjectImporter').default

function buildProject(overrides) {
  return Object.assign({
    geography: 'United States',
    metricPerTile: 1,
    dataset: [['01', 10]],
    tiles: [
      {
        id: '01',
        position: {x: 1, y: 2},
        tilegramValue: 10,
      },
    ],
  }, overrides)
}

function assertThrowsMessage(fn, message) {
  assert.throws(fn, error => {
    assert.strictEqual(error.message, message)
    return true
  })
}

const importedFromString = projectImporter.import(JSON.stringify(buildProject()))
assert.deepStrictEqual(importedFromString, {
  tiles: [
    {
      id: '01',
      position: {x: 1, y: 2},
      tilegramValue: 10,
    },
  ],
  dataset: {
    data: [['01', 10]],
  },
  metricPerTile: 1,
  geography: 'United States',
})

const importedWithZeroMetric = projectImporter.import(buildProject({
  metricPerTile: 0,
}))
assert.strictEqual(importedWithZeroMetric.metricPerTile, 0)

assertThrowsMessage(
  () => projectImporter.import('{'),
  'Invalid JSON format'
)

assertThrowsMessage(
  () => projectImporter.import(null),
  'Invalid project file: expected an object'
)

assertThrowsMessage(
  () => projectImporter.import({geography: 'United States'}),
  'Invalid project file: missing required fields: metricPerTile, dataset, tiles'
)

assertThrowsMessage(
  () => projectImporter.import(buildProject({geography: ''})),
  'Invalid project file: geography must be a non-empty string'
)

assertThrowsMessage(
  () => projectImporter.import(buildProject({metricPerTile: '1'})),
  'Invalid project file: metricPerTile must be a number'
)

assertThrowsMessage(
  () => projectImporter.import(buildProject({dataset: {}})),
  'Invalid project file: dataset must be an array'
)

assertThrowsMessage(
  () => projectImporter.import(buildProject({tiles: {}})),
  'Invalid project file: tiles must be an array'
)

console.log('ProjectImporter tests passed')
