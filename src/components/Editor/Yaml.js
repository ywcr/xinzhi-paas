/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Yaml editor
 *
 * v0.1 - 2016-11-30
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import Editor from './'
import 'codemirror/mode/yaml/yaml'
import merge from 'lodash/merge'

let yaml = require('js-yaml')

const menusText = defineMessages({
  unknownReason: {
    id: 'Editor.Error.unknownReason',
    defaultMessage: '未知错误',
  },
})

const defaultOpts = {
  lineNumbers: true,
  readOnly: true,
  mode: 'yaml',
  styleActiveLine: true,
  lineWrapping: true,
  tabSize: 2,
}

//for js-yaml settting
const YamlDumpOpts = {
    noRefs: true,
    lineWidth: 5000
}


function matchYamlError(e, index, scope, height) {
  //this function for format yaml error
  //and we will change it to intl
  const { formatMessage } = scope.props.intl;
  let markExist = true;
  let reasonExist = true;
  if(!Boolean(e.mark)) {
    //sometime the mark is undefined
    markExist = false;
  }
  if(!Boolean(e.reason)) {
    //sometime the reason is undefined
    reasonExist = false;
    return formatMessage(menusText.unknownReason)
  }
  let errorBody = {
    index: (index + 1),
    reason: e.reason
  }
  if(markExist) {
    errorBody.column = e.mark.column;
    errorBody.line = e.mark.line + 1;
  }
  return errorBody;
}

class YamlEditor extends Component {
  constructor(props) {
    super(props)
    this.onChangeFunc = this.onChangeFunc.bind(this)
    this.state = {
      errorList: [],
      currentErrorIndex: 0
    }
  }
  
  componentWillReceiveProps() {
    this.setState({
      errorList: []
    })
  }

  onChangeFunc(e) {
    //this function for user input new words
    //and we will test the text is right or not
    //and the new words will be callback from the props
    //sometimes the code may not only one and they were split by '---' 
    const { callback } = this.props;
    let { errorList, currentErrorIndex } = this.state;
    const _this = this;
    let newErrorList = [];
    if(e.indexOf('---') > -1) {
      //multi codes
      let codeList = e.split('---');
      codeList.map((item, index) => {      
        let height = 0;
        for(let item of e) {
          if(item == '\n') {
            height++;
          }
        }
        try {
          yaml.safeLoad(item)
        } catch(error) {
          newErrorList.push(matchYamlError(error, index, _this, height))
        }
      })
    } else {
      //only one
      try {
        yaml.safeLoad(e)
      } catch(error) {
        let height = 0;
        for(let item of e) {
          if(item == '\n') {
            height++;
          }
        }
        newErrorList.push(matchYamlError(error, 0, _this, height))
      }
    }
    callback(e);
    //the error num changed
    if(newErrorList.length != errorList.length && newErrorList.length > 0) {
      currentErrorIndex = newErrorList.length - 1;
      this.setState({
        currentErrorIndex: currentErrorIndex,
      });
    }
    if(newErrorList.length == 0) {
      currentErrorIndex = 0;
      this.setState({
        currentErrorIndex: currentErrorIndex,
      });
    }
    this.setState({
      errorList: newErrorList,
    });
  }
  

  render() {
    const { value, options, parentId, callback, title } = this.props
    const scope = this
    const newOpts = merge({}, defaultOpts, options)
    newOpts.mode = 'yaml'
    return (
      <Editor value={value} scope={scope} options={newOpts} title={ !!title ? title : 'Yaml'} parentId={parentId} currentErrorIndex={this.state.currentErrorIndex}
        callback={callback} onChange={this.onChangeFunc.bind(this)} errorList={this.state.errorList} />
    )
  }
}

export default connect()(injectIntl(YamlEditor, {
  withRef: true,
}));