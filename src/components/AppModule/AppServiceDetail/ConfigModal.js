/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  ConfigModal
 *
 * v0.1 - 2016/10/27
 * @author ZhaoXueYu
 */

import React, { Component } from 'react'
import { Row, Col, Button, Modal, InputNumber, Icon } from 'antd'
import { connect } from 'react-redux'
import './style/ConfigModal.less'
import { DEFAULT_CONTAINER_RESOURCES, DEFAULT_CONTAINER_RESOURCES_MEMORY, DEFAULT_CONTAINER_RESOURCES_CPU } from '../../../../constants'
import { changeQuotaService } from '../../../actions/services'
import { getResources } from '../../../../kubernetes/utils'
import NotificationHandler from '../../../common/notification_handler'
import { isStorageUsed } from '../../../common/tools'
import {
  RESOURCES_MEMORY_MAX,
  RESOURCES_MEMORY_MIN,
  RESOURCES_MEMORY_STEP,
  RESOURCES_CPU_MAX,
  RESOURCES_CPU_STEP,
  RESOURCES_CPU_MIN,
  RESOURCES_CPU_DEFAULT,
  RESOURCES_DIY,
} from '../../../constants'
import { ENTERPRISE_MODE } from '../../../../configs/constants'
import { mode } from '../../../../configs/model'

const enterpriseFlag = ENTERPRISE_MODE == mode
const PRESET_MEMORY_ARRAY = [512, 1024, 2048, 4096, 8192]
const PRESET_CPU_ARRAY = [0.1, 0.2, 0.4, 1, 2]

function getCPUByMemory(memory) {
  switch (memory.toString()) {
    case '512':
      return '0.1'
    case '1024':
      return '0.2'
    case '2048':
      return '0.4'
    case '4096':
      return '1'
    case '8192':
      return '2'
    default:
      return RESOURCES_CPU_DEFAULT.toString()
  }
}
class ConfigModal extends Component {
  constructor(props) {
    super(props)
    this.selectComposeType = this.selectComposeType.bind(this)
    this.handleConfigOK = this.handleConfigOK.bind(this)
    this.handleConfigCancel = this.handleConfigCancel.bind(this)
    this.state = {
      composeType: parseInt(DEFAULT_CONTAINER_RESOURCES_MEMORY),
      haveRBDVolume: false,
      DIYMemory: RESOURCES_MEMORY_MIN,
      DIYCPU: RESOURCES_CPU_DEFAULT,
    }
  }

  componentWillReceiveProps(nextProps) {
    const { service, visible } = nextProps
    if (!service) {
      return
    }
    if (!visible) {
      return
    }
    if(nextProps.visible == this.props.visible) return
    let resources = service.spec.template.spec.containers[0].resources || DEFAULT_CONTAINER_RESOURCES
    let limits = resources.limits || DEFAULT_CONTAINER_RESOURCES.limits
    let requests = resources.requests || DEFAULT_CONTAINER_RESOURCES.requests
    let memory = limits.memory || DEFAULT_CONTAINER_RESOURCES.limits.memory
    let cpu = requests.cpu
    if (memory.indexOf('Gi') > -1) {
      memory = parseInt(memory) * 1024
    } else {
      memory = parseInt(memory)
    }
    if (!cpu) {
      cpu = getCPUByMemory(memory)
    } else {
      cpu = cpu.toString()
    }
    if (cpu.indexOf('m') > -1) {
      cpu = parseInt(cpu)
      cpu /= 1000
    } else {
      cpu = parseFloat(cpu)
    }

    let composeType = memory
    let composeCpu = cpu
    const memoryIndex = PRESET_MEMORY_ARRAY.indexOf(composeType)
    if ( memoryIndex < 0 || PRESET_CPU_ARRAY[memoryIndex] != cpu) {
      composeType = RESOURCES_DIY
    }
    this.setState({
      composeType,
      haveRBDVolume: isStorageUsed(service.spec.template.spec.volumes),
      DIYMemory: memory,
      DIYCPU: cpu,
    })
  }

  selectComposeType(type) {
    this.setState({
      composeType: type
    })
  }

