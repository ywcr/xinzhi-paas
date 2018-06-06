/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Topology component
 *
 * v0.1 - 2017-4-17
 * @author BaiYu
 */
import React, { Component } from 'react'

class Topology extends Component {
  constructor(props) {
    super()
  }
  render () {
    const {cluster, appName,teamspace} = this.props
    return (
      <div id="Topology">
        <iframe name="topology" id="topologys" src={`/js/container_topology.html?cluster=${cluster}&appname=${appName}&teamspace=${teamspace}`} style={{width:'100%',height:'500px',border:0}}></iframe>
      </div>
    )
  }
}


export default Topology