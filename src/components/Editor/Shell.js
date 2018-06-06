/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Shell editor
 *
 * v0.1 - 2017-06-29
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import Editor from './'
import 'codemirror/mode/shell/shell'
import merge from 'lodash/merge'

const defaultOpts = {
  lineNumbers: true,
  readOnly: true,
  mode: 'shell',
  styleActiveLine: true,
  lineWrapping: true,
  tabSize: 2,
}

class ShellEditor extends Component {
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
    newOpts.mode = 'shell'
    return (
      <Editor value={value} options={newOpts} title={!!title ? title : 'Shell'} parentId={parentId} onChange={this.onChangeFunc.bind(this)} callback={callback} />
    )
  }
}

export default ShellEditor