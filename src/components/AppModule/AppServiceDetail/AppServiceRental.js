/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppService rental component
 *
 * v0.1 - 2016-12-22
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Card, Icon, Spin } from 'antd'
import { connect } from 'react-redux'
import { calcuDate, parseAmount} from '../../../common/tools.js'
import './style/AppServiceDetailInfo.less'

class AppServiceRental extends Component {
  constructor(props) {
    super(props);
  }
  formetCpuMemory(memory) {
    if(Boolean(memory)) {
      switch(memory) {
        case '1Gi':
          return '1CPU/1G';
        case '2Gi':
          return '1CPU/2G';
        case '4Gi':
          return '1CPU/4G';
        case '8Gi':
          return '2CPU/8G';
        case '16Gi':
          return '2CPU/16G';
        default:
          return '1CPU（共享）/512Mi';
      }
    } else {
      return '-';
    }
  }
  // 单个价格
  formetPrice(size) {
    const { resourcePrice } = this.props
    switch(size) {
      case '256Mi':
        return resourcePrice['1x']
      case '512Mi':
        return resourcePrice['2x']
      case '1Gi':
        return resourcePrice['4x']
      case '2Gi':
        return resourcePrice['8x']
      case '4Gi':
        return resourcePrice['16x']
      case '8Gi':
        return resourcePrice['32x']
      default:
        return resourcePrice['1x']
    }
  }
  // 合计价格
  countPrice(serviceDetail) {
    let price = 0
    serviceDetail.forEach(list => {
      price += this.formetPrice(list.spec.template.spec.containers[0].resources.requests.memory) * list.spec.replicas
    })
    return price
  }
  render() {
    const { serviceDetail, resourcePrice } = this.props
    if (!resourcePrice) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!serviceDetail[0] || !serviceDetail[0].spec){
      return(
        <div className='loadingBox' style={{clear:'both',background:'white'}}>
        无
        </div>
        )
      }
    const detaContainer = this.props.serviceDetail[0].spec.template.spec.containers[0]
    let countPrice = this.countPrice(serviceDetail) * 24 * 30
    const hourPrice = this.countPrice(serviceDetail) /10000
    countPrice = parseAmount(countPrice, 4)
    const dataRow = serviceDetail.map((list, index)=> {
        return(
          <tr key={index}>
            <td>{list.metadata.name}</td>
            <td>{this.formetCpuMemory(list.spec.template.spec.containers[0].resources.requests.memory)}</td>
            <td>{list.spec.replicas}</td>
            <td>{this.formetPrice(list.spec.template.spec.containers[0].resources.requests.memory) /10000 } {countPrice.unit == '￥' ? '元': ' T'}/小时</td>
          </tr>
        )
    })

    return (
      <div id="AppServiceDetailInfo" className="ant-card AppServiceRental">
        <div className="info">
          <span className="titleSpan">租赁信息</span>
          {/*<div className="starts">
            <p><Icon type="clock-circle-o" /> 开始计费：2016.12.12. 15：50</p>
            <p><Icon type="clock-circle-o" /> 停止计费：2016.12.22. 15：50</p>

          </div>
          */}
          <div className="dataBox">
            <div className="priceCount">合计价格：
              <span className="unit">{ countPrice.unit == '￥' ? '￥': '' }</span>
              <span className="unit blod">{ hourPrice } { countPrice.unit == '￥' ? '': ' T' }/小时</span>
              <span className="unit" style={{marginLeft:'10px'}}>（约：{ countPrice.fullAmount }/月）</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>计算（CPU/内存）</th>
                  <th>数量</th>
                  <th>单价</th>
                </tr>
              </thead>
              <tbody>
                { dataRow }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

AppServiceRental.propTypes = {

}

function mapStateToProps(state) {
   const { cluster } = state.entities.current
   return {
     resourcePrice: cluster.resourcePrice
   }
}

export default connect(mapStateToProps)(AppServiceRental)