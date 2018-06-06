/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Network metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from './EchartsOption'

function formatGrid(count) {
  //this fucntion for format grid css
  //due to the network counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

class Network extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const option = new EchartsOption('网络')
    const { networkReceived, networkTransmitted ,events} = this.props
    option.addYAxis('value', {
      formatter: '{value} KB/s'
    })
    networkReceived.data && networkReceived.data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || floatValue  only one
        values.push(Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100)
      })
      option.setXAxisData(timeData)
      option.addSeries(values, `${item.containerName} 下载`)
    })
    networkTransmitted.data&&networkTransmitted.data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || metric.floatValue  only one
        values.push(Math.ceil((metric.floatValue || metric.value) / 1024 * 100) /100)
      })
      option.setXAxisData(timeData)
      option.addSeries(values, `${item.containerName} 上传`)
    })
    option.setGirdForDataNetWork(networkTransmitted.data && networkTransmitted.data.length + networkReceived.data.length, events)
    return (
      <ReactEcharts
        style={{ height: formatGrid(networkTransmitted.data && networkTransmitted.data.length + networkReceived.data.length) }}
        notMerge={true}
        option={option}
        showLoading={networkReceived.isFetching || networkTransmitted.isFetching}
        />
    )
  }
}

Network.propTypes = {
  networkReceived: PropTypes.object.isRequired,
  networkTransmitted: PropTypes.object.isRequired,
}

Network.defaultProps = {
  networkReceived: {
    isFetching: false,
    data: []
  },
  networkTransmitted: {
    isFetching: false,
    data: []
  }
}

export default Network