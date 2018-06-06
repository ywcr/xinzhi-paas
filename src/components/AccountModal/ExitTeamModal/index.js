/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/9
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Modal,Alert,Icon,Button,Row,Col,Input } from 'antd'
import NotificationHandler from '../../../common/notification_handler'
import { browserHistory } from 'react-router'

let message = (
  <Row className="tip">
    <Col span={2} className='tipIcon'>
      <Icon type="exclamation-circle" />
    </Col>
    <Col className="tipText" span={22}>
      请注意，退出团队后，将不能继续访问该团队内的应用、存储、数据库等服务！
    </Col>
  </Row>
)

export default class ExitTeamModal extends Component{
  constructor(props){
    super(props)
    this.handleExitTeamOk = this.handleExitTeamOk.bind(this)
    this.handleExitTeamCancel = this.handleExitTeamCancel.bind(this)
    this.state = {
      
    }
  }
  handleExitTeamOk() {
    const { closeExitTeamModal, quitTeam, teamID, loadUserTeamList, detailPage } = this.props
    let notification = new NotificationHandler()
    notification.spin(`退出团队中...`)
    quitTeam(teamID, {
      success: {
        func: () => {
          notification.close()
          if (detailPage) {
            browserHistory.push('/account/teams')
            return
          }
          loadUserTeamList()
        },
        isAsync: true,
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`退出团队失败`, err.message.message)
        }
      }
    })
    closeExitTeamModal()
  }
  handleExitTeamCancel() {
    const { closeExitTeamModal } = this.props
    closeExitTeamModal()
  }
  render(){
    const { visible, teamName } = this.props
    return (
      <Modal title='退出团队'
             visible={ visible }
             onOk={this.handleExitTeamOk}
             onCancel={this.handleExitTeamCancel}
             width="660px"
             wrapClassName="ExitTeamModal"
             footer={[
               <Button key="back" type="ghost" size="large" onClick={this.handleExitTeamCancel}>取消</Button>,
               <Button key="submit" type="primary" size="large" onClick={this.handleExitTeamOk} className="delBtn" >
                 确定
               </Button>,
             ]}
      >
        <Alert message={message} type="warning"/>
        <Row className="confirm">
          <Col span={2} className='confirmIcon'>
            <Icon type="question-circle-o" />
          </Col>
          <Col className="confirmText" span={22}>
            请确认是否退出团队 { teamName } ?
          </Col>
        </Row>
      </Modal>
    )
  }
}