/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Chinese entry file
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import appLocaleData from 'react-intl/locale-data/zh'
import zhMessages from '../../static/locales/frontend/zh.json'

window.appLocale = {
  messages: {
    ...zhMessages,
  },
  antd: null,
  locale: 'zh',
  data: appLocaleData
}