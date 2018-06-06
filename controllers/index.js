/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index controller
 *
 * v0.1 - 2016-09-05
 * @author Zhangpc
 */
'use strict'

exports.index = function* () {
  let method = 'index'
  let title = this.t('common:console')
  yield this.render(global.indexHtml, { title, body: '' })
}