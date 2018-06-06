/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeCenter component
 *
 * v0.1 - 2016-10-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import PrivateCompose from './ComposeCenter/PrivateCompose.js'
import PublicCompose from './ComposeCenter/PublicCompose.js'
import "./style/ComposeCenter.less"
import Title from '../Title'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class ComposeCenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: "privateCompose",
    }
  }
  selectCurrentTab(current) {
    //this function for user select current show tabs
    this.setState({
      current: current
    });
  }
  render() {
    const { current } = this.state;
    const { formatMessage } = this.props.intl;
    const scope = this;
    return (
      <QueueAnim className="ComposeCenterBox"
        type="right"
        >
        <div id="ComposeCenter" key="ComposeCenterBox">
          <Title title="编排文件" />
          <Card className="titleList">
            <ul>
              <li className={current == "privateCompose" ? "titleSelected" : "titleDetail"}
                onClick={this.selectCurrentTab.bind(this, "privateCompose")}
                >
                <span>我的编排</span>
              </li>
              <li className={current == "publicCompose" ? "titleSelected" : "titleDetail"}
                onClick={this.selectCurrentTab.bind(this, "publicCompose")}
                >
                <span>公共编排</span>
              </li>
              <div style={{ clear: "both" }}></div>
            </ul>
          </Card>
          {current == "privateCompose" ? [<PrivateCompose scope={scope} />] : null}
          {current == "publicCompose" ? [<PublicCompose scope={scope} />] : null}
        </div>
      </QueueAnim>
    )
  }
}

ComposeCenter.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(ComposeCenter, {
  withRef: true,
}))