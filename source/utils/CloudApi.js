
const API_BASE_URL = window.datavizApiUrl || 'https://api.dataviz.jp'
const APP_NAME = 'tilegrams'

class CloudApi {
    _getSession() {
        if (!window.datavizSupabase) return Promise.resolve(null)
        return window.datavizSupabase.auth.getSession()
            .then(function (result) {
                return result.data.session
            })
    }

    _getHeaders() {
        return this._getSession()
            .then(function (session) {
                if (!session) {
                    throw new Error('Please log in to use cloud features.')
                }
                return {
                    'Authorization': 'Bearer ' + session.access_token,
                    'Content-Type': 'application/json',
                }
            })
    }

    /*
     * Helper to handle API response
     */
    _handleResponse(response) {
        if (!response.ok) {
            return response.json().then(function (errorData) {
                var errorMessage = errorData.error || response.statusText
                throw new Error('API Error: ' + response.status + ' - ' + errorMessage)
            }).catch(function (e) {
                // In case json parse fails or previous throw
                if (e.message.indexOf('API Error') === 0) throw e
                throw new Error('API Error: ' + response.status + ' - ' + response.statusText)
            })
        }
        return response.json()
    }

    /**
     * List projects for this app
     */
    listProjects() {
        var self = this
        return this._getHeaders()
            .then(function (headers) {
                return fetch(API_BASE_URL + '/api/projects?app=' + APP_NAME, {
                    method: 'GET',
                    headers: headers,
                })
            })
            .then(function (response) {
                return self._handleResponse(response)
            })
            .then(function (data) {
                // API returns { projects: [...] }
                if (data && Array.isArray(data.projects)) {
                    return data.projects
                }
                return []
            })
    }


    /**
   * Save a new project
   * @param {string} name - Project name
   * @param {Object} projectData - Project JSON object
   * @param {string} thumbnail - Base64 encoded thumbnail image
   */


    /**
     * Save a new project
     * @param {string} name - Project name
     * @param {Object} projectData - Project JSON object
     * @param {string} thumbnail - Base64 encoded thumbnail image
     */
    saveProject(name, projectData, thumbnail) {
        var self = this
        return this._getHeaders()
            .then(function (headers) {
                var body = {
                    name: name,
                    app_name: APP_NAME,
                    data: projectData,
                    thumbnail: thumbnail, // Base64 string
                }

                return fetch(API_BASE_URL + '/api/projects', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body)
                })
            })
            .then(function (response) {
                return self._handleResponse(response)
            })
            .then(function (data) {
                // Return the project object (or whatever the UI expects, previously it waited for the promise)
                return data.project
            })
    }

    /**
     * Load project data by ID
     * @param {string} projectId
     */
    loadProject(projectId) {
        var self = this
        return this._getHeaders()
            .then(function (headers) {
                return fetch(API_BASE_URL + '/api/projects/' + projectId, {
                    method: 'GET',
                    headers: headers,
                })
            })
            .then(function (response) {
                return self._handleResponse(response)
            })
        // The API returns the JSON content directly as the body
        // However, _handleResponse calls response.json().
        // If the API returns the project JSON directly, then that is what we get.
        // That matches the requirement: "API が JSON データ自体をレスポンスボディとして返す"
    }

    /**
   * Get signed URL for project thumbnail
   * @param {string} projectId
   */
    getThumbnailUrl(projectId) {
        var self = this
        return this._getHeaders()
            .then(function (headers) {
                return fetch(API_BASE_URL + '/api/projects/' + projectId + '/thumbnail', {
                    method: 'GET',
                    headers: headers,
                })
            })
            .then(function (response) {
                if (!response.ok) {
                    // return null if not found or other error, consistent with previous behavior
                    return null
                }
                return response.blob()
            })
            .then(function (blob) {
                if (!blob) return null
                return URL.createObjectURL(blob)
            })
    }

    /**
     * Delete a project
     * @param {string} projectId
     */
    deleteProject(projectId) {
        var self = this
        return this._getHeaders()
            .then(function (headers) {
                return fetch(API_BASE_URL + '/api/projects/' + projectId, {
                    method: 'DELETE',
                    headers: headers,
                })
            })
            .then(function (response) {
                if (response.status === 204) return true // No content
                return self._handleResponse(response)
            })
    }
}

export default new CloudApi()
