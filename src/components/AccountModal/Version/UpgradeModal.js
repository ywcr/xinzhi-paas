/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * upgrade modal component
 *
 * v0.1 - 2016-12-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card, Input ,Modal} from 'antd'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import VersionNoraml from './Normal'
import VersionProfress from './Profress'
import "./style/UpgradeModal.less"
import proIcon from '../../../assets/img/version/proIcon.png'

class UpgradeModal extends Component {
  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this)
    this.handleUpgrade = this.handleUpgrade.bind(this)
    this.state = {
      //
    }
  }

  handleCancel() {
    //this function for user close the modal
    const { closeModal } = this.props
    closeModal && closeModal()
  }

  handleUpgrade() {
    const { closeModal } = this.props
    closeModal && closeModal()
    browserHistory.push('/account/balance/payment#upgrade')
  }

  componentWillMount() {
  }
  // switch api type to component currentType
  switchType(type) {
    switch (type) {
      case 'Application':
      case 'Service':
      case 'Scaling':
      case 'ConfigGroup':
      case 'ConfigFile':
        return 'app'
      case 'Volume':
        return 'storage'
      case 'UserTeam':
      case 'UserTeamspace':
        return 'team'
      case 'DevOps':
      case 'Registries':
        return 'cicd'
      case 'DBService':
        return 'database'
      case 'Image':
      case 'ComposeFile':
      case 'ImageSecure':
        return 'appcenter'
      case 'Integration':
        return 'intergation'
      case 'Logging':
        return 'log'
      case 'OpenAPI':
      default:
        return
    }
  }

  render() {
    let { visible, currentType } = this.props;
    currentType = this.switchType(currentType)
    return (
      <Modal
        wrapClassName='wrapUpgradeModalBox'
        className='upgradeModalBox'
        onCancel={this.handleCancel}
        visible={visible}
        width={620}
        maskClosable={false}
      >
        <div id = 'upgradeModal'>
          <div className='titleBox'>
            <span>升级专业版</span>
          </div>
          <div className='infoBox'>
            <div className='leftBox'>
              <div className='littleTitle'>
                <span>标准版</span>￥<span>0</span>/月
              </div>
              <div className={ currentType == 'app' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>应用管理</span>
              </div>
              <div className={ currentType == 'storage' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>存储管理</span>
              </div>
              <div className={ currentType == 'appcenter' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>交付中心（2个镜像）</span>
              </div>
              <div className={ currentType == 'cicd' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>CI/CD标准版（2 个EnnFlow，8个子项目）代码库（GitHub、GitLab、SVN、Gogs）</span>
              </div>
              <div className={ currentType == 'database' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>数据库集群&缓存集群（2个集群）</span>
              </div>
              <div className={ currentType == 'intergation' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>集成中心（集成应用）</span>
              </div>
              <div className={ currentType == 'log' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>操作审计、日志中心（一天以内日志）</span>
              </div>
              <div className={ currentType == 'user' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>帐户中心</span>
              </div>
            </div>
            <div className='rightBox'>
              <div className='littleTitle'>
                <span>专业版</span>￥<span>99</span>/月
              </div>
              <div className={ currentType == 'app' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>应用管理</span>
              </div>
              <div className={ currentType == 'storage' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>存储管理</span>
              </div>
              <div className={ currentType == 'appcenter' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <img className='commonImg' src={proIcon} />
                <span className='littleIcon'></span>
                <span className='infoSpan'>交付中心（20个镜像、安全扫描）</span>
              </div>
              <div className={ currentType == 'cicd' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <img className='commonImg' src={proIcon} />
                <span className='littleIcon'></span>
                <span className='infoSpan'>CI/CD完整版（数量不限）<br />代码库（GitHub、GitLab、SVN）</span>
              </div>
              <div className={ currentType == 'database' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <img className='commonImg' src={proIcon} />
                <span className='littleIcon'></span>
                <span className='infoSpan'>数据库集群&缓存集群（8个集群）</span>
              </div>
              <div className={ currentType == 'intergation' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>集成中心（集成应用）</span>
              </div>
              <div className={ currentType == 'log' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <img className='commonImg' src={proIcon} />
                <span className='littleIcon'></span>
                <span className='infoSpan'>操作审计、日志中心（一年以内日志）</span>
              </div>
              <div className={ currentType == 'user' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <span className='littleIcon'></span>
                <span className='infoSpan'>帐户中心</span>
              </div>
              <div className={ currentType == 'team' ? 'activeInfo littleInfo' : 'littleInfo'}>
                <img className='commonImg' src={proIcon} />
                <span className='littleIcon'></span>
                <span className='infoSpan'>团队管理（1个团队*10个成员）</span>
              </div>
            </div>
            <div style={{ clear:'both' }}></div>
          </div>
          <div className='btnBox'>
            <div className='bgBox'></div>
            <Button size='large' type='ghost' onClick={this.handleCancel}>
              <span>下次再说</span>
            </Button>
            <Button size='large' type='primary' onClick={this.handleUpgrade}>
              <span>升级专业版</span>
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}

UpgradeModal.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
  return {
  }
}

export default connect(mapStateToProps, {
})(injectIntl(UpgradeModal, {
  withRef: true,
}))