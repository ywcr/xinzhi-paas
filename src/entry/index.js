/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index entry file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
// Use babel-plugin-transform-runtime instend of babel-polyfill in .babelrc to reduce file size
// import 'babel-polyfill'
// import es6-promise for IE
import { polyfill as promisePolyfill } from 'es6-promise'
promisePolyfill()
import '../common/polyfill'

import '../common/lib'
import React from 'react'
import { render } from 'react-dom'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import Root from '../containers/Root'
import configureStore from '../store/configureStore'
const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

render(
  <Root store={store} history={history} />,
  document.getElementById('root')
)

if (process.env.NODE_ENV !== 'production') {
  module.hot.accept()
}
