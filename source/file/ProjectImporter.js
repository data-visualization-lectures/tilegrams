class ProjectImporter {
    /**
     * Import project state from a JSON string
     * @param {String} jsonContent - The JSON string content of the project file
     * @returns {Object} Reconstructed state object
     */
    import(jsonContent) {
        let projectData
        try {
            projectData = JSON.parse(jsonContent)
        } catch (e) {
            throw new Error('Invalid JSON format')
        }

        // Basic validation
        if (
            !projectData.geography ||
            !projectData.metricPerTile ||
            !projectData.dataset ||
            !projectData.tiles
        ) {
            throw new Error('Invalid project file: missing required fields')
        }

        if (projectData.meta && projectData.meta.type !== 'tilegrams-project') {
            // Optional check, but good for safety
            // console.warn('Unknown project type')
        }

        return {
            tiles: projectData.tiles,
            dataset: { data: projectData.dataset },
            metricPerTile: projectData.metricPerTile,
            geography: projectData.geography,
        }
    }
}

export default new ProjectImporter()
