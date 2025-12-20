
const API_BASE_URL = 'https://api.dataviz.jp'
const APP_NAME = 'tilegrams'

class CloudApi {
    async _getSession() {
        if (!window.supabase) return null
        const { data } = await window.supabase.auth.getSession()
        return data.session
    }

    async _getHeaders() {
        const session = await this._getSession()
        if (!session) {
            throw new Error('Please log in to use cloud features.')
        }
        return {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        }
    }

    /*
     * Helper to handle API response
     */
    async _handleResponse(response) {
        if (!response.ok) {
            let errorMessage = response.statusText
            try {
                const errorData = await response.json()
                errorMessage = errorData.error || errorMessage
            } catch (e) {
                // ignore json parse error
            }
            throw new Error(`API Error: ${response.status} - ${errorMessage}`)
        }
        return response.json()
    }

    /**
     * List projects for this app
     */
    async listProjects() {
        const headers = await this._getHeaders()
        const response = await fetch(`${API_BASE_URL}/api/projects?app=${APP_NAME}`, {
            method: 'GET',
            headers,
        })
        return this._handleResponse(response)
    }

    /**
     * Save a new project
     * @param {string} name - Project name
     * @param {Object} projectData - Project JSON object
     */
    async saveProject(name, projectData) {
        const headers = await this._getHeaders()
        const body = JSON.stringify({
            name,
            app_name: APP_NAME,
            data: projectData,
        })

        const response = await fetch(`${API_BASE_URL}/api/projects`, {
            method: 'POST',
            headers,
            body,
        })
        return this._handleResponse(response)
    }

    /**
     * Load project data by ID
     * @param {string} projectId
     */
    async loadProject(projectId) {
        const headers = await this._getHeaders()
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            method: 'GET',
            headers,
        })
        return this._handleResponse(response)
    }

    /**
     * Delete a project
     * @param {string} projectId
     */
    async deleteProject(projectId) {
        const headers = await this._getHeaders()
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            method: 'DELETE',
            headers,
        })
        if (response.status === 204) return true // No content
        return this._handleResponse(response)
    }
}

export default new CloudApi()
