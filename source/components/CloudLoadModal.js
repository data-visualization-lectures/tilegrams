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
                <ul className='project-list'>
                    {projects.map(project => (
                        <li key={project.id} onClick={() => this.props.onLoad(project.id)}>
                            <div>
                                <div className='project-name'>{project.name}</div>
                                <div className='project-date'>
                                    {new Date(project.updated_at).toLocaleString()}
                                </div>
                            </div>
                            <div
                                className='delete-btn'
                                onClick={(e) => this.handleDelete(e, project.id)}
                            >
                                削除
                            </div>
                        </li>
                    ))}
                </ul>
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
