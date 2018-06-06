/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster component
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
// import SecondSider from '../../components/SecondSider'
// import IntlExp from '../../components/IntlExp'
// import QueueAnim from 'rc-queue-anim'
import './style/cluster.less'

export default class Cluster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clusterSiderStyle: 'normal'
    }
  }

  render() {
    const { children } = this.props
    const scope = this
    return (
      <div id='Cluster'>
        <div className={ this.state.clusterSiderStyle == 'normal' ? 'ClusterContent CommonSecondContent' : 'hiddenContent ClusterContent CommonSecondContent' } >
          {children}
        </div>
      </div>
    )
  }
}

Cluster.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}