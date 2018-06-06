/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Footer of overview
 *
 * v0.1 - 2017-02-06
 * @author Zhangpc
 */

import React, { Component } from 'react'
import { TENX_PORTAL_VERSION_KEY } from '../../constants'

class Footer extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div style={{textAlign: 'center', color: "#979797", height: '30px', lineHeight: '30px'}}>
        {window[TENX_PORTAL_VERSION_KEY]}
      </div>
    )
  }
}
export default Footer