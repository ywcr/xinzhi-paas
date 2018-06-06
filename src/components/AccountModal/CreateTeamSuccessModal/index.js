import React, { Component } from 'react'
import { Modal,Alert,Icon,Button,Row,Col,Input } from 'antd'
import {Link} from 'react-router'
import homeNoWarn from '../../../assets/img/homeNoWarn.png'

export default class CreateTeamSuccessModal extends Component{
  constructor(props){
    super(props)
    this.handleCancel = this.handleCancel.bind(this)
    this.state = {

    }
  }
  handleCancel() {
    const { closeCreateSucModal } = this.props
    closeCreateSucModal()
  }
  render(){
    const { visible, teamID, teamName } = this.props
    return (
      <Modal
        visible={ visible }
        wrapClassName="CreateTeamSuccessModal"
        footer={[]}
        onCancel={this.handleCancel}
      >
        <div className="successInf">
          <img src={homeNoWarn} alt="" className="successImg"/>
          <div>团队创建成功</div>
        </div>
        <div className="successOpt">
          您可以去管理团队
          <Link className="wrap" to={`/account/teams/${teamID}`}>
            <Button className="successBtn" type="primary" size="large">去管理</Button>
          </Link>
        </div>
        <div className="successOpt" style={{borderRadius: '0 0 6px 6px'}}>
          为团队帐户充值, 该团队即可使用计费资源
          <Link className="wrap" to={`/account/balance/payment?team=${teamName}`}>
            <Button className="successBtn" type="primary" size="large">去充值</Button>
          </Link>
        </div>
      </Modal>
    )
  }
}