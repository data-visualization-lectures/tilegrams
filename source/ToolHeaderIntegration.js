import {getQueryParam} from './utils'
import {installHeaderProcessingToasts} from './ToolHeaderMessages'
import {
  buildHeaderConfig,
  buildProjectConfig,
} from './ToolHeaderConfig'

const HEADER_SELECTOR = 'dataviz-tool-header'

function configureProjectManagement(header, dependencies, projectState) {
  header.setProjectConfig(buildProjectConfig(dependencies, projectState))
}

function configureHeaderButtons(header, dependencies, projectState) {
  header.setConfig(buildHeaderConfig(header, dependencies, projectState))
}

function loadProjectFromQueryParam(header, loadProject) {
  const projectId = getQueryParam('project_id')
  if (!projectId) {
    return
  }

  header.loadProject(projectId)
    .then(projectData => {
      loadProject(projectData)
    })
    .catch(err => {
      console.error('Cloud load failed', err)
    })
}

export function configureToolHeader(header, dependencies, projectState) {
  installHeaderProcessingToasts(header)
  configureProjectManagement(header, dependencies, projectState)
  configureHeaderButtons(header, dependencies, projectState)
  loadProjectFromQueryParam(header, dependencies.loadProject)
}

export default function installToolHeader(dependencies) {
  const projectState = {id: null, name: null}

  customElements.whenDefined(HEADER_SELECTOR).then(() => {
    const configureCurrentHeader = () => {
      const header = document.querySelector(HEADER_SELECTOR)
      if (header) {
        configureToolHeader(header, dependencies, projectState)
        return true
      }
      return false
    }

    if (!configureCurrentHeader()) {
      const headerCheckInterval = setInterval(() => {
        if (configureCurrentHeader()) {
          clearInterval(headerCheckInterval)
        }
      }, 100)

      // Safety timeout after 10 seconds
      setTimeout(() => clearInterval(headerCheckInterval), 10000)
    }
  })
}
