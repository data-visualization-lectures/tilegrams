const assert = require('assert')

const projectExporter = require('../source/file/ProjectExporter').default
const projectImporter = require('../source/file/ProjectImporter').default
const version = require('../source/version').default

const tiles = [
  {
    id: '01',
    position: {x: 1, y: 2},
    tilegramValue: 10,
  },
  {
    id: '02',
    position: {x: 3, y: 4},
    tilegramValue: 5,
  },
]
const dataset = [['01', 10], ['02', 5]]
const metricPerTile = 0
const geography = 'United States'

const exported = projectExporter.export(tiles, dataset, metricPerTile, geography)
const projectData = JSON.parse(exported)

assert.strictEqual(projectData.meta.version, version)
assert.strictEqual(projectData.meta.type, 'tilegrams-project')
assert.strictEqual(typeof projectData.meta.timestamp, 'string')
assert.strictEqual(projectData.geography, geography)
assert.strictEqual(projectData.metricPerTile, metricPerTile)
assert.deepStrictEqual(projectData.dataset, dataset)
assert.deepStrictEqual(projectData.tiles, tiles)

const imported = projectImporter.import(exported)
assert.deepStrictEqual(imported, {
  tiles,
  dataset: {data: dataset},
  metricPerTile,
  geography,
})

console.log('ProjectExporter tests passed')
