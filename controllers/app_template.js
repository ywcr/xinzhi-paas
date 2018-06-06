/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * App template controller
 *
 * v0.1 - 2016-10-28
 * @author Lei
*/
'use strict'

const apiFactory = require('../services/api_factory')
const logger     = require('../utils/logger.js').getLogger("app_template")
const markdown   = require('markdown-it')()
/*
List user templates based on router, not content(yaml) will be returned
filter=owned will list user/space templates
filter=dbservice will list service of database & cache
filter=appstore will list tempaltes of AppStore
other value will only list public ones
*/
exports.listTemplates = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var filter = query.filter
  const api = apiFactory.getTemplateApi(loginUser)
  const result = yield api.get({"filter": filter})
  this.body = {
    data: result
  }
}
/*
Get one template
*/
exports.getTemplate = function* () {
  const loginUser = this.session.loginUser
  const templateid = this.params.templateid

  const api = apiFactory.getTemplateApi(loginUser)
  if (!templateid) {
    const err = new Error('Template ID is required.')
    err.status = 400
    throw err
  }

  const result = yield api.getBy([templateid])
  if (result && result.data.type == 3) {
    // Convert to markdown if it's appstore
    result.data.description = markdown.render(result.data.description)
  }

  this.body = {
    data: result
  }
}
/*
Create a new template
*/
exports.createTemplate = function* () {
  const loginUser = this.session.loginUser

  const api = apiFactory.getTemplateApi(loginUser)
  const template = this.request.body
  if (!template || !template.name || !template.content) {
    const err = new Error('Template name/content is required.')
    err.status = 400
    throw err
  }
  const result = yield api.create(template)

  this.body = {
    data: result
  }
}
/*
Update an existing template
*/
exports.updateTemplate = function* () {
  const loginUser = this.session.loginUser
  const templateid = this.params.templateid

  const api = apiFactory.getTemplateApi(loginUser)
  const template = this.request.body
  if (!template || !template.name || !template.content) {
    const err = new Error('Template name/content is required.')
    err.status = 400
    throw err 
  }
  const result = yield api.update(templateid, template)

  this.body = {
    data: result
  }
}

/*
Delete a template
*/
exports.deleteTemplate = function* () {
  const loginUser = this.session.loginUser
  const templateid = this.params.templateid

  const api = apiFactory.getTemplateApi(loginUser)
  const result = yield api.delete(templateid)

  this.body = {
    data: result
  }
}
exports.deleteAppTemplate = function* () {
  const query = this.query||{}
    const loginUser = this.session.loginUser
    const templateid = this.params.templateid

    const api = apiFactory.getTemplateApi(loginUser)
    const result = yield api.deleteBy([templateid],query)
    this.body = {
        data: result
    }
}