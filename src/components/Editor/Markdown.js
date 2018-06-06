/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Markdown editor
 *
 * v0.1 - 2016-1-30
 * @author Bai Yu
 */

import React, { Component, PropTypes } from 'react'
import Editor from './'
import 'codemirror/mode/markdown/markdown'
import merge from 'lodash/merge'

const defaultOpts = {
  lineNumbers: true,
  readOnly: true,
  styleActiveLine: true,
  lineWrapping: true,
  tabSize: 2,
}

class MarkdownEditor extends Component {
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
    newOpts.mode = 'markdown'
    return (
      <Editor value={value} options={newOpts} title={!!title ? title : 'markdown'} parentId={parentId} onChange={this.onChangeFunc.bind(this)} callback={callback} />
    )
  }
}

export default MarkdownEditor