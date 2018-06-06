/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Root dev file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import routes from '../routes'
import DevTools from './DevTools'
import { Router } from 'react-router'

// Internationalization
import { LocaleProvider } from 'antd'
import { addLocaleData, IntlProvider } from 'react-intl'
const appLocale = window.appLocale
addLocaleData(appLocale.data)

class Root extends Component {
  render() {
    const { store, history } = this.props
    return (
      <Provider store={store}>
        <LocaleProvider locale={appLocale.antd}>
          <IntlProvider locale={appLocale.locale} messages={appLocale.messages}>
            <div>
              <Router onUpdate={() => window.scrollTo(0, 0)} history={history} routes={routes} />
              <DevTools />
            </div>
          </IntlProvider>
        </LocaleProvider>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

export default Root