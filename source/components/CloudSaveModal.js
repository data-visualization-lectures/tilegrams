import React from 'react'

export default class CloudSaveModal extends React.Component {
    constructor(props) {
        super(props)
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const defaultName = `${year}-${month}-${day} ${hours}:${minutes}`

        this.state = {
            name: defaultName,
            isSaving: false,
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSave = this.handleSave.bind(this)
    }

    handleChange(event) {
        this.setState({ name: event.target.value })
    }

    handleSave() {
        if (!this.state.name) return
        this.setState({ isSaving: true })
        this.props.onSave(this.state.name).catch(() => {
            this.setState({ isSaving: false })
        })
    }

    render() {
        return (
            <div className='modal-cloud' onClick={(e) => e.stopPropagation()}>
                <div className='modal-content'>
                    <h3>クラウドに保存</h3>
                    <p>プロジェクト名を入力してください。</p>
                    <input
                        type='text'
                        placeholder='Project Name'
                        value={this.state.name}
                        onChange={this.handleChange}
                        disabled={this.state.isSaving}
                    />
                    <div className='buttons'>
                        <button
                            className='cancel'
                            onClick={this.props.onCancel}
                            disabled={this.state.isSaving}
                        >
                            キャンセル
                        </button>
                        <button
                            className='save'
                            onClick={this.handleSave}
                            disabled={!this.state.name || this.state.isSaving}
                        >
                            {this.state.isSaving ? '保存中...' : '保存'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

CloudSaveModal.propTypes = {
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
}
