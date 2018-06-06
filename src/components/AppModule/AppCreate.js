/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppCreate component
 *
 * v0.1 - 2016-09-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card } from 'antd'
import QueueAnim from 'rc-queue-anim'
import ProgressList from './AppCreate/ProgressList.js'
import AppCreateSelectModel from './AppCreate/CreateModel.js'
import './style/AppCreate.less'

class AppCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createModel: 'quick'
    }
  }
  render() {
    const { children } = this.props;
    const parentScope = this;
    let newChildren = React.cloneElement(
      this.props.children,
      { scope: parentScope }
    )

    return (
      <QueueAnim
        id='AppCreateBox'
        type='right'
        >
        <div className='AppCreate' id='AppCreate' key='AppCreate'>
          <Card>
            <div className='leftBox'>
              <ProgressList scope={parentScope} />
            </div>
            <div className='rightBox'>
              {newChildren}
            </div>
            <div style={{ clear: 'both' }}></div>
          </Card>
        </div>

      </QueueAnim>
    )
  }
}
AppCreate.propTypes = {
  children: PropTypes.node
}

export default AppCreate


