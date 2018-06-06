/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: config map setting for service
 *
 * v0.1 - 2017-05-18
 * @author Zhangpc
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  Form, Collapse, Row, Col, Icon, Input, Select, Radio, Tooltip, Button, Checkbox
} from 'antd'
import { loadConfigGroup, configGroupName } from '../../../../actions/configs'
import './style/ConfigMapSetting.less'

const Panel = Collapse.Panel
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const PATH_REG = /^\/[a-zA-Z0-9_\-\.\/]*$/

const ConfigMapSetting = React.createClass({
  componentWillMount() {
    const { currentCluster, loadConfigGroup } = this.props
    loadConfigGroup(currentCluster.clusterID)
    // this.renderConfigMapItem();
  },
  onIsWholeDirChange(keyValue, currentConfigGroup, e) {
    if (!currentConfigGroup) {
      return
    }
    const value = e.target.value
    e.target.checked = value
    this.handleSelectAll(keyValue, currentConfigGroup, e)
  },
  onConfigGroupChange(keyValue, value) {
    const { form, configGroupList } = this.props
    const { getFieldValue } = form
    const configMapIsWholeDir = getFieldValue(`configMapIsWholeDir${keyValue}`)
    if (configMapIsWholeDir) {
      const currentConfigGroup = this.getConfigGroupByName(configGroupList, value)
      this.handleSelectAll(keyValue, currentConfigGroup, { target: { checked: true } })
    }
  },
  getConfigGroupByName(configGroupList, configGroupName) {
    let currentConfigGroup
    configGroupList.every(item => {
      if (item.name === configGroupName) {
        currentConfigGroup = item
        return false
      }
      return true
    })
    return currentConfigGroup
  },
  checkPath(keyValue, rule, value, callback) {
    if (!value) {
      return callback()
    }
    if (!PATH_REG.test(value)) {
      return callback('请输入正确的路径')
    }
    const { getFieldValue } = this.props.form
    const configMapKeys = getFieldValue('configMapKeys') || []
    let error
    configMapKeys.every(_key => {
      if (_key.deleted) {
        return true
      }
      const _keyValue = _key.value
      const configMapMountPath = getFieldValue(`configMapMountPath${_keyValue}`)
      if (_keyValue !== keyValue && value === configMapMountPath) {
        error = '已填写过该路径'
        return false
      }
      return true
    })
    callback(error)
  },
  renderConfigMapItem(key) {
    const { form, configGroupList } = this.props
    const { getFieldProps, getFieldValue } = form
    const keyValue = key.value
    const configMapSubPathValuesKey = `configMapSubPathValues${keyValue}`
    if (key.deleted) {
      // fix issue http://jira.paas.enncloud.cn/browse/CRYSTAL-4604
      // set configMapSubPathValues to unrequired
      getFieldProps(configMapSubPathValuesKey)
      return
    }
    const configMapMountPathKey = `configMapMountPath${keyValue}`
    const configMapIsWholeDirKey = `configMapIsWholeDir${keyValue}`
    const configGroupNameKey = `configGroupName${keyValue}`
    const configGroupName = getFieldValue(configGroupNameKey)
    const configMapIsWholeDir = getFieldValue(configMapIsWholeDirKey)
    const currentConfigGroup = this.getConfigGroupByName(configGroupList, configGroupName)
    let configMapSubPathOptions = []
    if (currentConfigGroup) {
      configMapSubPathOptions = currentConfigGroup.configs.map(config => {
        return {
          label: config.name,
          value: config.name,
        }
      })
    }
    const configMapMountPathProps = getFieldProps(configMapMountPathKey, {
      rules: [
        { required: true, message: '请填写挂载目录' },
        { validator: this.checkPath.bind(this, keyValue) },
      ],
    })
    const configMapIsWholeDirProps = getFieldProps(configMapIsWholeDirKey, {
      rules: [
        { required: true, message: '请选择覆盖方式' },
      ],
      onChange: this.onIsWholeDirChange.bind(this, keyValue, currentConfigGroup),
    })
    const configGroupNameProps = getFieldProps(configGroupNameKey, {
      rules: [
        { required: true, message: '请选择配置组' }
      ],
      onChange: this.onConfigGroupChange.bind(this, keyValue)
    })
    const configMapSubPathValuesProps = getFieldProps(configMapSubPathValuesKey, {
      rules: [
        { required: true, message: '请选择配置组文件' }
      ],
    })
    return (
      <Row className="configMapItem" key={`configMapItem${keyValue}`}>
        <Col span={5}>
          <FormItem>
            <Input size="default" placeholder="挂载目录，例如：/App" {...configMapMountPathProps} />
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem>
            <RadioGroup {...configMapIsWholeDirProps}>
              <Radio key="severalFiles" value={false}>
                挂载若干配置文件&nbsp;
                <Tooltip width="200px" title="镜像内该目录『同名文件』会给覆盖，修改配置文件需『重启容器』来生效">
                  <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                </Tooltip>
              </Radio>
              <Radio key="wholeDir" value={true}>
                挂载整个配置组&nbsp;
                <Tooltip width="200px" title="镜像内该目录『所有文件』会被覆盖，支持『不重启容器』5 min 左右生效（含增、删、改配置文件）。">
                  <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                </Tooltip>
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span={5}>
          <FormItem>
            <Select size="default" placeholder="请选择配置组" {...configGroupNameProps}>
              {
                configGroupList.map(item => {
                  const disabled = !item.configs || item.configs.length < 1
                  const title = disabled ? '未包含任何配置文件' : item.name
                  return (
                    <Option
                      key={item.name}
                      title={title}
                      disabled={disabled}
                    >
                      {item.name}
                    </Option>
                  )
                })
              }
            </Select>
          </FormItem>
        </Col>
        <Col span={5}>
          {
            !currentConfigGroup
            ? <FormItem>请选择配置组</FormItem>
            : (
              <div>
                <FormItem>
                  <Checkbox
                    onChange={this.handleSelectAll.bind(this, keyValue, currentConfigGroup)}
                    checked={this.getSelectAllChecked(keyValue, currentConfigGroup)}
                    disabled={configMapIsWholeDir}
                  >
                    全选
                  </Checkbox>
                </FormItem>
                <FormItem>
                  <CheckboxGroup
                    {...configMapSubPathValuesProps}
                    options={configMapSubPathOptions}
                    disabled={configMapIsWholeDir}
                  />
                  <div className="clearBoth"></div>
                </FormItem>
              </div>
            )
          }
        </Col>
        <Col span={4}>
          <Tooltip title="删除">
            <Button
              className="deleteBtn"
              type="dashed"
              size="small"
              onClick={this.removeConfigMapKey.bind(this, keyValue)}
            >
              <Icon type="delete" />
            </Button>
          </Tooltip>
        </Col>
      </Row>
    )
  },
  addConfigMapKey() {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, validateFields } = form
    let configMapKeys = getFieldValue('configMapKeys') || []
    const validateFieldsKeys = []
    configMapKeys.forEach(key => {
      if (key.deleted) {
        return
      }
      const keyValue = key.value
      validateFieldsKeys.push(`configMapMountPath${keyValue}`)
      validateFieldsKeys.push(`configMapIsWholeDir${keyValue}`)
      validateFieldsKeys.push(`configGroupName${keyValue}`)
      const configGroupName = getFieldValue(`configGroupName${keyValue}`)
      if (configGroupName) {
        validateFieldsKeys.push(`configMapSubPathValues${keyValue}`)
      }
    })
    validateFields(validateFieldsKeys, (errors, values) => {
      if (!!errors) {
        return
      }
      const key = configMapKeys[configMapKeys.length - 1] || { value: 0 }
      let uid = key.value
      uid ++
      configMapKeys = configMapKeys.concat({ value: uid })
      setFieldsValue({
        configMapKeys,
        [`configMapIsWholeDir${uid}`]: false,
      })
    })
  },
  removeConfigMapKey(keyValue) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue, resetFields } = form
    const configMapKeys = getFieldValue('configMapKeys') || []
    setFieldsValue({
      configMapKeys: configMapKeys.map(_key => {
        if (_key.value === keyValue) {
          // magic code ！
          // 必须通过标记的方式删除，否则 redux store 中的 fields 与 form 中的 fields 无法一一对应
          _key.deleted = true
          resetFields([
            `configMapMountPath${keyValue}`,
            `configMapIsWholeDir${keyValue}`,
            `configGroupName${keyValue}`,
            `configMapSubPathValues${keyValue}`,
          ])
        }
        return _key
      })
    })
  },
  handleSelectAll(keyValue, currentConfigGroup, e) {
    const { form } = this.props
    const { setFieldsValue } = form
    const checked = e.target.checked
    if (!checked) {
      setFieldsValue({
        [`configMapSubPathValues${keyValue}`]: [],
      })
      return
    }
    const configMapSubPathValues = currentConfigGroup.configs.map(config => config.name)
    setFieldsValue({
      [`configMapSubPathValues${keyValue}`]: configMapSubPathValues,
    })
  },
  getSelectAllChecked(keyValue, currentConfigGroup) {
    const { form } = this.props
    const { getFieldValue } = form
    const allConfigMapSubPathValues = currentConfigGroup.configs.map(config => config.name)
    const configMapSubPathValues = getFieldValue(`configMapSubPathValues${keyValue}`) || []
    if (allConfigMapSubPathValues.length === configMapSubPathValues.length) {
      return true
    }
    return false
  },
  render() {
    const { formItemLayout, form } = this.props
    const { getFieldValue } = form
    const configMapKeys = getFieldValue('configMapKeys') || []
    const header = (
      <div className="headerBox">
        <Row className="configBoxHeader" key="header">
          <Col span={formItemLayout.labelCol.span} className="headerLeft" key="left">
            <div className="line"></div>
            <span className="title">配置管理</span>
          </Col>
          <Col span={formItemLayout.wrapperCol.span} key="right">
            <div className="desc">满足您统一管理某些服务配置文件的需求，即：不用停止服务，即可变更多个容器内的配置文件</div>
          </Col>
        </Row>
      </div>
    )
    return (
      <div id="configMapConfigureService">
        <Collapse>
          <Panel header={header}>
            <Row>
              <Col span={formItemLayout.labelCol.span} className="formItemLabel">
                配置目录
              </Col>
              <Col span={formItemLayout.wrapperCol.span}>
                <div className="configMap">
                  <Row className="configMapHeader">
                    <Col span={5}>
                      挂载目录
                    </Col>
                    <Col span={5}>
                      覆盖方式
                    </Col>
                    <Col span={5}>
                      配置组
                    </Col>
                    <Col span={5}>
                      配置文件
                    </Col>
                    <Col span={4}>
                      操作
                    </Col>
                  </Row>
                  <div className="configMapBody">
                    {configMapKeys.map(this.renderConfigMapItem)}
                    <span className="addConfigMap" onClick={this.addConfigMapKey}>
                      <Icon type="plus-circle-o" />
                      <span>添加配置目录</span>
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const { entities, configReducers } = state
  const { current } = entities
  const { cluster } = current
  const { configGroupList } = configReducers
  return {
    currentCluster: cluster,
    configGroupList: (configGroupList[cluster.clusterID] ? configGroupList[cluster.clusterID].configGroup : []),
  }
}

export default connect(mapStateToProps, {
  loadConfigGroup,
  configGroupName,
})(ConfigMapSetting)