  handleConfigOK() {
    const {
      parentScope,
      cluster,
      service,
      appName,
      loadServiceList,
      changeQuotaService
    } = this.props
    const { DIYMemory, DIYCPU } = this.state
    const { composeType } = this.state
    const serviceName = service.metadata.name
    let resources = getResources(composeType)
    if (composeType === RESOURCES_DIY) {
      resources = getResources(DIYMemory + 'Mi', DIYCPU * 1000 + 'm')
    }
    const { requests, limits } = resources
    let notification = new NotificationHandler()
    notification.spin(`服务 ${serviceName} 配置更改中...`)
    changeQuotaService(cluster, serviceName, { requests, limits }, {
      success: {
        func: (res) => {
          loadServiceList(cluster, appName)
          parentScope.setState({
            configModal: false
          })
          if(res.data.code == 200) {
            notification.close()
            notification.success(`服务 ${serviceName} 配置已成功更改`)
          } else {
            notification.close()
            notification.error(`更改服务 ${serviceName} 配置失败`)
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          notification.error(`更改服务 ${serviceName} 配置失败`)
        }
      }
    })
  }

  handleConfigCancel() {
    const { parentScope } = this.props
    parentScope.setState({
      configModal: false
    })
  }

  render() {
    const { service, visible } = this.props
    const { DIYMemory, DIYCPU } = this.state
    if (!visible) {
      return null
    }
    const { composeType } = this.state
    const modalFooter = [
      <Button key="back" type="ghost" size="large" onClick={this.handleConfigCancel}>
        取 消
      </Button>,
      <Button
        key="submit" type="primary" size="large" loading={this.state.loading}
        onClick={this.handleConfigOK}>
        保 存
      </Button>
    ]
    return (
      <Modal
        visible={visible}
        title="更改服务配置"
        onOk={this.handleConfigOK}
        onCancel={this.handleConfigCancel}
        width="600px"
        footer={modalFooter}>
        <div id="ConfigModal">
          <Row className="serviceName">
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>服务名称</Col>
            <Col className="itemBody" span={20}>
              {service.metadata.name}
            </Col>
          </Row>
          <Row>
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>
              选择配置
            </Col>
            <Col className="itemBody" span={20}>
              <div className="operaBox">
                <div className="selectCompose">
                  <ul className="composeList">
                    {/*<li className="composeDetail">
                      <Button type={composeType == 256 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(256)}>
                        <div className="topBox">
                          1X
                        </div>
                        <div className="bottomBox">
                          <span>256M&nbsp;内存</span><br />
                          <span>1CPU&nbsp;(共享)</span>
                        </div>
                      </Button>
                    </li>*/}
                    <li className="composeDetail">
                      <Button type={composeType == 512 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(512)}>
                        <div className="topBox">
                          2X
                        </div>
                        <div className="bottomBox">
                          <span>512M&nbsp;内存</span><br />
                          <span>1CPU&nbsp;(共享)</span>
                          <div className="triangle"></div>
                          <Icon type="check" />
                        </div>
                      </Button>
                    </li>
                    <li className="composeDetail">
                      <Button type={composeType == 1024 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(1024)}>
                        <div className="topBox">
                          4X
                        </div>
                        <div className="bottomBox">
                          <span>1GB&nbsp;内存</span><br />
                          <span>1CPU&nbsp;(共享)</span>
                          <div className="triangle"></div>
                          <Icon type="check" />
                        </div>
                      </Button>
                    </li>
                    <li className="composeDetail">
                      <Button type={composeType == 2048 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(2048)}>
                        <div className="topBox">
                          8X
                        </div>
                        <div className="bottomBox">
                          <span>2GB&nbsp;内存</span><br />
                          <span>1CPU&nbsp;(共享)</span>
                          <div className="triangle"></div>
                          <Icon type="check" />
                        </div>
                      </Button>
                    </li>
                    <li className="composeDetail">
                      <Button type={composeType == 4096 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(4096)}>
                        <div className="topBox">
                          16X
                        </div>
                        <div className="bottomBox">
                          <span>4GB&nbsp;内存</span><br />
                          <span>1CPU</span>
                          <div className="triangle"></div>
                          <Icon type="check" />
                        </div>
                      </Button>
                    </li>
                    <li className="composeDetail">
                      <Button type={composeType == 8192 ? "primary" : "ghost"}
                        onClick={() => this.selectComposeType(8192)}>
                        <div className="topBox">
                          32X
                        </div>
                        <div className="bottomBox">
                          <span>8GB&nbsp;内存</span><br />
                          <span>2CPU</span>
                          <div className="triangle"></div>
                          <Icon type="check" />
                        </div>
                      </Button>
                    </li>
                    {
                      enterpriseFlag &&
                      <li className="composeDetail DIY">
                        <div
                          className={
                            composeType == RESOURCES_DIY
                            ? "btn ant-btn-primary"
                            : "btn ant-btn-ghost"
                          }
                          onClick={()=> this.selectComposeType(RESOURCES_DIY)}>
                          <div className="topBox">
                            自定义
                        </div>
                          <div className="bottomBox">
                            <div className="DIYKey">
                              <InputNumber
                                onChange={(value) => this.setState({DIYMemory: value})}
                                value={parseInt(DIYMemory)}
                                defaultValue={RESOURCES_MEMORY_MIN}
                                step={RESOURCES_MEMORY_STEP}
                                min={RESOURCES_MEMORY_MIN}
                                max={RESOURCES_MEMORY_MAX} />
                              MB&nbsp;内存
                            </div>
                            <div className="DIYKey">
                              <InputNumber
                                onChange={(value) => this.setState({DIYCPU: value})}
                                value={DIYCPU}
                                defaultValue={DIYCPU}
                                step={RESOURCES_CPU_STEP}
                                min={RESOURCES_CPU_MIN}
                                max={RESOURCES_CPU_MAX}/>
                              核 CPU
                            </div>
                            <div className="triangle"></div>
                            <Icon type="check" />
                          </div>
                        </div>
                      </li>
                    }
                  </ul>
                  <div style={{ clear: "both" }}></div>
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col style={{ color: '#a0a0a0', textAlign: 'left', marginTop: '20px' }}>
              Tips: 重新选择配置 , 保存后系统将重启该服务的所有实例。{this.state.haveRBDVolume ? '此服务已挂载存储卷，不支持滚动更新，服务会有短暂不可用时间！' : ' 将进行滚动升级。'}
            </Col>
          </Row>
        </div>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const {
    changeQuotaService,
  } = state.services
  return {
    changeQuota: changeQuotaService
  }
}

export default connect(mapStateToProps, {
  changeQuotaService,
})(ConfigModal)
