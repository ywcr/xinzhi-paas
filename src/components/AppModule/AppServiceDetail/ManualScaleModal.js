/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Manual scale modal
 *
 * v0.1 - 2016/10/27
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import './style/ManualScaleModal.less'
import { Row, Col, Slider, InputNumber, Modal, Icon, Button, Spin, message } from 'antd'
import { INSTANCE_MAX_NUM } from '../../../../constants'
import { manualScaleService } from '../../../actions/services'
import NotificationHandler from '../../../common/notification_handler'
import { isStorageUsed } from '../../../common/tools'

class ManualScaleModal extends Component {
  constructor(props) {
    super(props)
    this.handleRealNum = this.handleRealNum.bind(this)
    this.handleModalOK = this.handleModalOK.bind(this)
    this.handleModalCancel = this.handleModalCancel.bind(this)
    this.state = {
      realNum: 1,
      scalable: false,
    }
  }

  handleRealNum(value) {
    this.setState({
      realNum: value
    })
  }
  componentWillReceiveProps(nextProps) {
    const { service, visible } = nextProps
    if (!service) {
      return
    }
    if (!visible || visible == this.props.visible) {
      return
    }
    this.setState({
      realNum: service.spec.replicas,
      scalable: !isStorageUsed(service.spec.template.spec.volumes,service.spec.template.metadata.labels.diskType)
    })
  }

  handleModalOK() {
    const {
      parentScope,
      manualScaleService,
      cluster,
      appName,
      loadServiceList,
      service,
    } = this.props
    const { realNum } = this.state
    const serviceName = service.metadata.name
    let notification = new NotificationHandler()
    notification.spin(`服务 ${serviceName} 伸缩中...`)
    manualScaleService(cluster, serviceName, { num: realNum }, {
      success: {
        func: () => {
          const { serviceList } = parentScope.state
          serviceList.map(item => {
            if (item.metadata.name === serviceName) {
              item.status.phase = 'Scaling'
            }
          })
          parentScope.setState({
            manualScaleModalShow: false,
            serviceList
          })
          notification.close()
          notification.success(`服务 ${serviceName} 已成功伸缩到 ${realNum} 个实例`)
          loadServiceList(cluster, appName)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          notification.error(`服务 ${serviceName} 伸缩失败`)
        }
      }
    })
  }

  handleModalCancel() {
    const { parentScope } = this.props
    console.log('cancel')
    parentScope.setState({
      manualScaleModalShow: false
    })
  }

  render() {
    const { service, visible } = this.props
    if (!visible) {
      return null
    }
    /*if(autoScale.isFetching) {
      return <div className="loadingBox">
          <Spin size="large"></Spin>
        </div>
    }*/
    const { realNum } = this.state
    const modalFooter = [
      <Button
        key="back" type="ghost" size="large"
        onClick={this.handleModalCancel}>
        取 消
      </Button>,
      <Button
        key="submit" type="primary"
        size="large" loading={this.state.loading}
        disabled={!this.state.scalable || this.props.disableScale}
        onClick={this.handleModalOK} >
        保 存
      </Button>
    ]
    return (
      <Modal
        visible={visible}
        title="手动水平扩展"
        onCancel={this.handleModalCancel}
        footer={modalFooter} >
        <div id="ManualScaleModal">
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>服务名称</Col>
            <Col className="itemBody" span={20}>{service.metadata.name}</Col>
          </Row>
          <Row className="cardItem">
            <Col className="itemTitle" span={4} style={{ textAlign: 'left' }}>
              实际数量
              {/*<Tooltip title="默认最大10个实例，专业版及企业用户可申请更大配额"><Icon type="question-circle-o" /></Tooltip>*/}
            </Col>
            <Col className="itemBody" span={20}>
              <Row>
                <Col span={12}>
                  <Slider
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    defaultValue={service.spec.replicas}
                    onChange={this.handleRealNum}
                    value={realNum} />
                </Col>
                <Col span={12}>
                  <InputNumber
                    min={1}
                    max={INSTANCE_MAX_NUM}
                    style={{ marginLeft: '16px' }}
                    value={realNum}
                    onChange={this.handleRealNum}
                    /> 个
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col style={{ color: '#a0a0a0', textAlign: 'left', marginTop: '20px' }}>
              Tips: {this.state.scalable ? '实例数量调整 , 保存后系统将调整实例数量至设置预期. (若自动伸缩开启, 则无法手动扩展)' :
                     '已挂载存储卷的服务不允许进行水平扩展'}
            </Col>
          </Row>
        </div>
      </Modal>
    )
  }
}

ManualScaleModal.propTypes = {
  parentScope: PropTypes.object.isRequired,
  cluster: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  loadServiceList: PropTypes.func.isRequired,
  manualScaleService: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {

  // let autoScale = state.services.autoScale
  // if(!autoScale) {
  //   autoScale = {
  //     isFetching: true
  //   }
  // }
  // return {
  //   autoScale
  // }
  return props
}

export default connect(mapStateToProps, {
  manualScaleService,
})(ManualScaleModal)