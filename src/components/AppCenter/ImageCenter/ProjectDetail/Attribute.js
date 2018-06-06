/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DetailInfo component
 *
 * v0.1 - 2016-10-19
 * @author BaiYu
 */

import React, { Component } from 'react'
import { Card , Spin ,Icon} from 'antd'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { formatDate, isValidateDate } from '../../../../common/tools'
import { loadProjectRepos } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../constants'

const menusText = defineMessages({
  favouriteNumber: {
    id: 'AppCenter.ImageCenter.ImageDetail.favouriteNumber',
    defaultMessage: '收藏数',
  },
  creationTime: {
    id: 'AppCenter.ImageCenter.ImageDetail.creationTime',
    defaultMessage: '创建时间',
  }
})
class Attribute extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount(){
      this.DEFAULT_QUERY = {
          page: 1,
          page_size: 10,
          project_id:this.props.params,
          detail: 1,
      }
      const { loadProjectRepos } = this.props
      const detailInfo = this.props.detailInfo.name.split('/')[1]
      loadProjectRepos(DEFAULT_REGISTRY, Object.assign({}, this.DEFAULT_QUERY,{ q: detailInfo }))
  }
  render() {
    const detailInfo = this.props.detailInfo
    const {list}=this.props.repos



    if (detailInfo == '') {
      return (
        <Card className="detailInfo">
        <h2>not attribute</h2>
        </Card>
      )
    }
    return (
      <Card className="attr">
        <ul id="attribute">
          <li className="leftKey"><Icon type="clock-circle-o" />
            <FormattedMessage {...menusText.creationTime} />： &nbsp;
            {list.length>0?formatDate(detailInfo.creationTime):null}
          </li>
          <li className="leftKey"><Icon type="clock-circle-o" />
            <span>更新时间</span>： &nbsp;
              {list.length>0?formatDate(detailInfo.updateTime):null}
          </li>
        </ul>
      </Card>
    )
  }
}
function mapStateToProps(state, props) {
    const { harbor } = state
    return {
        repos: harbor.repos || {},
    }
}
export default connect(mapStateToProps, {
    loadProjectRepos
})(injectIntl(Attribute, {
    withRef: true,
}))