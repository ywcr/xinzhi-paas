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
const PING_NUMBER = 0

class Websocket extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ws: new WebSocket(this.props.url, this.props.protocol),
      attempts: 1,
    };
  }

  logging(logline) {
    if (this.props.debug === true) {
    }
  }

  generateInterval(k) {
    return Math.min(30, (Math.pow(2, k) - 1)) * 1000
  }

  setupWebsocket() {
    let websocket = this.state.ws
    const { url, protocol, onSetup, pingInterval, heartBeat } = this.props
    websocket.onopen = () => {
      this.logging('Websocket connected')
      this.logging(new Date())
      // Return a websocket
      onSetup(websocket)
      // Heart beats for keep connect
      if (heartBeat) {
        this.pingInterval = setInterval(() => {
          this.logging('Heart beats')
          websocket.send(PING_NUMBER)
        }, pingInterval)
      }
    }

    websocket.onmessage = (evt) => {
      // this.props.onMessage(evt.data)
      this.logging('Websocket onmessage')
      this.logging(evt.data)
    }

    websocket.onerror = err => {
      this.logging(`Websocket onerror`)
      this.logging(err)
    }


    websocket.onclose = (err) => {
      
      this.pingInterval && clearInterval(this.pingInterval)
      let time = this.generateInterval(this.state.attempts)
      let attempts = this.state.attempts
      attempts++
      this.setState([
        attempts
      ])
      setTimeout(() => {
        this.logging('Websocket disconnected')
        this.shouldReconnect = this.props.reconnect
        this.logging(this.shouldReconnect)
        this.logging(new Date())
        if (this.shouldReconnect) {
          this.logging(time)
          this.setState({
            ws: new WebSocket(url, protocol)
          })
          this.setupWebsocket()
        }
      }, time)
    }
  }

  componentDidMount() {
    this.setupWebsocket()
  }

  componentWillUnmount() {
    this.shouldReconnect = false
    let websocket = this.state.ws
    websocket.close()
    this.pingInterval && clearInterval(this.pingInterval)
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
  heartBeat: PropTypes.bool,
  reconnect: PropTypes.bool,
  protocol: PropTypes.string,
  pingInterval: PropTypes.number,
}

Websocket.defaultProps = {
  debug: false,
  heartBeat: false,
  reconnect: true,
  pingInterval: 25000,
}

export default Websocket