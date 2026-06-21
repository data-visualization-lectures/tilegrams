function showHeaderMessage(message, type = 'info', duration = 5000) {
  const header = document.querySelector('dataviz-tool-header')
  if (header && typeof header.showMessage === 'function') {
    header.showMessage(message, type, duration)
    return true
  }
  return false
}

function showProcessingToast(message) {
  showHeaderMessage(message || '処理中です', 'info', 5000)
}

function showErrorToast(message) {
  if (!showHeaderMessage(message || '処理に失敗しました', 'error', 8000)) {
    console.error(message)
  }
}

function showWarningToast(message) {
  if (!showHeaderMessage(message || '確認が必要です', 'warning', 8000)) {
    console.warn(message)
  }
}

const NATIVE_PROJECT_PROCESSING_TOASTS_FLAG = '__dvzNativeProjectProcessingToasts'
const PROCESSING_TOASTS_INSTALLED_FLAG = '__dvzProcessingToastsInstalled'

function installHeaderProcessingToasts(header) {
  if (
    !header ||
    header[NATIVE_PROJECT_PROCESSING_TOASTS_FLAG] === '1' ||
    header[PROCESSING_TOASTS_INSTALLED_FLAG] === '1'
  ) {
    return
  }

  if (typeof header.showLoadModal === 'function') {
    const originalShowLoadModal = header.showLoadModal.bind(header)
    header.showLoadModal = (...args) => {
      showProcessingToast('プロジェクト一覧を読み込み中です')
      return originalShowLoadModal(...args)
    }
  }

  if (typeof header.loadProject === 'function') {
    const originalLoadProject = header.loadProject.bind(header)
    header.loadProject = (...args) => {
      showProcessingToast('プロジェクトを読み込み中です')
      return originalLoadProject(...args)
    }
  }

  if (typeof header.saveProject === 'function') {
    const originalSaveProject = header.saveProject.bind(header)
    header.saveProject = (...args) => {
      showProcessingToast('プロジェクトを保存中です')
      return originalSaveProject(...args)
    }
  }

  header[PROCESSING_TOASTS_INSTALLED_FLAG] = '1'
}

module.exports = {
  showProcessingToast,
  showErrorToast,
  showWarningToast,
  installHeaderProcessingToasts,
}
