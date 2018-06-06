/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceEvent component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox, Dropdown, Button, Card, Menu, Icon, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { loadServiceDetailEvents, loadContainersAllEvents } from '../../../actions/services'
import { calcuDate } from '../../../common/tools.js'
import CommonStatus from '../../CommonStatus'
import './style/AppServiceEvent.less'

function loadData(props) {
  const { cluster, serviceName, type } = props;
  props.loadServiceDetailEvents(cluster, serviceName, type);
  props.loadContainersAllEvents(cluster, serviceName)
}

var MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    isFetching: React.PropTypes.bool,
  },
  getContainerEvent(message) {
    let podname = message.replace('Created pod: ', '')
    const { containersAllEvent } = this.props
    const result = []
    if (containersAllEvent.result) {
        if(!containersAllEvent.result.data.events) return
        containersAllEvent.result.data.events.forEach(event => {
        const name = event.objectMeta.name.split('.')[0]
        if (name == podname) {
          result.push(<div className='containerDetail' key={event.id}>
            <div className='infoBox'>
              <div className='status'>
                <div className={event.type == 'Normal' ? 'icon fa fa-check-circle success' : 'icon fa fa-times-circle fail'}>
                </div>
                <span className='commonSpan'>
                  <CommonStatus status={event.type} content={event.reason} />
                </span>
              </div>
              <div className='message'>
                消息&nbsp;:&nbsp;{event.message}
              </div>
              <div className='createTime'>
                <span className='commonSpan'>
                  {calcuDate(event.lastSeen)}
                </span>
              </div>
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>)
        }
      })
    }
    return result
  },
  render: function () {
    const { isFetching, config } = this.props;
    if (isFetching || this.props.containersAllEvent.isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length == 0 || !!!config) {
      return (
        <div className='loadingBox'>
          暂无数据
        </div>
      )
    }
    var items = config.reverse().map((item, index) => {
        return <div className='eventDetail' key={item.id}>
          <div className='iconBox'>
            <div className='line'></div>
            <div className={item.type == 'Normal' ? 'icon fa fa-check-circle success' : 'icon fa fa-times-circle fail'}>
            </div>
          </div>
          <div className='infoBox'>
            <div className='status'>
              <span className='commonSpan'>
                <CommonStatus status={item.type} content={item.reason} />
              </span>
            </div>
            <div className='message'>
              消息&nbsp;:&nbsp;{item.message}
            </div>
            <div className='createTime'>
              <span className='commonSpan'>
                {calcuDate(item.lastSeen)}
              </span>
            </div>
            {item.reason == 'SuccessfulCreate' ? this.getContainerEvent(item.message) : ''}
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      })
    return (
      <div className='logBox'>
        {items}
      </div>
    );
  }
});

class AppServiceEvent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    loadData(this.props);
  }
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, service } = nextProps
    if (serviceDetailmodalShow && serviceDetailmodalShow != this.props.serviceDetailmodalShow) {
      loadData(nextProps)
      return
    }
  }

  render() {
    const { isFetching, eventList, containersAllEvent } = this.props;
    return (
      <Card id='AppServiceEvent'>
        <MyComponent isFetching={isFetching} config={eventList} containersAllEvent={containersAllEvent}/>
      </Card>
    )
  }
}

AppServiceEvent.propTypes = {
  // Injected by React Redux
  eventList: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadServiceDetailEvents: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const defaultEvents = {
    isFetching: false,
    cluster: props.cluster,
    eventList: [],
    containerEvent: []
  }
  const { serviceDetailEvents, containersAllEvent } = state.services
  let targetServices
  if (serviceDetailEvents[props.cluster] && serviceDetailEvents[props.cluster][props.serviceName]) {
    targetServices = serviceDetailEvents[props.cluster][props.serviceName]
  }
  const { eventList, isFetching } = targetServices || defaultEvents

  return {
    eventList,
    isFetching,
    containersAllEvent: containersAllEvent || {}
  }
}

export default connect(mapStateToProps, {
  loadServiceDetailEvents,
  loadContainersAllEvents
})(AppServiceEvent)