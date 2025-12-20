
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
            .then(function (data) {
                // API returns { projects: [...] }
                if (data && Array.isArray(data.projects)) {
                    return data.projects
                }
                return []
            })
    }

    /*
   * Helper to convert Base64 DataURL to Blob
   */
    _dataURLToBlob(dataURL) {
        try {
            var BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
                var parts = dataURL.split(',');
                var contentType = parts[0].split(':')[1];
                var raw = decodeURIComponent(parts[1]);
                return new Blob([raw], { type: contentType });
            }
            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;
            var uInt8Array = new Uint8Array(rawLength);
            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            return new Blob([uInt8Array], { type: contentType });
        } catch (e) {
            console.error('Failed to convert DataURL to Blob', e)
            return null
        }
    }

    /**
   * Save a new project
   * @param {string} name - Project name
   * @param {Object} projectData - Project JSON object
   * @param {string} thumbnail - Base64 encoded thumbnail image
   */
    saveProject(name, projectData, thumbnail) {
        var self = this
        var sessionUser = null
        var savedProject = null

        return this._getSession()
            .then(function (session) {
                if (!session) throw new Error('Please log in.')
                sessionUser = session.user
                return {
                    'Authorization': 'Bearer ' + session.access_token,
                    'Content-Type': 'application/json'
                }
            })
            .then(function (headers) {
                // Do NOT send thumbnail in JSON body (backend doesn't support it)
                var body = JSON.stringify({
                    name: name,
                    app_name: APP_NAME,
                    data: projectData,
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
            .then(function (data) {
                // API returns { project: {...} }
                savedProject = data.project
                if (!savedProject || !savedProject.id) {
                    throw new Error('Project ID not returned from API')
                }

                // Continue to thumbnail upload without fallback
                return savedProject
            })
            .then(function (project) {
                savedProject = project
                if (!savedProject || !savedProject.id) {
                    throw new Error('Project saved but failed to retrieve ID for thumbnail upload.')
                }

                // Step 4: Upload thumbnail
                if (thumbnail && window.supabase && sessionUser) {
                    var blob = self._dataURLToBlob(thumbnail)
                    if (!blob) return Promise.resolve(null)

                    var filePath = sessionUser.id + '/' + savedProject.id + '.png'
                    return window.supabase.storage
                        .from('user_projects')
                        .upload(filePath, blob, {
                            contentType: 'image/png',
                            upsert: true
                        })
                }
                return Promise.resolve(null)
            })
            .then(function (uploadResult) {
                if (uploadResult && uploadResult.error) {
                    console.warn('Thumbnail upload failed:', uploadResult.error)
                }
                return savedProject
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
   * Get signed URL for project thumbnail
   * @param {string} projectId
   */
    getThumbnailUrl(projectId) {
        var self = this
        return this._getSession().then(function (session) {
            if (!session || !window.supabase) return Promise.resolve(null)
            var path = session.user.id + '/' + projectId + '.png'
            return window.supabase.storage
                .from('user_projects')
                .createSignedUrl(path, 60 * 60) // 1 hour validity
                .then(function (result) {
                    // result: { data: { signedUrl: ... }, error: ... }
                    if (result.error) {
                        // console.warn('Failed to get thumbnail URL:', result.error)
                        return null
                    }
                    return result.data.signedUrl
                })
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
