/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index metrics
 *
 * v0.1 - 2016-10-25
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import CPU from './CPU'
import Memory from './Memory'
import Network from './Network'

class Metrics extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { cpu, memory, networkReceived, networkTransmitted, events } = this.props
    return (
      <div className="metrics" style={{marginTop:12}}>
        <CPU cpu={cpu} events={events}/>
        <Memory memory={memory} events={events}/>
        <Network networkReceived={networkReceived}
          networkTransmitted={networkTransmitted}
          events={events}
        />
      </div>
    )
  }
}

Metrics.propTypes = {
  cpu: PropTypes.object.isRequired,
  memory: PropTypes.object.isRequired,
  networkReceived: PropTypes.object.isRequired,
  networkTransmitted: PropTypes.object.isRequired,
}

export default Metrics