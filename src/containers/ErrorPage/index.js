/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Error page
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import './style/ErrorPage.less'
import error404PNG from '../../assets/img/error404.png'

class ErrorPage extends Component {
  constructor(props) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { code, errorMessage } = nextProps
    const { type } = errorMessage || {}
    const _errorMessage = this.props.errorMessage || {}
    if (code === this.props.code && type === _errorMessage.type) {
      return false
    }
    return true
  }

  renderErrorMessage() {
    const { code, errorMessage } = this.props
    const { error } = errorMessage
    let { message } = error
    if (message && message.message) {
      message = message.message
    }
    return (
      <div>
        <h1>{`${code} error`}</h1>
        <h2>{message}</h2>
      </div>
    )
  }

  render() {
    const { code, errorMessage } = this.props
    const { error } = errorMessage
    let { message } = error
    if (message && message.message) {
      message = message.message
    }
    return (
      <div id='NotFoundErrorPageBox' className='CommonSecondContent'>
        <p className='codeTitle'>{code}</p>
        <img className='errorImg' src={error404PNG} />
        <p>{message}</p>
        <div>
          <a href='/'>
            <div className='backBtn'>返回首页</div>
          </a>
        </div>
      </div>
    )
  }
}

ErrorPage.propTypes = {
  code: PropTypes.number.isRequired,
  errorMessage: PropTypes.object,
}

ErrorPage.defaultProps = {
  code: 404,
  errorMessage: {
    error: {
      message: "Page not found"
    }
  },
}

export default ErrorPage