import React, { Component, PropTypes } from 'react'

export default class Toast extends Component {
    render() {
        const { message, visible, type } = this.props
        const className = `toast ${visible ? 'visible' : ''} ${type || 'info'}`

        return (
            <div className={className}>
                {message}
            </div>
        )
    }
}

Toast.propTypes = {
    message: PropTypes.string,
    visible: PropTypes.bool,
    type: PropTypes.string, // 'info', 'success', 'error'
}
