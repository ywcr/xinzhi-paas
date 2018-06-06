/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/26
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import './style/RollingUpdateModal.less'
import { DEFAULT_REGISTRY } from '../../../constants'
import { Button, Card, Menu, Icon, Tooltip, Row, Col, Select, InputNumber, Alert, Modal, Input } from 'antd'
import { loadRepositoriesTags } from '../../../actions/harbor'
import { rollingUpdateService } from '../../../actions/services'
import { connect } from 'react-redux'
import NotificationHandler from '../../../common/notification_handler'

const Option = Select.Option
const OptGroup = Select.OptGroup

function loadTags(props, imageFullName) {
  const { loadRepositoriesTags, registry } = props
  loadRepositoriesTags(registry, imageFullName)
}

class RollingUpdateModal extends Component {
  constructor(props) {
    super(props)
    this.handleOK = this.handleOK.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleTagChange = this.handleTagChange.bind(this)
    this.state = {
      containers: [],
      rollingInterval: false
    }
  }

  componentWillReceiveProps(nextProps) {
    const { service, visible } = nextProps
    if (!service) {
      return
    }
    /*if (visible) {
      return
    }*/
    const containers = service.spec.template.spec.containers
    containers.map((container) => {
      var image = container.image
      // console.log(typeof (image), image.indexOf('100.125.0.198:20202/enncloud'))

      if (image.indexOf('100.125.0.198:20202/enncloud') != -1) {
        // debugger
        let str = '100.125.0.198:20202/enncloud'
         image = container.image.split(str)[1];
        // let aa = ':'
        // let str_ = str_after.split(aa)[0]
        // var fullName = str_after.split(aa)[0]
        var fullName = image.substring(0,image.indexOf(':') )

        let tagIndex = image.indexOf(':')
        if (tagIndex < 0) {
          tagIndex = image.length
        }
        let tag = image.substr(tagIndex + 1)
        let imageSrc = str+image.substring(0, tagIndex)
        container.imageObj = {
          tag,
          imageSrc,
          fullName,
        }
      }else{
        let { image } = container
        let tagIndex = image.indexOf(':')
        if(tagIndex < 0) {
          tagIndex = image.length
        }
        let tag = image.substr(tagIndex + 1)
        let imageSrc = image.substring(0, tagIndex)
        let fullName = image.substring(image.indexOf('/') + 1, tagIndex)
        container.imageObj = {
          tag,
          imageSrc,
          fullName,
        }

      }
    })
    this.setState({
      containers
    })
    if (!visible || visible === this.props.visible) {
      return
    }
    this.setState({
      intervalTime: service.spec.minReadySeconds
    })
    containers.map((container) => {
      let { imageObj } = container
      loadTags(nextProps, imageObj.fullName)
    })
  }

  handleCancel() {
    const { parentScope } = this.props
    parentScope.setState({
      rollingUpdateModalShow: false
    })
  }

