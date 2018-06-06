/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { Table,  Button, Card, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import '../style/Project.less'
import { Link } from 'react-router'
import DataTable from './DataTable'
import { connect } from 'react-redux'
import { loadProjectList } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../constants'

const DEFAULT_QUERY = {
  page: 1,
  page_size: 10,
  is_public: 1,
}

class PublicProject extends Component {
  constructor(props) {
    super()
    this.loadData = this.loadData.bind(this)
    this.searchProjects = this.searchProjects.bind(this)
    this.state = {
      searchInput: '',
    }
  }
  componentDidUpdate() {
    let inputSearch = document.getElementsByClassName('search')[0];
    inputSearch && inputSearch.focus()
  }
  loadData(query) {
    const { loadProjectList } = this.props
    loadProjectList(DEFAULT_REGISTRY, Object.assign({}, DEFAULT_QUERY, query))
  }

  searchProjects() {
    this.loadData({ project_name: this.state.searchInput })
  }

  componentWillMount() {
    this.loadData({
      is_public: 1,
    })
  }

  render() {
    const { harborProjects, loginUser } = this.props
    const func = {
      scope: this,
      loadData: this.loadData
    }
    return (
      <div className="imageProject">
        <br />
        <QueueAnim>
          <div key="projects">

            <Card className="project">
              <div className="topRow">
                <Input
                  placeholder="按仓库组名称搜索"
                  className="search"
                  size="large"
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={this.searchProjects}
                />
                <i className="fa fa-search" onClick={this.searchProjects}></i>
                {/*{harborProjects.total >0?
                <span className="totalPage">共计：{harborProjects.total} 条</span>
                :null
                }*/}
              </div>
              <DataTable loginUser={loginUser} from="public" dataSource={harborProjects} func={func}/>
            </Card>

          </div>
        </QueueAnim>
      </div>
    )
  }
}


function mapStateToProps(state, props) {
  const { harbor, entities } = state
  let harborProjects = harbor.projects && harbor.projects[DEFAULT_REGISTRY] || {}
  return {
    harborProjects,
    loginUser: entities.loginUser.info,
  }
}

export default connect(mapStateToProps, {
  loadProjectList,
})(PublicProject)
