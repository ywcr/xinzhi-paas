/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DetailInfo component
 *
 * v0.1 - 2016-10-09
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Card, Button, Icon, message } from 'antd'
import './style/DetailInfo.less'
import MarkdownEditor from '../../../Editor/Markdown'
import NotificationHandler from '../../../../common/notification_handler'

export default class DetailInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editor: false,
      detailInfo: ''
    }
  }
  handEdit() {
    this.setState({
      editor: true,
      detailInfo: this.props.scope.props.imageInfo.detail
    })
  }
  onChangeDockerFile(e) {
    //this functio for the editor ccallback
    this.setState({
      detailInfo: e
    })
  }
  updateImageInfo() {
    const { updateImageinfo, getImageDetailInfo} = this.props.scope.props
    const image = this.props.detailInfo.name
    const _this = this
    const config = {
      image,
      fullName: image,
      registry: this.props.registry,
      body: { detail: this.state.detailInfo }
    }
    const scope = this.props.scope
    let notification = new NotificationHandler()
    notification.spin(`更新镜像 ${image} 信息中...`)
    updateImageinfo(config, {
      success: {
        func: (res) => {
          notification.close()
          notification.success(`更新镜像 ${image} 信息成功`)
          getImageDetailInfo(config, {
            success: {
              func: (res) => {
                scope.setState({
                  imageInfo: res.data
                })
              }
            }
          })
          _this.setState({
            editor: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (error) => {
          notification.close()
          notification.error(`更新镜像 ${image} 信息失败`)
          _this.setState({
            editor: false
          })
        }

      }
    })
  }
  render() {
    let { detailMarkdown } = this.props.detailInfo
    const detailInfo = this.state.detailInfo
    if (detailMarkdown == '' || !detailMarkdown) {
      detailMarkdown = '还没有添加详细信息'
    }
    const editorOptions = {
      readOnly: false
    }
    return (
      <Card className="imageDetailInfo markdown">
        {(this.props.isOwner && !this.state.editor) ?
          <Button style={{ float: 'right', top: '-8px' }} onClick={() => this.handEdit()}><Icon type="edit" />&nbsp;编辑</Button>
          : null
        }
        {this.state.editor ?
          <div className="editInfo">
            <MarkdownEditor title="基本信息" value={detailInfo} callback={this.onChangeDockerFile.bind(this)} options={editorOptions} />
            <div style={{ lineHeight: '50px' }} className="text-center">
              <Button size="large" type="ghost" onClick={() => this.setState({ editor: false })} style={{ marginRight: '10px' }}>取消</Button>
              <Button size="large" type="primary" onClick={() => this.updateImageInfo()}>确定</Button>
            </div>
          </div>
          :
          <div dangerouslySetInnerHTML={{ __html: detailMarkdown }}></div>
        }
      </Card>
    )
  }
}

DetailInfo.propTypes = {
  //
}
