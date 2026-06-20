const REQUIRED_FIELDS = ['geography', 'metricPerTile', 'dataset', 'tiles']

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

function validateProjectData(projectData) {
  if (!projectData || typeof projectData !== 'object') {
    throw new Error('Invalid project file: expected an object')
  }

  const missingFields = REQUIRED_FIELDS.filter(field => !hasOwn(projectData, field))
  if (missingFields.length) {
    throw new Error(`Invalid project file: missing required fields: ${missingFields.join(', ')}`)
  }

  if (typeof projectData.geography !== 'string' || projectData.geography.length === 0) {
    throw new Error('Invalid project file: geography must be a non-empty string')
  }

  if (typeof projectData.metricPerTile !== 'number' || isNaN(projectData.metricPerTile)) {
    throw new Error('Invalid project file: metricPerTile must be a number')
  }

  if (!Array.isArray(projectData.dataset)) {
    throw new Error('Invalid project file: dataset must be an array')
  }

  if (!Array.isArray(projectData.tiles)) {
    throw new Error('Invalid project file: tiles must be an array')
  }
}

class ProjectImporter {
  /**
   * Import project state from a JSON string
   * @param {String} jsonContent - The JSON string content of the project file
   * @returns {Object} Reconstructed state object
   */
  import(jsonContent) {
    let projectData
    try {
      projectData = typeof jsonContent === 'string'
        ? JSON.parse(jsonContent)
        : jsonContent
    } catch (e) {
      throw new Error('Invalid JSON format')
    }

    validateProjectData(projectData)

    if (projectData.meta && projectData.meta.type !== 'tilegrams-project') {
      // Optional check, but good for safety
      // console.warn('Unknown project type')
    }

    return {
      tiles: projectData.tiles,
      dataset: {data: projectData.dataset},
      metricPerTile: projectData.metricPerTile,
      geography: projectData.geography,
    }
  }
}

export default new ProjectImporter()
