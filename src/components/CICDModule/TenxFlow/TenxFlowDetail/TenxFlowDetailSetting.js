/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailSetting component
 *
 * v0.1 - 2016-10-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Card, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { deleteTenxFlowSingle } from '../../../../actions/cicd_flow'
import './style/TenxFlowDetailSetting.less'
import { browserHistory } from 'react-router';
import Title from '../../../Title'

const menusText = defineMessages({
  tooltips: {
    id: 'CICD.Tenxflow.TenxFlowDetailSetting.tooltips',
    defaultMessage: '请注意，删除 EnnFlow 将清除相关的历史构建数据，且该操作不能被恢复，您确定要删除吗？',
  },
  delete: {
    id: 'CICD.Tenxflow.TenxFlowDetailSetting.delete',
    defaultMessage: '删除该EnnFlow',
  },
  deleteConfirm: {
    id: 'CICD.Tenxflow.TenxFlowDetailSetting.deleteConfirm',
    defaultMessage: '您是否确认要删除这项内容',
  },
})

let TenxFlowDetailSetting = React.createClass({
  getInitialState: function () {
    return {
      delFlowModal: false
    }
  },
  delFlowAction() {
    const { deleteTenxFlowSingle, flowId } = this.props;
    deleteTenxFlowSingle(flowId, {
      success: {
        func: () => browserHistory.push('/ci_cd/enn_flow'),
        isAsync: true
      }
    })
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope, flowId } = this.props;
    return (
      <Card id='TenxFlowDetailSetting' key='TenxFlowDetailSetting'>
        <Title title="EnnFlow" />
        <p>
          <i className='fa fa-exclamation-triangle' />&nbsp;
        <FormattedMessage {...menusText.tooltips} />
        </p>
        <p className="text-center">
          <Button className='deleteBtn' size='large' type='ghost' onClick={()=> this.setState({delFlowModal: true})}>
            <FormattedMessage {...menusText.delete} />
          </Button>
        </p>
        <Modal title="删除EnnFlow操作" visible={this.state.delFlowModal}
          onOk={() => this.delFlowAction()} onCancel={() => this.setState({ delFlowModal: false })}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i> <FormattedMessage {...menusText.deleteConfirm} />?</div>
        </Modal>
      </Card>
    )
  }
});

function mapStateToProps(state, props) {

  return {

  }
}

TenxFlowDetailSetting.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  deleteTenxFlowSingle
})(injectIntl(TenxFlowDetailSetting, {
  withRef: true,
}));

