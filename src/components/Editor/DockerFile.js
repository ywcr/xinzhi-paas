/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * DockerFile editor
 *
 * v0.1 - 2016-11-30
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import Editor from './'
import 'codemirror/mode/dockerfile/dockerfile'
import merge from 'lodash/merge'

const defaultOpts = {
  lineNumbers: true,
  readOnly: true,
  mode: 'dockerfile',
  styleActiveLine: true,
  lineWrapping: true,
  tabSize: 2,
}

class DockerFileEditor extends Component {
  constructor(props) {
    super(props)
  }
  onChangeFunc(e) {
    const { callback } = this.props;
    callback(e);
  }
  render() {
    const { value, options, parentId, callback, title } = this.props
    const newOpts = merge({}, defaultOpts, options)
    newOpts.mode = 'dockerfile'
    return (
      <Editor value={value} options={newOpts} title={!!title ? title : 'Dockerfile'} parentId={parentId} onChange={this.onChangeFunc.bind(this)} callback={callback} />
    )
  }
}

export default DockerFileEditor