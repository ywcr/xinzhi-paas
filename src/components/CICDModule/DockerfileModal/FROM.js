/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Docker file modal editor: FROM
 * v0.1 - 2017-07-05
 * @author Zhangpc
 */

import React from 'react'
import { Form, Alert, Input, Select, Row, Col } from 'antd'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import { loadProjectList, loadProjectRepos, loadRepositoriesTags, loadRepositoriesTagConfigInfo } from '../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../constants'
import NotificationHandler from '../../../common/notification_handler'

const FormItem = Form.Item
const Option = Select.Option
const notification = new NotificationHandler()
const PROJECT_ID = camelize('project_id')

const FROM = React.createClass({
  getInitialState() {
    return {}
  },
  componentWillMount() {
    const { loadProjectList } = this.props
    loadProjectList(DEFAULT_REGISTRY, { page_size: 100 })
  },
  componentWillReceiveProps(nextProps) {
    const { imageTagConfig, callback, form } = nextProps
    let imageConfig = {}
    if (imageTagConfig) {
      const tag = form.getFieldValue('tag')
      if (imageTagConfig[tag]) {
        imageConfig = imageTagConfig[tag] || {}
        let mountPath = imageConfig.mountPath || {}
        mountPath = Object.keys(mountPath)
        callback({ mountPath, server: imageTagConfig.server })
      }
    }
  },
  onHarborProjectChange(value) {
    if (value === 'imageUrl') {
      return
    }
    const { form, harborProjects, loadProjectRepos } = this.props
    let targetProject
    (harborProjects.list || []).every(project => {
      if (project.name === value) {
        targetProject = project
        return false
      }
      return true
    })
    if (!targetProject) {
      notification.warn('项目未找到')
      return
    }
    form.resetFields([ 'image', 'tag' ])
    loadProjectRepos(DEFAULT_REGISTRY, { page_size: 100, project_id: targetProject[PROJECT_ID] })
  },
  onImageChange(image) {
    const { form, loadRepositoriesTags } = this.props
    const { getFieldProps, getFieldValue, resetFields } = form
    const harborProject = getFieldValue('harborProject')
    const imageName = `${harborProject}/${image}`
    resetFields([ 'tag' ])
    loadRepositoriesTags(DEFAULT_REGISTRY, imageName)
  },
  onTagChange(tag) {
    const { form, loadRepositoriesTagConfigInfo } = this.props
    const { getFieldProps, getFieldsValue, resetFields } = form
    const { harborProject, image } = getFieldsValue([ 'harborProject', 'image' ])
    const imageName = `${harborProject}/${image}`
    loadRepositoriesTagConfigInfo(DEFAULT_REGISTRY, imageName, tag)
  },
  render() {
    const { formItemLayout, form, harborProjects, repos, imageTags, imageTagConfig } = this.props
    const { getFieldProps, getFieldValue } = form
    const harborProjectProps = getFieldProps('harborProject', {
      rules: [
        { required: true, message: '请选择仓库组' },
      ],
      onChange: this.onHarborProjectChange
    })
    const harborProject = getFieldValue('harborProject')
    let imageProps
    let tagProps
    let imageUrlProps
    let image
    let tag
    if (harborProject !== 'imageUrl') {
      imageProps = getFieldProps('image', {
        rules: [
          { required: true, message: '请选择该仓库组内镜像' },
        ],
        onChange: this.onImageChange,
      })
      tagProps = getFieldProps('tag', {
        rules: [
          { required: true, message: '请选择镜像版本' },
        ],
        onChange: this.onTagChange,
      })
      image = getFieldValue('image')
      tag = getFieldValue('tag')
    } else {
      imageUrlProps = getFieldProps('imageUrl', {
        rules: [
          { required: true, message: '请填写镜像地址' },
        ],
      })
    }
    let tags = []
    if (imageTags && imageTags[`${harborProject}/${image}`]) {
      tags = imageTags[`${harborProject}/${image}`].tag || []
    }
    let imageConfig = {}
    if (imageTagConfig && imageTagConfig[tag]) {
      imageConfig = imageTagConfig[tag] || {}
    }
    let cmd = imageConfig.cmd
    let containerPorts = imageConfig.containerPorts
    let mountPath = imageConfig.mountPath || {}
    mountPath = Object.keys(mountPath)
    return (
      <div>
        <FormItem
          {...formItemLayout}
          wrapperCol={{ span: 8 }}
          label="选择镜像(FROM)"
        >
          <Select
            placeholder="选择仓库组"
            {...harborProjectProps}
            showSearch
            optionFilterProp="children"
          >
            <Option key="imageUrl">填写镜像地址</Option>
            {
              (harborProjects.list || []).map(project =>  (
                  <Option key={project.name}>
                    {project.name}
                  </Option>
                )
              )
            }
          </Select>
        </FormItem>
        {
          imageProps && (
            <Row>
              <Col span={formItemLayout.labelCol.span}></Col>
              <Col span={8}>
                <FormItem>
                  <Select
                    placeholder="选择该仓库组内镜像"
                    {...imageProps}
                    showSearch
                    optionFilterProp="children"
                  >
                    {
                      (repos.list || []).map(repo =>  {
                        repo = repo.replace(`${harborProject}/`, '')
                        return (
                          <Option key={repo}>
                            {repo}
                          </Option>
                        )}
                      )
                    }
                  </Select>
                </FormItem>
              </Col>
              <Col span={8} style={{paddingLeft: '16px'}}>
                <FormItem>
                  <Select
                    placeholder="选择镜像版本"
                    {...tagProps}
                    showSearch
                    optionFilterProp="children"
                  >
                    {
                      tags.map(tag => <Option key={tag}>{tag}</Option>)
                    }
                  </Select>
                </FormItem>
              </Col>
            </Row>
          )
        }
        {
          imageUrlProps && (
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 16 }}
              label=" "
            >
              <Input placeholder="填写镜像地址" {...imageUrlProps} />
            </FormItem>
          )
        }
        {
          tag && (
            <FormItem
              {...formItemLayout}
              wrapperCol={{ span: 12 }}
              label=" "
            >
              <Alert
                message={
                  <div className="imageConfigs">
                    <p>
                      开放端口：
                      {
                        containerPorts && containerPorts.length > 0
                        ? containerPorts.join(', ')
                        : '无'
                      }
                    </p>
                    <p>
                      数据存储卷：
                      {
                        mountPath && mountPath.length > 0
                        ? mountPath.join(', ')
                        : '无'
                      }
                    </p>
                    <p>
                      命令：
                      {
                        cmd && cmd.length > 0
                        ? cmd.join(', ')
                        : '无'
                      }
                    </p>
                  </div>
                }
                type="success"
              />
            </FormItem>
          )
        }
      </div>
    )
  }
})

function mapStateToProps(state, ownProps) {
  const { harbor } = state
  const { projects, repos, imageTags, imageTagConfig } = harbor
  const harborProjects = projects && projects[DEFAULT_REGISTRY] || {}
  return {
    harborProjects,
    repos,
    imageTags: imageTags && imageTags[DEFAULT_REGISTRY] || {},
    imageTagConfig: imageTagConfig && imageTagConfig[DEFAULT_REGISTRY] || {},
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
  loadProjectRepos,
  loadRepositoriesTags,
  loadRepositoriesTagConfigInfo,
})(FROM)
