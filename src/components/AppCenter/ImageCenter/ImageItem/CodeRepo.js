/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CodeRepo component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Tabs, Menu, Dropdown, Table, Icon, Button, Card, Input ,Spin,Alert} from 'antd'
import { Link, browserHistory } from 'react-router'
import { camelize } from 'humps'
import { loadProjectRepos, deleteRepo } from '../../../../actions/harbor'
import NotificationHandler from '../../../../common/notification_handler'
import '../style/CodeRepo.less'
import ProjectDetail from '../ProjectDetail'

const notification = new NotificationHandler()

class CodeRepo extends Component {
  constructor(props) {
    super()
    this.state = {
      downloadModalVisible: false,
      uploadModalVisible: false,
      imageDetailModalShow: false,
      searchInput: '',
      deleteRepoVisible: false,
      selectedRepo: '',
      visible: false,
    }
    this.DEFAULT_QUERY = {
      page: 1,
      page_size: 10,
      project_id: props.params.id,
      detail: 1,
    }
    this.closeImageDetailModal= this.closeImageDetailModal.bind(this)
    this.deleteRepoOk= this.deleteRepoOk.bind(this)
    this.loadRepos = this.loadRepos.bind(this)
    this.searchProjects = this.searchProjects.bind(this)
  }

  componentWillMount() {
    const { params } = this.props
    this.loadRepos()
    const imagename = location.search.split('imageName=')[1]
    if (imagename !== '' && imagename !== undefined) {
      this.setState({
        imageDetailModalShow: true,
        currentImage: {name:imagename}
      })
    }
  }
  componentDidUpdate() {
    let searchInput = document.getElementsByClassName('search')[0]
    searchInput && searchInput.focus()
  }
  loadRepos(query) {
    const { loadProjectRepos, registry } = this.props
    loadProjectRepos(registry, Object.assign({}, this.DEFAULT_QUERY, query))
  }

