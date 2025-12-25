import { version } from '../../package.json'

class ProjectExporter {
    /**
     * Export the current state as a JSON string
     * @param {Array} tiles - The current tiles
     * @param {Array} dataset - The current dataset
     * @param {Number} metricPerTile - The resolution
     * @param {String} geography - The current geography name
     * @returns {String} JSON string
     */
    export(tiles, dataset, metricPerTile, geography) {
        const projectData = {
            meta: {
                version,
                timestamp: new Date().toISOString(),
                type: 'tilegrams-project',
            },
            geography,
            metricPerTile,
            dataset,
            tiles: tiles.map(tile => ({
                id: tile.id,
                position: tile.position,
                tilegramValue: tile.tilegramValue,
            })),
        }
        return JSON.stringify(projectData, null, 2)
    }
}

export default new ProjectExporter()
