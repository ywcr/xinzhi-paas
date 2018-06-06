/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Service monitor
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Radio, } from 'antd'
import { connect } from 'react-redux'
import TimeControl from '../../Metrics/TimeControl'
import Metrics from '../../Metrics'
import { loadServiceMetricsCPU, loadServiceMetricsMemory, loadServiceMetricsNetworkReceived, loadServiceMetricsNetworkTransmitted, loadServiceAllOfMetrics } from '../../../actions/metrics'
import './style/ServiceMonitor.less'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
let metricsInterval;

function loadData(props, query) {
  const { cluster, serviceName, loadServiceMetricsCPU, loadServiceMetricsMemory, loadServiceMetricsNetworkReceived, loadServiceMetricsNetworkTransmitted, loadServiceAllOfMetrics } = props
  loadServiceMetricsCPU(cluster, serviceName, query)
  loadServiceMetricsMemory(cluster, serviceName, query)
  loadServiceMetricsNetworkReceived(cluster, serviceName, query)
  loadServiceMetricsNetworkTransmitted(cluster, serviceName, query)
}

class ServiceMonitior extends Component {
  constructor(props) {
    super(props)
    this.handleTimeChange = this.handleTimeChange.bind(this)
    this.changeTime = this.changeTime.bind(this)
    this.setIntervalFunc = this.setIntervalFunc.bind(this)
    this.state = {
      intervalStatus: false
    }
  }

  changeTime(hours) {
    let d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }

  handleTimeChange(e) {
    const {value} = e.target
    const start = this.changeTime(value)
    this.setState({
      currentStart: start
    })
    loadData(this.props, { start })
  }

  componentDidMount() {
    loadData(this.props, { start: this.changeTime(1) })
  }

  componentWillReceiveProps(nextProps) {
    const { cluster, serviceName } = nextProps
    if (serviceName === this.props.serviceName) {
      return
    }
    loadData(nextProps, { start: this.changeTime(1) })
  }

  componentWillUnmount() {
    clearInterval(metricsInterval)
  }

  setIntervalFunc() {
    //this function for setInterval
    let query = this.state.currentStart;
    const { intervalStatus } = this.state;
    if(intervalStatus) {
      clearInterval(metricsInterval)
      this.setState({
        intervalStatus: false
      })
    } else {
      const { cluster, serviceName, loadServiceAllOfMetrics } = this.props
      this.setState({
        intervalStatus: true
      })
      metricsInterval = setInterval(() => {
        loadServiceAllOfMetrics(cluster, serviceName, query)
      }, 60000);
    }
  }

  render() {
    const { cpu, memory, networkReceived, networkTransmitted, allServiceMetrics } = this.props
    const { intervalStatus } = this.state
    let showCpu = {
      data: [],
      isFetching: false
    };
    let showMemory = {
      data: [],
      isFetching: false
    };
    let showNetworkTrans = {
      data: [],
      isFetching: false
    };
    let showNetworkRec = {
      data: [],
      isFetching: false
    };
    if(allServiceMetrics.data.length > 0) {
      showCpu.data = allServiceMetrics.data[0].cpu;
      showCpu.isFetching = false;
      showMemory.data = allServiceMetrics.data[1].memory;
      showMemory.isFetching = false;
      showNetworkTrans.data = allServiceMetrics.data[2].networkTrans;
      showNetworkTrans.isFetching = false;
      showNetworkRec.data = allServiceMetrics.data[3].networkRec;
      showNetworkRec.isFetching = false;
    } else {
      showCpu = cpu;
      showMemory = memory;
      showNetworkTrans = networkTransmitted;
      showNetworkRec = networkReceived;
    }
    return (
      <div id="ServiceMonitior">
        <TimeControl onChange={this.handleTimeChange} setInterval={this.setIntervalFunc} intervalStatus={this.state.intervalStatus} />
        <Metrics
          events='AppServiceDetail'
          cpu={showCpu}
          memory={showMemory}
          networkReceived={showNetworkRec}
          networkTransmitted={showNetworkTrans}
          />
      </div>
    )
  }
}

ServiceMonitior.propTypes = {
  serviceName: PropTypes.string.isRequired,
  cluster: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
  const {
    CPU,
    memory,
    networkReceived,
    networkTransmitted,
    allservicesmetrics
  } = state.metrics.services
  const cpuData = {
    isFetching: CPU.isFetching,
    data: []
  }
  if (CPU && CPU.result) {
    cpuData.data = CPU.result.data || []
  }
  const memoryData = {
    isFetching: memory.isFetching,
    data: []
  }
  if (memory && memory.result) {
    memoryData.data = memory.result.data || []
  }
  const networkReceivedData = {
    isFetching: networkReceived.isFetching,
    data: []
  }
  if (networkReceived && networkReceived.result) {
    networkReceivedData.data = networkReceived.result.data || []
  }
  const networkTransmittedData = {
    isFetching: networkTransmitted.isFetching,
    data: []
  }
  if (networkTransmitted && networkTransmitted.result) {
    networkTransmittedData.data = networkTransmitted.result.data || []
  }
  const allData = {
    isFetching: false,
    data: []
  }
  if(allservicesmetrics && allservicesmetrics.result) {
    allData.data = allservicesmetrics.result.data || []
  }
  return {
    cpu: cpuData,
    memory: memoryData,
    networkReceived: networkReceivedData,
    networkTransmitted: networkTransmittedData,
    allServiceMetrics: allData
  }
}

export default connect(mapStateToProps, {
  loadServiceMetricsCPU,
  loadServiceMetricsMemory,
  loadServiceMetricsNetworkReceived,
  loadServiceMetricsNetworkTransmitted,
  loadServiceAllOfMetrics
})(ServiceMonitior)