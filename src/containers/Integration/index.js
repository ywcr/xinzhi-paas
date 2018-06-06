/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Integration component
 *
 * v0.1 - 2016-11-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import SecondSider from '../../components/SecondSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/Integration.less'

export default class Integration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }
  
  render() {
    const { children } = this.props
    const scope = this
    return (
      <div id='Integration'>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'IntegrationContent CommonSecondContent' : 'hiddenContent IntegrationContent CommonSecondContent' } >
          {children}
        </div>
      </div>
    )
  }
}

Integration.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}