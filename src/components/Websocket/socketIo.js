/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Websocket
 *
 * v0.1 - 2016-11-23
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import io from 'socket.io-client'


class Websocket extends Component {
  constructor(props) {
    super(props)
  }

  setupWebsocket() {
    let { url, path, protocol } = this.props
    if(!path) {
      path = '/'
    }
    if(!protocol) protocol = 'http'
    if(protocol == 'http') protocol = 'ws'
    else protocol = 'wss'
    let ws = io(protocol + '://' + url + path, {
        transports: ['websocket']
    })
    this.setState({
      ws: ws
    })
    const { onSetup } = this.props
    ws.once("connect", function() {
      onSetup(ws)
    })
  }

  componentDidMount() {
    this.setupWebsocket()
  }

  componentWillUnmount() {
    this.shouldReconnect = false
    let websocket = this.state.ws
    websocket.close()
  }

  render() {
    return (
      <div></div>
    )
  }
}

Websocket.propTypes = {
  url: PropTypes.string.isRequired,
  onSetup: PropTypes.func.isRequired, // Return a websocket
  debug: PropTypes.bool,
  protocol: PropTypes.string,
}

Websocket.defaultProps = {
  debug: false,
  reconnect: true,
}

export default Websocket