  deleteRepoOk() {
    this.setState({
    confirmLoading: true,
    });
    const { deleteRepo } = this.props
    const { selectedRepo } = this.state
    const doSuccess = () => {
      notification.success(`镜像 ${selectedRepo} 删除成功`)
      this.setState({
        deleteRepoVisible: false,
        confirmLoading: false,
      })
      this.loadRepos()
    }
    let processedImageName = processImageName(selectedRepo)
    deleteRepo(this.DEFAULT_QUERY, processedImageName, {
      success: {
        func: () => {
          doSuccess()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode === 404) {
            doSuccess()
            return
          }
          if (statusCode === 403) {
            notification.warn(`您没有权限删除该镜像`)
            this.setState({
              deleteRepoVisible: false,
            })
            return
          }
          notification.error(`镜像删除失败`)
        },
      }
    })
  }

  searchProjects() {
    const { registry } = this.props
    this.loadRepos({ q: this.state.searchInput })
  }

  showUpload(visible) {
    this.setState({uploadModalVisible:visible})
  }

  showDownload(visible) {
    this.setState({downloadModalVisible:visible})
  }

  showImageDetail (item) {
    this.setState({
      imageDetailModalShow: true,
      currentImage: item
    });
  }
  showImageDetailPush(item,server){
    browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${server}&imageName=${item.name}`)
    this.setState({
      currentImage:item
    })
  }


  closeImageDetailModal(){
    this.setState({imageDetailModalShow:false})
  }

  render() {
    const { repos, projectDetail } = this.props
    let { isFetching, list, server, total } = repos || {}
    list = list || []
    server = server || ''
    server = server.replace('http://', '').replace('https://', '')
    const columns = [
      {
        title: '镜像名',
        dataIndex: 'name',
        key: 'name',
        width:'33%',
        render: (text, row) => {
          return (
            <div className="imageList">
              <div className="imageBox">
                <svg className='appcenterlogo'>
                  <use xlinkHref='#appcenterlogo' />
                </svg>
              </div>
              <div className="contentBox">
                <span className="title" onClick={()=> this.showImageDetail(row)}>
                  {text.substring(text.indexOf('/') + 1)}
                </span>
              </div>
            </div>
          )
        }
      }, {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
        width:'35%',
        render: (text, row) => {
          return (
            <div className="imgurl">镜像地址：{server}/{row.name}</div>
          )
        }
      }, {
        title: '下载',
        dataIndex: camelize('pull_count'),
        key: camelize('pull_count'),
        width:'14%',
        render: text => {
          return (
            <div>下载次数：{text}</div>
          )
        }
      }, {
        title: '部署',
        dataIndex: 'icon',
        key: 'icon',
        width:'120px',
        render: (text, row) => {
          const dropdown = (
            <Menu onClick={({key}) => {
                if (key === 'delete') {
                  this.setState({
                    visible: true,
                    deleteRepoVisible: true,
                    selectedRepo: row.name
                   
                  })
                }
              }}
              style={{ width: "100px" }}
            >
              <Menu.Item key="delete">
                删除
              </Menu.Item>
            </Menu>
          );
          return (
            <Dropdown.Button overlay={dropdown} type="ghost" trigger={['click']} onClick={()=> this.showImageDetailPush(row,server)}>
              部署服务
            </Dropdown.Button>
          )
        }
      }
    ]
    //browserHistory.push

    const paginationOpts = {
      size: "small",
      pageSize: this.DEFAULT_QUERY.page_size,
      total: total,
      onChange: current => this.loadRepos({ page: current }),
      showTotal: total => `共计： ${total} 条`,
    }

    return (
      <div id="codeRepo">
        <div className="topRow">
          <Button type="primary" size="large" icon="cloud-upload-o" onClick={()=> this.showUpload(true)}>上传镜像</Button>
          <Button type="ghost" size="large" icon="cloud-download-o" onClick={()=> this.showDownload(true)}>下载镜像</Button>
          <Input
            placeholder="按镜像名称搜索"
            className="search"
            size="large"
            onChange={e => this.setState({ searchInput: e.target.value })}
            onPressEnter={this.searchProjects}
          />
          <i className="fa fa-search" onClick={this.searchProjects}></i>
        </div>
        <Table
          showHeader={false}
          className="myImage_item"
          dataSource={list}
          columns={columns}
          pagination={paginationOpts}
          loading={isFetching}
        />
        <Modal title="上传镜像" className="uploadImageModal" visible={this.state.uploadModalVisible} width="800px"
          onCancel={()=> this.showUpload(false)} onOk={()=> this.showUpload(false)}
         >
          <p>1.&nbsp;&nbsp;在本地 docker 环境中输入以下命令进行登录</p>
          <pre className="codeSpan">
            sudo docker login {server}
          </pre>
          <p>2.&nbsp;&nbsp; 然后，对本地需要 push 的 image 进行标记，比如：</p>
          <pre className="codeSpan">
            {`sudo docker tag ubuntu:latest ${server}/${projectDetail.name}/<image name>:<tag>`}
          </pre>
          <p>3.&nbsp;&nbsp;最后在命令行输入如下命令，就可以 push 这个 image 到镜像仓库中了</p>
          <pre className="codeSpan">
            {`sudo docker push ${server}/${projectDetail.name}/<image name>:<tag>`}
          </pre>
        </Modal>
        <Modal title="下载镜像" className="uploadImageModal" visible={this.state.downloadModalVisible} width="800px"
          onCancel={()=> this.showDownload(false)} onOk={()=> this.showDownload(false)}
        >
          <p>在本地 docker 环境中输入以下命令，就可以 pull 一个镜像到本地了</p>
          <p><i className="fa fa-exclamation-triangle"></i>&nbsp;私有镜像需要先 login 后才能拉取</p>
          <pre className="codeSpan">
            {`sudo docker pull ${server}/${projectDetail.name}/<image name>:<tag>`}
          </pre>
          <p><i className="fa fa-exclamation-triangle"></i>&nbsp;为了在本地方便使用，下载后可以修改tag为短标签，比如：</p>
          <pre className="codeSpan">
            sudo docker tag  {server}/{projectDetail.name}/hello-world:latest {projectDetail.name}/hello-world:latest
            </pre>
        </Modal>
        <Modal
          visible={this.state.imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={()=> this.setState({imageDetailModalShow:false})}
        >
          <ProjectDetail params={this.props.params.id} server={server} scope={this} config={this.state.currentImage}/>
        </Modal>
        {/* 删除镜像 Modal */}
        <Modal title="删除镜像" visible={this.state.deleteRepoVisible}
          onCancel={()=> this.setState({deleteRepoVisible:false})}
          onOk={()=> this.deleteRepoOk()}
          confirmLoading={this.state.confirmLoading}
        >
          {this.state.confirmLoading==true? <Spin tip="删除镜像时根据tags数量不同删除时消耗时间略有不同请耐心等待...">
    <Alert message="删除中"
      description={'镜像'+ this.state.selectedRepo+'删除中........'}
      type="info"
    />
  </Spin>: <div className="confirmText">您确定要删除镜像 {this.state.selectedRepo} ?</div>}
          {/* <Spin size="small" />
          <Spin />
          <Spin size="large" /> */}
        </Modal>
      </div>
    )
  }
}

function processImageName(name) {
  let arr = name.split('/')
  if (arr.length > 2) {
    name = arr[0] + '/' + arr[1]
    for (let i = 2; i < arr.length; i++) {
      name += "%2F"

      name += arr[i]
    }
  }
  return name
}
function mapStateToProps(state, props) {
  const { harbor } = state
  return {
    repos: harbor.repos || {},
  }
}

export default connect(mapStateToProps, {
  loadProjectRepos,
  deleteRepo,
})(CodeRepo)
