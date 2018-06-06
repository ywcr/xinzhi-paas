/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * CPU metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import ReactEcharts from 'echarts-for-react'
import EchartsOption from './EchartsOption'

function formatGrid(count) {
  //this fucntion for format grid css
  //due to the memory counts > 6, this grid would be display wrong
  let initHeight = 300 + ((count - 4)/2)*25;
  return initHeight + 'px';
}

class CPU extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const option = new EchartsOption('CPU')
    const { cpu } = this.props
    const { isFetching, data } = cpu
    option.addYAxis('value', {
      formatter: '{value} %'
    })
    data&&data.map((item) => {
      let timeData = []
      let values = []
      item.metrics.map((metric) => {
        timeData.push(metric.timestamp)
        // metric.value || floatValue  only one
        values.push(Math.floor((metric.floatValue || metric.value) * 10) /10)
      })
      option.setXAxisData(timeData)
      option.addSeries(values, item.containerName)
    })
    option.setGirdForDataCommon(data&&data.length)
    return (
      <ReactEcharts
        style={{ height: formatGrid(data&&data.length) }}
        notMerge={true}
        option={option}
        showLoading={isFetching}
        />
    )
  }
}

CPU.propTypes = {
  cpu: PropTypes.object.isRequired,
}

CPU.defaultProps = {
  cpu: {
    isFetching: false,
    data: []
  }
}

export default CPU