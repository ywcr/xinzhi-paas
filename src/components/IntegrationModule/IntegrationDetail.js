/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  IntegrationDetail index module
 *
 * v2.0 - 2016-11-22
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Tabs, Spin, Select } from 'antd'
import { getIntegrationDateCenter } from '../../actions/integration'
import './style/IntegrationDetail.less'
import VSphere from './VSphereDetail'
import VmList from './VmList'
import PhysicalList from './PhysicalList'
import VSphereConfig from './VSphereConfig'
import Title from '../Title'

const TabPane = Tabs.TabPane;
const Option = Select.Option;

const menusText = defineMessages({
  VSphere: {
    id: 'Integration.IntegrationDetail.VSphere',
    defaultMessage: 'vSphere面板',
  },
  vmList: {
    id: 'Integration.IntegrationDetail.vmList',
    defaultMessage: '虚拟机列表',
  },
  physicalList: {
    id: 'Integration.IntegrationDetail.physicalList',
    defaultMessage: '物理机列表',
  },
  VSphereConfig: {
    id: 'Integration.IntegrationDetail.VSphereConfig',
    defaultMessage: '配置vSphere',
  },
  back: {
    id: 'Integration.IntegrationDetail.back',
    defaultMessage: '返回应用列表',
  },
})

class IntegrationDetail extends Component {
  constructor(props) {
    super(props);
    this.returnToList = this.returnToList.bind(this);
    this.onChangeDataCenter = this.onChangeDataCenter.bind(this);
    this.state = {
      currentDataCenter: null
    }
  }

  componentWillMount() {
    document.title = '集成中心 | 新智云';
    const { getIntegrationDateCenter, integrationId } = this.props;
    const scope = this;
    getIntegrationDateCenter(integrationId, {
      success: {
        func: (res) => {
          let tempValue = res.result.data.all[0];
          scope.setState({
            currentDataCenter: tempValue
          })
        }
      }
    });
  }

  returnToList() {
    //the function for user return to the list
    const { scope } = this.props;
    scope.setState({
      showType: 'list'
    });
  }

  onChangeDataCenter(e) {
    //this function for user change the current data center
    this.setState({
      currentDataCenter: e
    });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { scope } = this.props;
    const thisScope = this;
    const { isFetching, dataCenters, integrationId } = this.props;
    if(isFetching || !Boolean(dataCenters) || dataCenters==[]) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let selectDcShow = dataCenters.map((item, index) => {
      return (
        <Option value={item} key={item}>{item.replace('/','')}</Option>
      )
    });
    return (
      <QueueAnim className='IntegrationDetailAnimate' key='IntegrationDetailAnimate'>
         <div id='IntegrationDetail' key="detail">
            <Title title="集成中心" />
          <div className='dcSelector'>
            <Select defaultValue={this.state.currentDataCenter} style={{ width: 150, marginLeft: '15px' }} size='large' onChange={this.onChangeDataCenter}>
              {selectDcShow}
            </Select>
          </div>
          <Tabs>
            <TabPane tab={<FormattedMessage {...menusText.VSphere} />} key='1'>
              <VSphere scope={thisScope} dataCenters={dataCenters} integrationId={integrationId} currentDataCenter={this.state.currentDataCenter} />
            </TabPane>
            <TabPane tab={<FormattedMessage {...menusText.vmList} />} key='2'>
              <VmList scope={thisScope} dataCenters={dataCenters} integrationId={integrationId} currentDataCenter={this.state.currentDataCenter} />
            </TabPane>
            <TabPane tab={<FormattedMessage {...menusText.physicalList} />} key='3'>
              <PhysicalList scope={thisScope} dataCenters={dataCenters} integrationId={integrationId} currentDataCenter={this.state.currentDataCenter} />
            </TabPane>
            <TabPane tab={<FormattedMessage {...menusText.VSphereConfig} />} key='4'>
              <VSphereConfig scope={thisScope} rootScope={scope} integrationId={integrationId} />
            </TabPane>
          </Tabs>
          <Button size='large' type='ghost' className='backBtn' onClick={this.returnToList}>
            <FormattedMessage {...menusText.back} />
          </Button>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultDataCenterList = {
    isFetching: false,
    dataCenters: []
  }
  const { getIntegrationDateCenter } = state.integration
  const {isFetching, dataCenters} = getIntegrationDateCenter || defaultDataCenterList
  return {
    isFetching,
    dataCenters
  }
}

IntegrationDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getIntegrationDateCenter
})(injectIntl(IntegrationDetail, {
  withRef: true,
}));

