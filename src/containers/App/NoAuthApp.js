/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * Redux main app file for no auth
 *
 * v0.1 - 2017-02-10
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Intercom from 'react-intercom'
import { genRandomString } from '../../common/tools'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
const standardFlag = mode === standard
const INTERCOME_USER_ID_KEY = 'IntercomeUserId'

const user = {
  user_id: getIntercomeUserId(),
  name: 'Logged-out Visitors'
}

// Return Intercome userId
// When the user refreshes the page, the record is not lost
function getIntercomeUserId() {
  if (!localStorage) {
    return genRandomString(10)
  }
  const userId = localStorage.getItem(INTERCOME_USER_ID_KEY)
  if (userId) {
    return userId
  }
  localStorage.setItem(INTERCOME_USER_ID_KEY, genRandomString(10))
}

class NoAuthApp extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { children } = this.props
    return (
      <div>
        {children}
        {standardFlag && <Intercom appID='okj9h5pl' { ...user } />}
      </div>
    )
  }
}

NoAuthApp.propTypes = {
  // Injected by React Router
  children: PropTypes.node,
}

function mapStateToProps(state, props) {
  return {
    //
  }
}

export default connect(mapStateToProps, {
  //
})(NoAuthApp)