  handleOK() {
    /*const { parentScope } = this.props
    parentScope.setState({
      rollingUpdateModalShow: false
    })*/
    const {
      parentScope,
      cluster,
      service,
      appName,
      loadServiceList,
      rollingUpdateService
    } = this.props
    const { containers } = this.state
    const serviceName = service.metadata.name
    const targets = {}
    let count = 0
    containers.forEach((container) => {
      if (!container.targetTag) {
        count++
        return
      }
      // console.log()
      // debugger

      targets[container.name] = `${container.imageObj.imageSrc}:${container.targetTag}`
      return false
    })
    let notification = new NotificationHandler()
    if (count === containers.length) {
      notification.error('请至少为一个容器指定目标版本')
      return
    }
    //统一间隔时间
    const intervalTime = this.state.intervalTime
    if (!intervalTime) {
      notification.error('请填写 2~60s 间隔时间')
      return
    }
    if (!/[0-9]+/.test(intervalTime)) {
      notification.error('请填入 2~60 之间的数字')
      return
    }
    if (intervalTime < 2) {
      notification.error('请填入 2~60 之间的数字')
      return
    }
    const hide = notification.spin('正在保存中...', 0)


    notification.spin(`服务 ${serviceName} 灰度升级中...`)
    rollingUpdateService(cluster, serviceName, { targets, interval: parseInt(intervalTime) }, {
      success: {
        func: () => {
          notification.close()
          loadServiceList(cluster, appName)
          setTimeout(function () {
            debugger
            notification.success(`服务 ${serviceName} 灰度升级已成功开启`)
          }, 300)
          parentScope.setState({
            rollingUpdateModalShow: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          setTimeout(function () {
            notification.error(`服务 ${serviceName} 开启灰度升级失败`)
          }, 300)
        }
      }
    })
  }

  handleTagChange(value, containerName) {
    const { containers } = this.state
    containers.map((container) => {
      if (container.name === containerName) {
        container.targetTag = value
      }
    })
    this.setState({
      containers
    })
  }
  getintervalTime(e, time) {
    const { containers } = this.state
    if (containers.length < 2 || this.state.rollingInterval === false) {
      this.setState({
        intervalTime: e.target.value
      })
      return
    }
    containers.forEach(container => {
      if (container.name == e.target.value) {
        container.intervalTime = time
      }
    })
  }
  switchType(c) {
    this.setState({
      rollingInterval: c
    })
  }
  render() {
    const { service, visible } = this.props
    if (!visible) {
      return null
    }
    const { containers } = this.state
    if (!service) {
      return <div></div>
    }
    const minReadySeconds = service.spec.minReadySeconds
    const isOnly = containers.length > 1 ? false : true
    // const containers = service.spec.template.spec.containers
    return (
      <Modal
        visible={visible}
        title="灰度升级" onOk={this.handleOK} onCancel={this.handleCancel}
        footer={[
          <Button
            key="back" type="ghost" size="large" onClick={this.handleCancel}>
            取 消
          </Button>,
          <Button
            key="submit" type="primary" size="large" loading={this.state.loading}
            onClick={this.handleOK}>
            保 存
          </Button>
        ]}>
        <div id="RollingUpdateModal">
          {
            containers.length > 1 && (
              <Alert message="提示: 检测到您的服务实例为k8s多容器 (Pod内多个容器) 实例,选择灰度升级时请确认下列服务实例中要升级的容器" type="info" />
            )
          }
          <Row className="serviceName">
            <Col className="itemTitle" span={4} style={{ textAlign: "right" }}>服务名称：</Col>
            <Col className="itemBody" span={10}>
              {service.metadata.name}
            </Col>
            <Col span={3} className="itemBody"></Col>
          </Row>
          {containers.map((item, index) => {
            let start = item.image.lastIndexOf(":")
            let tag, image
            if (start >= 0) {
              tag = item.image.substring(start + 1)
              image = item.image.substring(0, start)
            } else {
              image = item.image
              tag = "latest"
            }
            let show = image
            if (image.length > 40) show = image.substring(0, 40) + "..."
            return (
              <div key={item.name}>
                <Row style={{ marginBottom: "10px" }}>
                  <Col span={4} style={{ textAlign: "right" }}>镜像版本：</Col>
                  <Tooltip title={item.image}>
                    <Col className="rollingUpdateUpdateItem" span={15}>{`${show}：${tag}`}</Col>
                  </Tooltip>
                </Row>
                <Row style={{ marginBottom: "10px" }} >
                  <Col span={4}></Col>
                  <Col className="rollingUpdateUpdateItem" span={10}>
                    <Select
                      placeholder="请选择目标版本"
                      value={item.targetTag}
                      onChange={(value) => this.handleTagChange(value, item.name)}
                      className='rollingUpdateUpdateItemSelect'
                    >
                      <OptGroup label="请选择目标版本">
                        {
                          this.props[item.imageObj.fullName] && this.props[item.imageObj.fullName].tag && this.props[item.imageObj.fullName].tag.map((tag) => {
                            let disabled = false
                            if (tag === item.imageObj.tag) {
                              disabled = true
                            }
                            return (
                              <Option value={tag} disabled={disabled}>
                                {tag}
                              </Option>
                            )
                          })
                        }
                      </OptGroup>
                    </Select>
                  </Col>
                  <Col span={6}>
                    {index > 0 ? "" : <Input placeholder="更新间隔时间 2~60s" defaultValue={minReadySeconds ? minReadySeconds : 0} onChange={(e) => { this.getintervalTime(e, item.name) }} />}
                  </Col>
                  <Col span={1} >{index > 0 ? "" : <span style={{ marginLeft: "2px", lineHeight: "28px" }}>&nbsp;秒</span>}</Col>
                </Row>
              </div>
            )
          })}
        </div>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const {
    imageTags
  } = state.harbor
  let targetImageTag = imageTags[DEFAULT_REGISTRY] || {}
  return {
    registry: DEFAULT_REGISTRY,
    ...targetImageTag
  }
}

export default connect(mapStateToProps, {
  loadRepositoriesTags,
  rollingUpdateService
})(RollingUpdateModal)
