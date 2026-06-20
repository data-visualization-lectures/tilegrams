import {
  getQueryParam,
  installHeaderProcessingToasts,
  showProcessingToast,
} from './utils'

const HEADER_SELECTOR = 'dataviz-tool-header'

function showSaveProjectModal(header, dependencies, projectState) {
  showProcessingToast('保存準備中です')
  const geography = dependencies.getGeography()
  const projectData = JSON.parse(dependencies.buildProjectJson(geography))
  header.showSaveModal({
    name: projectState.name,
    data: projectData,
    thumbnailDataUri: dependencies.getThumbnailDataUri(),
    existingProjectId: projectState.id,
  })
}

function configureProjectManagement(header, dependencies, projectState) {
  header.setProjectConfig({
    appName: 'tilegrams',
    onProjectLoad: (projectData) => {
      dependencies.loadProject(projectData)
    },
    onProjectSave: (meta) => {
      projectState.id = meta.id
      projectState.name = meta.name
    },
  })
}

function configureHeaderButtons(header, dependencies, projectState) {
  header.setConfig({
    logo: {
      type: 'text',
      text: 'Tilegrams',
      textClass: 'font-bold text-lg text-white',
    },
    buttons: [
      {
        label: 'プロジェクトの保存',
        action: () => {
          showSaveProjectModal(header, dependencies, projectState)
        },
        align: 'right',
      },
      {
        label: 'プロジェクトの読込',
        action: () => {
          header.showLoadModal()
        },
        align: 'right',
      },
      {
        label: 'エクスポート',
        align: 'right',
        type: 'dropdown',
        items: [
          {
            label: 'TopoJSON',
            action: () => {
              showProcessingToast('書き出し中です')
              dependencies.exportTopoJson(dependencies.getGeography())
            },
          },
          {
            label: 'SVG',
            action: () => {
              showProcessingToast('書き出し中です')
              dependencies.exportSvg(dependencies.getGeography())
            },
          },
          {
            label: 'PNG',
            action: () => {
              showProcessingToast('書き出し中です')
              dependencies.exportPng()
            },
          },
        ],
      },
    ],
  })
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
