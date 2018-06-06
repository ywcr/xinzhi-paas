/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Quick Entry component
 *
 * v0.1 - 2017-05-17
 * @author ZhangChengZheng
 */
import React, { Component, PropTypes } from 'react'
import './style/QuickEntry.less'
import { Row, Col, Tooltip } from 'antd'
import DatabaseImg from '../../assets/img/quickentry/database.png'
import ImageImg from '../../assets/img/setting/globalconfigmirror.png'
import AppImg from '../../assets/img/quickentry/app.png'
import DockerImg from '../../assets/img/quickentry/docker.png'
import QuickImg from '../../assets/img/quickentry/quick.png'
import GuideImg from '../../assets/img/quickentry/guide.png'
import APIImg from '../../assets/img/quickentry/API.png'
import QuestionImg from '../../assets/img/quickentry/question.png'
import EnterpriseImg from '../../assets/img/quickentry/enterprise.png'
import { browserHistory, Link } from 'react-router'
import InfrastructureImg from '../../assets/img/quickentry/infrastructure.png'
import DeployEnvModal from '../DeployEnvModal'
import { NEED_BUILD_IMAGE } from '../../constants'

class QuickEntry extends Component {
	constructor(props){
    super(props)
    this.handleDatabase = this.handleDatabase.bind(this)
    this.state = {
      deployEnvModalVisible: false,
    }
  }

  handleDatabase(){
    browserHistory.push('/database_cache/rdbs_cluster?createDatabase')
  }
handleOpendeveloper(){
	const thisUrl = window.location.hostname
    window.open('https://'+thisUrl+':9004/developer')
}
handleOpenquick(){
	const thisUrl = window.location.hostname
    window.open('https://'+thisUrl+':9004/quick-start')
}
handleOpenguide(){
	const thisUrl = window.location.hostname
    window.open('https://'+thisUrl+':9004/guide')
}
handleOpenfaq(){
	const thisUrl = window.location.hostname
    window.open('https://'+thisUrl+':9004/faq')
}

  render(){
    return(
      <div id="quickentry">
        <div className='quickentry'>
          <div className='header'>
            <div className='title'>快速入口</div>
            <div className='item'>快速入口通过提供平台上主要功能的入口，帮助用户快速了解并使用平台</div>
          </div>
          <div className='main'>
            <Row>
              <Col span={8} className='CreateApp'>
                <div className="item app" onClick={() => this.setState({ deployEnvModalVisible: true })}>
                  <img src={AppImg} alt="" className='img'/>
                  <div className='middle'>创建一个应用</div>
                  <div>通过镜像仓库快速创建一个应用</div>
                </div>
              </Col>
              {NEED_BUILD_IMAGE ?
              <Col span={8} className='CreateImage'>
                <Link to="/ci_cd/build_image?showCard=true">
                  <div className="item image">
                    <img src={ImageImg} alt="" className='img' />
                    <div className='middle'>构建一个镜像</div>
                    <div>无需创建EnnFlow快速构建一个镜像</div>
                  </div>
                </Link>
              </Col> :
                <Col span={8} className='CreateImage'>
                  <Link to="/ci_cd/enn_flow?showCard=true">
                    <div className="item image">
                      <img src={ImageImg} alt="" className='img' />
                      <div className='middle'>构建一个镜像</div>
                      <div>使用EnnFlow快速构建一个镜像</div>
                    </div>
                  </Link>
                </Col>
              }
              <Col span={8}>
                <div className="item database" onClick={this.handleDatabase}>
                  <img src={DatabaseImg} alt="" className='img'/>
                  <div className='middle'>创建一个数据库与缓存</div>
                  <div>快速创建一个原生数据库集群环境</div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
        <div className='practiceandcourse'>
          <div className="header">
            <div className="title">最佳实践与教程</div>
            <div className="item">借助开发者之旅、快速上手、用户指南、常见问题学习部署您的解决方案</div>
          </div>
          <div className='main'>
            <div className='leftbox'>
              <Row>
                <Col span={8}>
                  <a onClick={this.handleOpendeveloper} target="_blank">
                    <div className="item bordernone docker">
                      <img src={DockerImg} alt=""/>
                      <div className='middle'>开发者Docker之旅</div>
                      <div className='bottom'>包括实践教程、最佳案例、技术解析、开发工具等</div>
                    </div>
                  </a>
                </Col>
                <Col span={8}>
                  <a onClick={this.handleOpenquick}  target="_blank">
                    <div className="item bordernone">
                      <img src={QuickImg} alt=""/>
                      <div className='middle'>快速上手指导</div>
                      <div className='bottom'>仅需5分钟就可以掌握容器服务的基本特点</div>
                    </div>
                  </a>
                </Col>
                <Col span={8}>
                  <a onClick={this.handleOpenguide} target="_blank">
                    <div className="item guide">
                      <img src={GuideImg} alt=""/>
                      <div className='middle'>用户指南</div>
                      <div className='bottom'>帮助开发者更快、更好、更高效使用平台的产品</div>
                    </div>
                  </a>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <a onClick={this.handleOpenfaq}  target="_blank">
                    <div className="item bordertop bordernone">
                      <img src={QuestionImg} alt=""/>
                      <div className='middle'>常见问题</div>
                      <div className='bottom'>关于平台使用中的常见问题，让你简单明了的使用</div>
                    </div>
                  </a>
                </Col>
              </Row>
            </div>
            <div className='rightbox'>
              <div className='charts'>
                <span className='title'>基础设施与应用关系</span>
                <div className='imgcontainer'>
                  <img src={InfrastructureImg} alt="" className='img'/>
                </div>
              </div>
              <div className='legend'>
                <div className='container'>
                  <Tooltip title="运行在节点上的基于Docker镜像创建的运行时的实例">
                    <div className="item"><i className="fa fa-cube margin item_container" aria-hidden="true"></i><span className='text'>Container: 容器</span></div>
                  </Tooltip>
                  <Tooltip title="由N个相同镜像和配置定义的容器组成">
                    <div className="item"><i className="fa fa-cubes margin" aria-hidden="true"></i><span className='text'>Service: 服务</span></div>
                  </Tooltip>
                </div>
                <div className='container'>
                  <Tooltip title="安装了Docker的服务器，可运行多个容器">
                    <div className="item"><i className='icon margin node'></i><span className='text'>Node: 节点</span></div>
                  </Tooltip>
                  <Tooltip title="包含一个或多个节点">
                    <div className="item"><i className='icon margin cluster'></i><span className='text'>Cluster: 集群</span></div>
                  </Tooltip>
                  <Tooltip title="可以包含N个相同或不同的服务">
                    <div className="item"><i className='icon margin app'></i><span className='text'>APP: 应用</span></div>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DeployEnvModal
          title="选择部署环境"
          visible={this.state.deployEnvModalVisible}
          onCancel={() => this.setState({ deployEnvModalVisible: false })}
          onOk={() => browserHistory.push('/app_manage/app_create/quick_create')}
        />
      </div>
    )
  }
}

export default QuickEntry;
