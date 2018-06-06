/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * React i18n example
 *
 * v0.1 - 2016-09-08
 * @author Zhangpc
 */
import React, { PropTypes, Component } from 'react'
import { DatePicker, Pagination, Button } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

const messages = defineMessages({
  description: {
    id: 'IntlExp.description',
    defaultMessage: '我是描述',
  },
  alert: {
    id: 'IntlExp.alert',
    defaultMessage: '我是提醒',
  },
  button: {
    id: 'IntlExp.button',
    defaultMessage: '弹窗',
  },
})

class IntlExp extends Component {
  constructor(props) {
    super(props)
  }

  handleClick() {
    alert(this.props.intl.formatMessage(messages.alert));
  }

  render() {
    const { formatMessage } = this.props.intl
    return (
      <div>
        <div style={{ margin: 10 }}>
          <DatePicker />
        </div>
        <div style={{ margin: 10 }}>
          <Pagination showQuickJumper defaultCurrent={2} total={500} />
        </div>
        <div style={{ margin: 10 }}>
          <div style={{ margin: 10 }}>{formatMessage(messages.description)}</div>
          <Button onClick={() => this.handleClick()}>
            <FormattedMessage {...messages.button} />
          </Button>
        </div>
      </div>
    )
  }
}

IntlExp.propTypes = {
  intl: PropTypes.object.isRequired
}

export default injectIntl(IntlExp, {
  withRef: true,
})