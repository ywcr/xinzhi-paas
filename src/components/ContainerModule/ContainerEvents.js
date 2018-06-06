/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerEvents component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Checkbox, Dropdown, Button, Card, Menu, Icon, Spin } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/ContainerEvents.less'
import { loadContainerDetailEvents } from '../../actions/app_manage'
import { calcuDate } from '../../common/tools.js'

function loadData(props) {
  const { cluster, containerName } = props;
  props.loadContainerDetailEvents(cluster, containerName);
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },

  render: function () {
    let { config, isFetching } = this.props;
    if (isFetching) {
      return (
        <div className="loadingBox" >
          <Spin size="large" />
        </div>
      )
    }
    if (!!!config || config.length < 1) {
      return (
        <div className="noData" >
          暂无数据
        </div>
      )
    }
    let items = config.map((item, index) => {
      return (
        <div className='logDetail' key={`container_event_${index}`} >
          <div className='iconBox' >
            <div className='line' ></div>
            <div className={item.type == 'Normal' ? 'icon fa fa-check-circle success' : 'icon fa fa-times-circle fail'} > </div>
          </div>
          <div className='infoBox' >
            <div className={item.type == 'Normal' ? 'status success' : 'status fail'} >
              <span className='commonSpan' >
                {item.reason}
              </span>
            </div>
            <div className='message' >
              消息: {item.message}
            </div>
            <div className='createTime' >
              <span className='commonSpan' >
                {calcuDate(item.lastSeen)}
              </span>
            </div>
          </div>
          <div style={{ clear: 'both' }} > </div>
        </div>
      );
    });
    return (
      <div className='logBox' >
        {items}
      </div>
    );
  }
});

class ContainerEvents extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    loadData(this.props);
  }

  render() {
    const { eventList, isFetching } = this.props;
    return (
      <div id='ContainerEvents' >
        <MyComponent config={eventList} isFetching={isFetching} />
      </div>
    )
  }
}

ContainerEvents.propTypes = {
  // Injected by React Redux
  cluster: PropTypes.string.isRequired,
  eventList: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadContainerDetailEvents: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  const { cluster, containerName } = props
  const defaultEvents = {
    isFetching: false,
    eventList: [],
  }
  const { containerDetailEvents } = state.containers
  if (!containerDetailEvents[cluster]) {
    containerDetailEvents[cluster] = {}
  }
  const { eventList, isFetching } = containerDetailEvents[cluster][containerName] || defaultEvents

  return {
    eventList,
    isFetching
  }
}

export default connect(mapStateToProps, {
  loadContainerDetailEvents
})(ContainerEvents)