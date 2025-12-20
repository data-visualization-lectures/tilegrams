import React from 'react'
import cloudApi from '../utils/CloudApi'

export default class CloudLoadModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            projects: [],
            isLoading: true,
            error: null,
        }
    }

    componentDidMount() {
        this.fetchProjects()
    }

    fetchProjects() {
        cloudApi.listProjects()
            .then(data => {
                this.setState({
                    projects: data,
                    isLoading: false,
                })
                // Fetch thumbnails for each project
                data.forEach(project => {
                    cloudApi.getThumbnailUrl(project.id).then(url => {
                        if (url) {
                            this.setState(prevState => {
                                const newProjects = prevState.projects.map(p => {
                                    if (p.id === project.id) {
                                        return Object.assign({}, p, { thumbnailUrl: url })
                                    }
                                    return p
                                })
                                return { projects: newProjects }
                            })
                        }
                    })
                })
            })
            .catch(err => {
                this.setState({
                    error: err.message,
                    isLoading: false,
                })
            })
    }

    handleDelete(e, projectId) {
        e.stopPropagation()
        if (!window.confirm('本当にこのプロジェクトを削除しますか？')) return

        cloudApi.deleteProject(projectId)
            .then(() => {
                this.setState(prevState => ({
                    projects: prevState.projects.filter(p => p.id !== projectId),
                }))
            })
            .catch(err => {
                alert('削除に失敗しました: ' + err.message)
            })
    }

    render() {
        const { projects, isLoading, error } = this.state

        let content
        if (isLoading) {
            content = <div>読み込み中...</div>
        } else if (error) {
            content = <div style={{ color: 'red' }}>エラー: {error}</div>
        } else if (projects.length === 0) {
            content = <div>保存されたプロジェクトはありません。</div>
        } else {
            content = (
                <div className='project-grid'>
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className='project-card'
                            onClick={() => this.props.onLoad(project.id)}
                        >
                            <div className='thumbnail-container'>
                                {project.thumbnailUrl ? (
                                    <img src={project.thumbnailUrl} alt={project.name} />
                                ) : (
                                    <div className='no-thumbnail'>No Image</div>
                                )}
                            </div>
                            <div className='card-footer'>
                                <div className='project-name'>{project.name}</div>
                                <div className='project-date'>
                                    {new Date(project.updated_at).toLocaleString()}
                                </div>
                                <div
                                    className='delete-btn'
                                    onClick={(e) => this.handleDelete(e, project.id)}
                                >
                                    削除
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        return (
            <div className='modal-cloud' onClick={(e) => e.stopPropagation()}>
                <div className='modal-content'>
                    <h3>クラウドから読み込む</h3>
                    {content}
                    <div className='buttons'>
                        <button className='cancel' onClick={this.props.onCancel}>
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

CloudLoadModal.propTypes = {
    onLoad: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
}
