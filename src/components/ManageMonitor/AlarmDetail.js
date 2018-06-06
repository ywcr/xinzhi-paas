/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Alarm Detail component
 *
 * v0.1 - 2017-3-20
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Row, Col, Card ,Radio, Button, Table, Modal, Spin, notification } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import cloneDeep from 'lodash/cloneDeep'
import { formatDate, isEmptyObject } from '../../common/tools'
import NotificationHandler from '../../common/notification_handler'
import './style/AlarmDetail.less'
import Title from '../Title'
import { getAlertSetting, getSettingList, updateSendEmail, deleteRule } from '../../actions/alert'
const RadioGroup = Radio.Group


class AlarmDetail extends Component {
  constructor(props) {
    super(props)
    this.loadData = this.loadData.bind(this)
    this.state = {
      sendEmail: 2, // no send eamil
      delBtn: true,
      selectCheckbox: [], // default table selected item
      ruleName: {},
    }
  }
  loadData() {
    const id = this.props.params.id
    const { getAlertSetting, cluster, getSettingList } = this.props
    getAlertSetting(cluster.clusterID, {
      strategy: id
    })
    getSettingList(cluster.clusterID, {
      strategyID: id
    }, true)
  }
  componentWillMount() {
    this.loadData()
  }
  formatStatus(text){
    if (text ==1) {
      return <span className="running"><i className="fa fa-circle" /> 启用</span>
    }
    if (text == 0) {
      return <span className="stop"><i className="fa fa-circle" /> 停用</span>
    }
    if (text ==3) {
      return <span className="stop"><i className="fa fa-circle" /> 忽略</span>
    }
    return <span className="padding"><i className="fa fa-circle" /> 告警</span>
  }
  rowClick(record, ins) {
    let selectCheckbox = cloneDeep(this.state.selectCheckbox)
    if (selectCheckbox.indexOf(record.key) > -1) {
      selectCheckbox.splice(selectCheckbox.indexOf(record.key), 1)
    } else {
      selectCheckbox.push(record.key)
    }
    selectCheckbox.sort()
    this.setState({selectCheckbox})
  }
  calcuTime(time) {
    let sym = '分钟'
    time = time / 60
    if(time / 60 > 1) {
      sym = '小时'
      time = time / 60
    }
    return time + sym
  }
  refreshPage() {
    const id = this.props.params.id
    const { getAlertSetting, cluster } = this.props
    getAlertSetting(cluster.clusterID, {
      strategy: id
    })
  }
  Deleterule(settingData) {
    const selectCheckbox = this.state.selectCheckbox
    if(selectCheckbox.length>=settingData.length){
      notification['info']({
        description: '至少要保持有一项规则存在',
      });
      return
    }
    this.setState({deleteModal: true})
  }
  deleteRecords() {
    const noti = new NotificationHandler()
    const selectCheckbox = this.state.selectCheckbox
    if(!selectCheckbox || selectCheckbox.length == 0) {
      noti.error('请选择要删除的规则')
      return
    }
    noti.spin('规则删除中')
    const { deleteRule, cluster, leftSetting } = this.props
    deleteRule(cluster.clusterID, {
      strategyID: leftSetting.strategyID,
      ruleNames: selectCheckbox.join(',')
    }, {
      success: {
        func: () => {
          noti.close()
          noti.success('规则删除成功')
          this.refreshPage()
          this.setState({
            deleteModal: false,
            selectCheckbox: [],
            delBtn: true
          })
        },
        isAsync: true
      },
      failed: {
        fun: () => {
          noti.close()
          noti.error('规则删除失败')
          this.setState({
            deleteModal: false
          })
        }
      }
    })

  }
  changeEmail(e, receivers) {
    if(e ==1 && receivers =='') {
      this.setState({alarmModal: true})
      return
    }
    this.setState({sendEmail: e})
    const id = this.props.params.id
    const { leftSetting, getSettingList, cluster, updateSendEmail} = this.props
    if(leftSetting) {
      const noti = new NotificationHandler()
      if(leftSetting.sendMail == e) {
        noti.error(`策略已处于${e == 0 ? '不发送邮件状态' : '发送邮件状态'}`)
        return
      }
      noti.spin('更新中')
      updateSendEmail(cluster.clusterID, {
        strategies:[{
          strategyID: leftSetting.strategyID,
          sendEmail: e
        }]
      }, {
        success: {
          func: () => {
            noti.close()
            noti.success('策略更新成功')
            getSettingList(cluster.clusterID, {
              strategyID: id
            }, false)
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            noti.close()
            noti.error('策略更新失败')
          }
        }
      })
    }
  }
  render() {
    const { isFetching } = this.props.setting
    if(isFetching) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    let settingData = this.props.setting
    let { leftSetting, location} = this.props
    const editSetting = cloneDeep(leftSetting)
    editSetting.sendEmail = 1 // is send email
    if(leftSetting.isEmptyObject) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    const columns = [
      {
        title: '监控项',
        dataIndex: 'type',
        key:'type'
      }, {
        title: '条件',
        dataIndex: 'operation',
        key:'operation',
      },
      {
        title: '阈值',
        dataIndex: 'threshold',
        key:'threshold',
      },
      {
        title: '启用时间',
        dataIndex: 'createTime',
        key:'createTime',
        sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
      },
      {
        title: '触发次数',
        dataIndex: 'recordCount',
        key:'recordCount',
      },
    ];
    const strategyName = location.query.name

    const _this = this
    const rowSelection = {
      selectedRowKeys: this.state.selectCheckbox,
      onChange(selectedRowKeys, selectedRows) {
        const change = selectedRows.map(row => {
          return row.key
        })
        _this.setState({
          selectCheckbox: selectedRowKeys
        })
      },
    };
    return (
      <div id="AlarmDetail">
        <QueueAnim type="right" className="AlarmDetail">
          <div className="ant-row" key="AlarmDetail" style={{marginBottom: 10, height: 50, paddingTop: 10}}>
            <Title title="告警设置" />
            <span className="back" onClick={()=> browserHistory.goBack()}><span className="backjia"></span><span className="btn-back">返回</span></span>
            <span className="titleName">{strategyName}</span>
          </div>
          <Row gutter={16} className="details">
            <Col className="Basicattributes" span="7">
              <Card style={{paddingBottom:'20px'}}>
                <div className="title">基本属性</div>
                <div className="baseAttr"><span className="keys">策略名称：</span><div className="ant-radio-group">{leftSetting.strategyName}</div></div>
                <div className="baseAttr"><span className="keys">类型：</span>{leftSetting.targetType == '1' ? '节点' : '服务'}</div>
                <div className="baseAttr"><span className="keys">告警对象：</span>{leftSetting.targetName}</div>
                <div className="baseAttr"><span className="keys">状态：</span>{this.formatStatus(leftSetting.statusCode)}</div>
               <div className="baseAttr"><span className="keys">监控周期：</span>{this.calcuTime(leftSetting.repeatInterval)}</div>
                <div className="baseAttr">
                  <span className="keys">是否发送：</span>
                    <RadioGroup disabled value={leftSetting.sendEmail} onChange={(e)=> this.changeEmail(e.target.value, leftSetting.receivers)}>
                    <Radio key="a" value={1}>是</Radio>
                    <Radio key="b" value={0}>否</Radio>
                  </RadioGroup>
                </div>
                <div className="baseAttr"><span className="keys">最后修改人：</span>{leftSetting.updater}</div>
                <div className="baseAttr"><span className="keys">通知列表：</span><div className="ant-radio-group">{leftSetting.receivers}</div></div>
                <div className="baseAttr"><span className="keys">创建时间：</span>{formatDate(leftSetting.createTime)}</div>
              </Card>
              <Card style={{marginTop:'15px',paddingBottom:'50px'}}>
                <div className="title">租赁信息</div>
                <div className="baseAttr" style={{color: '#2DB7F5'}}>本服务暂不收费！</div>
              </Card>
            </Col>
            <Col span="17">
              <Card style={{paddingBottom: 50}}>
                <div className="title">规则</div>
                <div style={{margin: '20px 30px'}}>
                  <div className="alertRow">提示：当任意规则满足条件时，该策略属于触发状态！</div>
                </div>
                <div style={{margin: '20px 30px'}}>
                <Button type="primary" size="large" onClick={() => this.refreshPage()}><i className="fa fa-refresh" /> 刷新</Button>
                  <Button icon="delete" size="large" style={{marginLeft: 8}} disabled={this.state.selectCheckbox.length <= 0} onClick={()=> this.Deleterule(settingData)} type="ghost">删除</Button>
                </div>
                <Table className="strategyTable" rowSelection={rowSelection} columns={columns}
                onRowClick={(record, index)=> this.rowClick(record, index)}
                dataSource={settingData} pagination={false} style={{padding:'0 30px'}}/>
              </Card>
            </Col>
          </Row>
          <Modal title="删除策略" visible={this.state.deleteModal}
            onCancel={()=> this.setState({deleteModal: false})}
            onOk={()=> this.deleteRecords()}
          >
            <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>策略删除后将不再发送邮件告警，是否确定删除？</div>
          </Modal>
        </QueueAnim>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultSettingDetail = {
    isFetching: false,
    result: {
      data:[]
    }
  }
  let isFetching = false
  let { getSetting, settingList } = state.alert
  if(!getSetting || !getSetting.result) {
    getSetting = defaultSettingDetail
  }
  isFetching = getSetting.isFetching
  if(getSetting.result && getSetting.result.data.length > 0){
    getSetting.result.data.forEach(item => {
      item.createTime = formatDate(item.createTime)
    })
  }
  const defaultSetting = {
    isFetching: false,
    result: {
      data: {
        strategys: [],
        total: 0
      }
    }
  }
  let leftSetting = {
    isEmptyObject: true
  }
  if(!settingList) {
     settingList = defaultSetting
  }
  if(settingList.isFetching) {
    isFetching = settingList.isFetching
  } else {
    if(settingList.result && settingList.result.data.strategys) {
      settingList.result.data.strategys.some(item => {
        if(item.strategyID == props.params.id) {
          leftSetting = item
          return true
        }
        return false
      })
    } else {
      if(settingList.result && settingList.result.data && settingList.result.data.strategys ) {
        leftSetting = settingList.result.data.strategys[0]
      } else {
        leftSetting = {}
      }
    }
  }
  let setting = getSetting.result.data
  if(!Array.isArray(setting)) setting = []
  return {
    cluster,
    isFetching,
    leftSetting,
    setting
  }
}

export default connect(mapStateToProps, {
  getAlertSetting,
  getSettingList,
  updateSendEmail,
  deleteRule
})(AlarmDetail)
