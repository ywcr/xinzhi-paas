/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * English entry file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import antdEn from 'antd/lib/locale-provider/en_US'
import appLocaleData from 'react-intl/locale-data/en'
import enMessages from '../../static/locales/frontend/en.json'

window.appLocale = {
  messages: {
    ...enMessages,
  },
  antd: antdEn,
  locale: 'en',
  data: appLocaleData
}