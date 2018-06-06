/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App constants
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import { NODE_ENV_PROD } from '../../configs/constants'
const NODE_ENV = process.env.NODE_ENV

export const API_URL_PREFIX = '/api/v2'
export const SPI_URL_PREFIX = '/spi/v2'
export const DEFAULT_IMAGE_POOL = 'k8s-pool'
export const DEFAULT_REGISTRY = 'default'
// export const TENX_MARK = 'paas.enncloud.cn'
export const TENX_MARK = 'tenxcloud.com'
// export const CREATE_APP_ANNOTATIONS = 'paas.enncloud.cn/schemaPortname'
export const CREATE_APP_ANNOTATIONS = 'tenxcloud.com/schemaPortname'
export const LABEL_APPNAME = `${TENX_MARK}/appName`
export const DATA_STORAGE_PATH=/^(\/[a-zA-Z]\w*)+(\/)?$/
export const USERNAME_REG_EXP = /^[a-z][-a-z0-9]{1,40}[a-z0-9]$/
export const USERNAME_REG_EXP_OLD = /^[a-z][-a-z0-9_]{1,40}[a-z0-9]$/
export const USERNAME_REG_EXP_NEW = /^[a-z][a-z0-9-]{3,38}[a-z0-9]$/
export const CREATE_SPACE = /^[a-z][a-z-]{3,38}[a-z]$/
export const PASSWORD_MONGODB=/^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])).{8,12}$/
export const PASSWORD_RDB=/^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])).{8,12}$/
export const STORAGENAME_REG_EXP = /^[a-z][-a-z0-9_]{2,14}$/
export const EMAIL_REG_EXP = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
export const VERSION_REG_EXP = /\bv\d\.\d\.\d/
export const URL_REG_EXP = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
export const HOST = 'localhost:8003'
export const AVATAR_HOST = 'https://dn-tenx-avatars.qbox.me/'

// When these actions occurs the page will render to ErrorPage(StatusCode === 404 || StatusCode >= 500).
export const SHOW_ERROR_PAGE_ACTION_TYPES = [
  'APP_DETAIL_FAILURE',
  'CONTAINER_DETAIL_FAILURE',
  'USER_DETAIL_FAILURE',
  'GET_SINGLE_ENN_FLOW_FAILURE',
]
export const LOGIN_EXPIRED_MESSAGE = 'LOGIN_EXPIRED'
export const MY_SPACE = {
  name: "我的空间",
  spaceName: "我的空间",
  teamName: "我的帐户",
  namespace: "default",
  teamID: "default",
}
export const MAX_LOGS_NUMBER = 500

export const MIN_PAY_AMOUNT = (NODE_ENV === NODE_ENV_PROD ? 5 : 0.01)
export const MAX_PAY_AMOUNT = 50000
export const PAY_AMOUNT_STEP = (NODE_ENV === NODE_ENV_PROD ? 1 : 0.01)
export const MIN_NOTIFY_AMOUNT = 1
export const EMAIL_HASH = {
  'qq.com': 'http://mail.qq.com',
  'gmail.com': 'http://mail.google.com',
  'sina.com': 'http://mail.sina.com.cn',
  '163.com': 'http://mail.163.com',
  'vip.163.com': 'vip.163.com',
  'vip.sina.com': 'vip.sina.com',
  '126.com': 'http://mail.126.com',
  'yeah.net': 'http://www.yeah.net/',
  'sohu.com': 'http://mail.sohu.com/',
  'tom.com': 'http://mail.tom.com/',
  'sogou.com': 'http://mail.sogou.com/',
  '139.com': 'http://mail.10086.cn/',
  'hotmail.com': 'http://www.hotmail.com',
  'live.com': 'http://login.live.com/',
  'live.cn': 'http://login.live.cn/',
  'live.com.cn': 'http://login.live.com.cn',
  '188.com': 'www.188.com',
  '189.com': 'http://webmail16.189.cn/webmail/',
  '189.cn': 'webmail15.189.cn/webmail',
  'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
  'yahoo.cn': 'http://mail.cn.yahoo.com/',
  'eyou.com': 'http://www.eyou.com/',
  '21cn.com': 'http://mail.21cn.com/',
  '188.com': 'http://www.188.com/',
  'foxmail.coom': 'http://www.foxmail.com',
  'wo.com.cn': 'mail.wo.com.cn/smsmail',
}
export const TIMESTRAP = 1483084989915
export const PAYMENT_REQUIRED_CODE = 402
export const UPGRADE_EDITION_REQUIRED_CODE = 412
export const LICENSE_EXPRIED_CODE = 451
export const DATE_PIRCKER_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const ASYNC_VALIDATOR_TIMEOUT = 800
export const LOAD_STATUS_TIMEOUT = 2000
export const UPDATE_INTERVAL = 1000 * 30
export const UPDATE_INTERVAL_STATUS = 1000 * 10
export const USER_3RD_ACCOUNT_TYPES = ['wechat']
export const WECHAT_SIGNUP_HASH = '#wechat'
export const RESOURCES_DIY = 'DIY'
export const RESOURCES_MEMORY_MIN = 100
export const RESOURCES_MEMORY_STEP = 100
export const RESOURCES_MEMORY_MAX = 262144 // 256G
export const RESOURCES_CPU_MIN = 0.1
export const RESOURCES_CPU_DEFAULT = 0.5
export const RESOURCES_CPU_STEP = 0.1
export const RESOURCES_CPU_MAX = 128 // 128 CPU
export const TENX_PORTAL_VERSION_KEY = 'TENX_PORTAL_VERSION'
export const TENX_PORTAL_VERSION_MAJOR_KEY = 'TENX_PORTAL_VERSION_MAJOR'
export const SESSION_STORAGE_TENX_HIDE_DOT_KEY = 'tenx_hide_dot'
export const SYSTEM_DEFAULT_SCHEDULE = 'tenx_system_default_schedule'
export const LITE = 'lite'
export const MAX_CHARGE = 200000
export const NOT_AVAILABLE = 'N/A'
export const BASE_IMAGE_TYPE = ["单元测试", "代码编译", "构建镜像", "集成测试"]
export const NEED_BUILD_IMAGE = false

export const PLUGIN_DEFAULT_CONFIG = {
  ['elasticsearch-logging']:{
    cpu: 0.5,
    memory: 500
  },
  ['kube-dns']: {
    cpu: 0.1,
    memory: 179
  },
  prometheus: {
    cpu: 0.1,
    memory: 500
  },
  heapster: {
    cpu: 0.1,
    memory: 200
  }
}
export const DEFAULT_SHARE_DIR = '/enncloud-tmp-dir'
