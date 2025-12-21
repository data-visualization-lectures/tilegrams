
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
    /*
    * Helper to generate UUID
    */
    _generateUUID() {
        if (window.crypto && window.crypto.randomUUID) {
            return window.crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Save a new project
     * @param {string} name - Project name
     * @param {Object} projectData - Project JSON object
     * @param {string} thumbnail - Base64 encoded thumbnail image
     */
    saveProject(name, projectData, thumbnail) {
        var self = this

        if (!window.supabase) {
            return Promise.reject(new Error('Supabase client not initialized'))
        }

        return this._getSession()
            .then(function (session) {
                if (!session) throw new Error('Please log in.')
                var user = session.user
                var projectId = self._generateUUID()

                var jsonPath = user.id + '/' + projectId + '.json'
                var thumbPath = user.id + '/' + projectId + '.png'

                var uploads = []

                // 1. Upload JSON
                var jsonBlob = new Blob([JSON.stringify(projectData)], { type: 'application/json' })
                uploads.push(
                    window.supabase.storage
                        .from('user_projects')
                        .upload(jsonPath, jsonBlob, {
                            contentType: 'application/json',
                            upsert: true
                        })
                )

                // 2. Upload Thumbnail
                if (thumbnail) {
                    var thumbBlob = self._dataURLToBlob(thumbnail)
                    if (thumbBlob) {
                        uploads.push(
                            window.supabase.storage
                                .from('user_projects')
                                .upload(thumbPath, thumbBlob, {
                                    contentType: 'image/png',
                                    upsert: true
                                })
                        )
                    }
                }

                return Promise.all(uploads).then(function (results) {
                    // Check for upload errors
                    results.forEach(function (res) {
                        if (res.error) throw res.error
                    })

                    // 3. Insert into DB
                    return window.supabase
                        .from('projects')
                        .insert({
                            id: projectId,
                            user_id: user.id,
                            name: name,
                            app_name: APP_NAME,
                            storage_path: jsonPath,
                            thumbnail_path: thumbnail ? thumbPath : null,
                            // created_at and updated_at are handled by default or trigger
                        })
                        .select() // data returned
                }).then(function (res) {
                    if (res.error) throw res.error
                    // res.data is array
                    return res.data[0]
                })
            })
    }

    /**
     * Load project data by ID
     * @param {string} projectId
     */
    loadProject(projectId) {
        if (!window.supabase) return Promise.reject(new Error('Supabase client missing'))

        return this._getSession().then(function (session) {
            if (!session) throw new Error('Please log in.')

            // 1. Get Metadata to find storage_path
            return window.supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single()
                .then(function (res) {
                    if (res.error) throw res.error
                    return res.data
                })
                // 2. Download JSON from Storage
                .then(function (projectMeta) {
                    if (!projectMeta.storage_path) throw new Error('Project file path not found.')
                    return window.supabase.storage
                        .from('user_projects')
                        .download(projectMeta.storage_path)
                })
                // 3. Read and Parse JSON
                .then(function (res) {
                    if (res.error) throw res.error
                    // res.data is a Blob
                    return new Promise(function (resolve, reject) {
                        var reader = new FileReader()
                        reader.onload = function () {
                            try {
                                resolve(JSON.parse(reader.result))
                            } catch (e) {
                                reject(e)
                            }
                        }
                        reader.onerror = reject
                        reader.readAsText(res.data)
                    })
                })
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
