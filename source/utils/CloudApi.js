
const API_BASE_URL = 'https://api.dataviz.jp'
const APP_NAME = 'tilegrams'

class CloudApi {
    _getSession() {
        if (!window.supabase) return Promise.resolve(null)
        return window.supabase.auth.getSession()
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
    }

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
                var body = JSON.stringify({
                    name: name,
                    app_name: APP_NAME,
                    data: projectData,
                    thumbnail: thumbnail,
                })

                return fetch(API_BASE_URL + '/api/projects', {
                    method: 'POST',
                    headers: headers,
                    body: body,
                })
            })
            .then(function (response) {
                return self._handleResponse(response)
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
