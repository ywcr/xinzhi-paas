/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster plugin component
 *
 * v2.2 - 2017-5-3
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Menu, Button, InputNumber, Card, Form, Select, Input, Dropdown, Spin, Modal, Icon, Row, Col, Table } from 'antd'
import './style/clusterPlugin.less'
import './style/clusterLabelManege.less'
import { getClusterPlugins, updateClusterPlugins } from '../../actions/cluster'
import NotificationHandler from '../../common/notification_handler'
import { PLUGIN_DEFAULT_CONFIG } from '../../constants/index'
import { camelize } from 'humps'
import { deleteMiddleware, updateMiddleware, createMiddleware } from '../../actions/cluster'
import { getAllClusterNodes } from '../../actions/cluster_node'
import openUrl from '../../assets/img/icon/openUrl.svg'

const Option = Select.Option

class ClusterPlugin extends Component {
  constructor(prop) {
    super(prop)
    this.state = {
      maxCPU: 4,
      maxMem: 2048
    }
  }
  loadData() {
    const { getClusterPlugins, cluster } = this.props
    if (cluster) {
      getClusterPlugins(cluster.clusterID)
    }

  }
  componentWillMount() {
    const { getAllClusterNodes, cluster } = this.props
    getAllClusterNodes(cluster.clusterID)
    this.loadData()
  }
  onChange(value) {
  }
  convertCPU(cpu) {
    if (cpu) {
      return (cpu / 1000).toFixed(1) + '核'
    }
    return '无限制'
  }
  convertMemory(memory) {
    if (!memory) return '无限制'
    let size = 'M'
    memory = memory / 1024
    if (memory > 1024) {
      size = 'G'
      memory = (memory / 1024).toFixed(0)
      return memory + size
    } else {
      return memory.toFixed(0) + size
    }
  }
  getStatusColor(status, name) {
    switch (status) {
      case 'normal': {
        return '#33b867'
      }
      case 'warning': {
        if (name == 'elasticsearch-logging-v1') {
          return '#33b867'
        }
        return '#F3575A'
      }
      default:
        return 'orange'
    }
  }
  getStatusMessage(status, name) {
    switch (status) {
      case 'normal': {
        return '正常'
      }
      case 'uninstalled': {
        return '未安装'
      }
      case 'abnormal': {
        return '不正常'
      }
      case 'warning': {
        if (name == 'elasticsearch-logging-v1') {
          return '正常'
        }
        return '报警'
      }
      case 'stopped': {
        return '已停止'
      }
      default:
        return '未知'
    }
  }
  startPlugin(row,type) {
    const cluster = this.props.cluster.clusterID
    const operation = type == 'stop' ? '停止' : '启动'
    const notify = new NotificationHandler()
    const pluginNames = row.pluginNames.join(',')
    notify.spin(`${operation}插件 ${pluginNames} 中`)
    this.props.updateMiddleware(row, type, {
      success: {
        func: () => {
          notify.close()
          notify.success(`${operation}插件 ${pluginNames} 成功`)
          this.props.getClusterPlugins(cluster)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.close()
          notify.error( `${operation}插件 ${pluginNames} 失败`)
        }
      }
    })

  }
  getStateusForEvent(row) {
    if (row.status.message == 'abnormal' && row.status.code == '503') {
      return (<Button type="primary" onClick={() => this.showResetModal(row)}>重新安装</Button>)
    }
    if (row.status.message == 'uninstalled' && row.status.code == '503') {
      return (<Button type="primary" onClick={() => this.installPlugin(row)}>安装插件</Button>)
    }
  }
  getStateusForEventa(row) {
    if (row.status.message == 'abnormal' && row.status.code == '503') {
      return (<Menu.Item key="install"><span onClick={() => this.showResetModal(row)}>重新安装</span></Menu.Item>)
    }
    if (row.status.message == 'uninstalled' && row.status.code == '503') {
      return (<Menu.Item key="install"><span onClick={() => this.installPlugin(row)}>安装插件</span></Menu.Item>)
    }
  }
  showResetModal(plugin) {
    this.setState({
      currentPlugin: plugin,
      reset: true
    })
  }
  showSetModal(plugin) {
    this.setState({
      currentPlugin: plugin,
      setModal: true
    })
  }
  installPlugin(row) {
    const notify = new NotificationHandler()
    if(row.status.code != 503 && row.status.message != 'uninstalled') {
      notify.error('该插件已安装')
      return
    }
    const { createMiddleware, cluster } = this.props
    const self = this
    notify.spin('安装插件中')
    createMiddleware(cluster.clusterID, {
      pluginName: row.name,
      template: row.templateID,
    }, {
      success: {
        func: () => {
          notify.close()
          notify.success(`插件${row.name}安装成功`)
          self.loadData()
          return
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.close()
          notify.error(`插件${row.name}安装失败`)
          return
        }
      }
    })
  }

  resetPlugin(isReset) {
    if (this.state.currentPlugin) {
      this.setState({
        reset: false
      })
      const notify = new NotificationHandler()
      notify.spin('插件重新部署请求中')
      const { cluster, updateClusterPlugins } = this.props
      updateClusterPlugins(cluster.clusterID, this.state.currentPlugin.name, {
        reset: true
      }, {
          success: {
            func: () => {
              notify.close()
              notify.success('插件重新部署请求成功')
              this.loadData()
            },
            isAsync: true
          },
          failed: {
            func: () => {
              notify.close()
              notify.error('插件重新部署请求失败')
            }
          }
        })
    }
  }
  updateClusterPlugins() {
    if (this.state.currentPlugin) {
      const { cluster, form, updateClusterPlugins } = this.props
      this.setState({
        setModal: false
      })
      const self = this
      form.validateFields((err, value) => {
        if (err) {
          return
        }
        this.setState({
          setModal: false
        })
        const notify = new NotificationHandler()
        const { getFieldValue } = form
        const cpu = getFieldValue('pluginCPU')
        const memory = getFieldValue('pluginMem')
        const hostName = getFieldValue('selectNode')
        notify.spin('更新插件配置中')
        updateClusterPlugins(cluster.clusterID, this.state.currentPlugin.name, {
          cpu,
          memory,
          hostName: hostName == 'random' ? '' : hostName
        }, {
            success: {
              func: () => {
                notify.close()
                form.resetFields()
                notify.success('插件配置更新成功')
                self.loadData()
              },
              isAsync: true
            },
            failed: {
              func: () => {
                notify.close()
                notify.error('插件配置更新失败')
              }
            }
          })
      })
    }
  }
  getDefaultConfig() {
    const { form } = this.props
    const pluginName = this.state.currentPlugin.name
    const pluginCPU = PLUGIN_DEFAULT_CONFIG[pluginName] ? PLUGIN_DEFAULT_CONFIG[pluginName].cpu : 0
    const pluginMem = PLUGIN_DEFAULT_CONFIG[pluginName] ? PLUGIN_DEFAULT_CONFIG[pluginName].memory : 0
    form.setFieldsValue({
      pluginMem,
      pluginCPU
    })
  }
  getSelectItem() {
    const { nodeList, cluster } = this.props
    const clusterID = cluster.clusterID
    if (nodeList.isEmptyObject) {
      return <div key="null"></div>
    }
    if (nodeList[clusterID].isFetching) {
      return <Card id="Network" className="ClusterInfo">
        <div className="h3">节点</div>
        <div className="loadingBox" style={{ height: '100px' }}><Spin size="large"></Spin></div>
      </Card>
    }
    const { clusters } = nodeList[clusterID].nodes
    if (!clusters) {
      return <Option key="notclsuter">暂无数据</Option>
    }
    const nodes = nodeList[clusterID].nodes.clusters.nodes.nodes
    const items = []
    items.push(<Option key={'random'} value={'random'}>随机调度</Option>)
    Array.isArray(nodes) && nodes.forEach(node => {
      if(!node.schedulable || node.isMaster) return
      return items.push(<Option key={node.objectMeta.name} value={node.objectMeta.name}>{node.objectMeta.name}</Option>)
    })
    return items
  }
  getTableItem() {
    const { clusterPlugins } = this.props
    if (clusterPlugins && clusterPlugins.data) {
      const plugins = clusterPlugins.data
      let pluginsNames = []
      for (let key in plugins) {
        pluginsNames.push(plugins[key])
      }
      return pluginsNames
    }
    return []
  }
  cancleSet() {
    const { form } = this.props
    this.setState({
      setModal: false
    })
    form.resetFields()
  }
  setInputCPU(value) {
    const notify = new NotificationHandler()
    if (value > this.state.maxCPU) {
      this.setState({ inputCPU: this.state.maxCPU })
      notify.error('输入的CPU数值已超出节点最大数值')
      return
    }
    this.setState({ inputCPU: value })
  }
  handleMenuClick(key, row) {
    this.setState({
      key,
      plugins: row.name,
      action: true
    })

  }
  handPlugins() {
    const cluster = this.props.cluster.clusterID
    const body = {
      pluginNames: Array.isArray(this.state.plugins) ? this.state.plugins : [this.state.plugins],
      cluster: cluster
    }
    setTimeout(() => {
      this.setState({ action: false })
    }, 300)
    const notify = new NotificationHandler()
    if (this.state.key == 'stop') {
      this.startPlugin(body,'stop')
      return
    }
    if(this.state.key == 'start') {
      this.startPlugin(body, 'start')
      return
    }
    this.props.deleteMiddleware(body, {
      success: {
        func: () => {
          notify.success('删除成功！')
          this.props.getClusterPlugins(cluster)
        },
        isAsync: true
      }
    })

  }

  render() {
    const { clusterPlugins, form, cluster, isFetching } = this.props
    const { getFieldProps } = form
    const selectNode = getFieldProps('selectNode', {
      rules: [{
        validator: (rule, value, callback) => {
          if (!value) {
            return callback('请选择要部署的集群')
          }
          return callback()
        }
      }],
      initialValue: this.state.currentPlugin ? (this.state.currentPlugin.hostName ? this.state.currentPlugin.hostName : 'random') : '',
      onChange: (value) => {
        const { cluster } = this.props
        const { nodeList } = this.props
        if (nodeList) {
          let nodesDetail = nodeList[cluster.clusterID]
          if (nodesDetail) {
            nodesDetail = nodesDetail.nodes.clusters.nodes.nodes
            let nodeDetail = {}
            let minCPU = Infinity
            let minMemory = Infinity
            if (value == 'random') {
              nodesDetail.forEach(node => {
                if (node.cPUAllocatable < minCPU) {
                  minCPU = node.cPUAllocatable
                }
                if (node.memoryAllocatable < minMemory) {
                  minMemory = node.memoryAllocatable
                }
              })
              this.setState({
                maxCPU: minCPU / 1000,
                maxMem: Math.floor(minMemory / 1024)
              })
              return
            }
            nodesDetail.some(node => {
              if (node.objectMeta.name == value) {
                nodeDetail = node
                return true
              }
              return false
            })
            this.setState({
              maxCPU: nodeDetail.cPUAllocatable / 1000,
              maxMem: Math.floor(nodeDetail.memoryAllocatable / 1024)
            })
          }
        }
      }
    })
    let currentMem = this.state.currentPlugin ? (this.state.currentPlugin.resourceRange.request.memory / 1024).toFixed(0) : 0

    if (isNaN(currentMem)) currentMem = 0
    const pluginMem = getFieldProps('pluginMem', {
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value > this.state.maxMem) {
              const notify = new NotificationHandler()
              form.setFieldsValue({
                pluginMem: this.state.maxMem
              })
              notify.error('输入的内存数值超过所选节点最大内存')
            }
            return callback()
          }
        }
      ],
      initialValue: currentMem
    })
    let currentCPU = this.state.currentPlugin ? (this.state.currentPlugin.resourceRange.request.cpu / 1000).toFixed(1) : '0'
    if (isNaN(currentCPU)) currentCPU = 0
    const pluginCPU = getFieldProps('pluginCPU', {
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value > this.state.maxCPU) {
              const notify = new NotificationHandler()
              form.setFieldsValue({
                pluginCPU: this.state.maxCPU
              })
              notify.error('输入的CPU数值超过所选节点最大CPU')
            }
            return callback()
          }
        }
      ],
      initialValue: currentCPU
    })

    const labelcolumns = [
      {
        title: '插件名称',
        key: 'keys',
        dataIndex: 'name',
        width:'18%',
        render: text => text
      },
      {
        title: '插件状态',
        key: 'status',
        dataIndex: 'status',
        width:'16%',
        render: (status, row) => {
          return (
            <div style={{ color: this.getStatusColor(status.message, row.name) }}><i className='fa fa-circle' />&nbsp;&nbsp;{this.getStatusMessage(status.message, row.name)}</div>
          )
        }
      },
      {
        title: '资源限制',
        key: 'resourceRange',
        dataIndex: 'resourceRange',
        width:'17%',
        render: (plugin, row) => {
          return (
            <div><div>CPU：{this.convertCPU(plugin.request.cpu)}</div>
              <div>内存：{this.convertMemory(plugin.request.memory)}</div>
            </div>
          )
        }
      },
      {
        title: '所在节点',
        key: 'templateID',
        dataIndex: 'templateID',
        width:'13%',
        render: (text, row) => {
          return (
            <span>{row.hostName || '随机调度'}</span>
          )
        }
      },
      {
        title: '管理界面',
        key: 'web',
        dataIndex: 'web',
        width:'15%',
        render: (text, row) => {
          if (row.serviceInfo && row.serviceInfo.entryPoints && ['stopped', 'uninstalled'].indexOf(row.status.message) < 0 ) {
            let path = row.serviceInfo.entryPoints[0].path
            const port = row.serviceInfo.entryPoints[0].port
            if(path.indexOf('/') == 0) {
              path = path.substr(1)
            }
            if(path) {
              return (<a href={`/proxy/clusters/${cluster.clusterID}/plugins/${row.name + (port ? ':' + port : '')}/${path}`} target="_blank"><img src={openUrl} className="openUrl" />打开界面</a>)
            }
            return (<a href={`/proxy/clusters/${cluster.clusterID}/plugins/${row.name + (port ? ':' + port : '')}/`} target="_blank"><img src={openUrl} className="openUrl" />打开界面</a>)
          }
          return '--'
        }
      },
      {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        render: (text, row) => {
          let menu
           if(row.status.message == 'stopped') {
             menu = (
               <Menu onClick={(e) => this.handleMenuClick(e.key, row)}>
                 <Menu.Item key="start">启动插件</Menu.Item>
                 <Menu.Item key="delete">卸载插件</Menu.Item>
               </Menu>
             )
           } else {
             menu = (
               <Menu onClick={(e) => this.handleMenuClick(e.key, row)}>
                 <Menu.Item key="stop">停止插件</Menu.Item>
                 <Menu.Item key="delete">卸载插件</Menu.Item>
               </Menu>
             )
           }
          let menua
          if(row.status.message == 'stopped') {
             menua = (
               <Menu className="Settingplugin">
                 <Menu.Item onClick={(e) => this.handleMenuClick(e.key, row)} key="start">启动插件</Menu.Item>
                 <Menu.Item onClick={(e) => this.handleMenuClick(e.key, row)} key="delete">卸载插件</Menu.Item>
                 {this.getStateusForEventa(row)}
               </Menu>
             )
           } else {
             menua = (
               <Menu className="Settingplugin">
                 <Menu.Item onClick={(e) => this.handleMenuClick(e.key, row)} key="stop">停止插件</Menu.Item>
                 <Menu.Item onClick={(e) => this.handleMenuClick(e.key, row)} key="delete">卸载插件</Menu.Item>
                 {this.getStateusForEventa(row)}
               </Menu>
             )
           }
          const result = (row.serviceInfo && row.serviceInfo.isSystem) ? <div className="pluginAction"> <span className="button">
              {this.getStateusForEvent(row)}
            </span>
              <Button style={{backgroundColor:'#fff'}} onClick={() => this.showSetModal(row)} overlay={{}}>设置插件</Button></div> : <div className="pluginAction">
             <div className="Settingplugina">
               <span className="button">
                {this.getStateusForEvent(row)}
               </span>
               <Dropdown.Button onClick={() => this.showSetModal(row)} overlay={menu} type="ghost">
                 设置插件
               </Dropdown.Button>
             </div>
             <div className="Settingpluginb">
               <Dropdown.Button onClick={() => this.showSetModal(row)} overlay={menua} type="ghost">
                 设置插件
               </Dropdown.Button>
             </div>
             {/*<Button type="primary" onClick={() => this.showResetModal(row.name)}>重新部署</Button>
              <Button className="setup" type="ghost" onClick={()=> this.showSetModal(row.name)}>设置</Button>*/}
           </div>
           return result
        }
      }
    ]
    return (
      <div id="cluster_clusterplugin">
        <div className="alertRow">集群插件：使用以下插件可以分别使平台中的日志、发现服务、监控等可用；在这里可以重新部署插件，可以切换插件所在节点，还可以设置CPU、内存在集群中资源的限制。</div>

        <div className='ClusterListCard' id="cluster__labelmanage">
          <div className='operaBox'>
            <Button type="primary" size="large" onClick={() => this.loadData()} className='titlebutton'><i className='fa fa-refresh' /> 刷新</Button>
          </div>
          <br />
          <Table
            className="labelmanage__content"
            columns={labelcolumns}
            dataSource={this.getTableItem()}
            pagination={false}
            loading={isFetching}
          />
        </div>
        <Modal
          title={this.state.key == 'stop' ? '停止插件' : (this.state.key == 'start' ? '启动' : '卸载')}
          wrapClassName="vertical-center-modal"
          visible={this.state.action}
          onOk={() => this.handPlugins()}
          onCancel={() => this.setState({ action: false })}
        >
          <div className="confirmText">确定要{this.state.key == 'stop' ? '停止插件' : (this.state.key == 'start' ? '启动' : '卸载')} {this.state.plugins} 此插件吗?</div>
        </Modal>
        <Modal
          title="重新部署操作"
          wrapClassName="vertical-center-modal"
          visible={this.state.reset}
          onOk={() => this.resetPlugin()}
          onCancel={() => this.setState({ reset: false })}
        >
          <div className="confirmText">确定重新部署 {this.state.currentPlugin ? this.state.currentPlugin.name : ''} 插件吗?</div>
        </Modal>
        <Modal
          title="设置节点及资源限制"
          wrapClassName="vertical-center-modal"
          visible={this.state.setModal}
          onOk={() => this.updateClusterPlugins()}
          onCancel={() => this.cancleSet()}
        >
          <div className="alertRow" style={{ fontSize: '12px' }}><div>选择插件所在节点并设置该插件在本集群中可用的CPU和内存的限制；系统默认给出的值为最佳设置值，<span style={{ fontWeight: 'bold' }}>推荐使用默认设置</span>。</div>
            <div>设置为 <span style={{ fontWeight: 'bold' }}>0</span> 时表示无限制；设置时请参考所选节点的资源上限设置该插件的资源限制；</div></div>
          <Form>
            <Form.Item
              id="select"
              style={{ borderBottom: '1px solid #ededed', paddingBottom: '30px' }}
            >
              <span className="setLimit">选择节点</span>
              <Select {...selectNode} size="large" style={{ width: 200 }} disabled={this.state.currentPlugin && this.state.currentPlugin.serviceInfo.isDeamonSet}>
                {this.getSelectItem()}
              </Select>
            </Form.Item>
            <Form.Item>
              <span className="setLimit">设置限制</span><span>CPU</span><Button className="recovery" type="ghost" size="small" onClick={() => this.getDefaultConfig()}><Icon type="setting" />恢复默认设置</Button>
              <div style={{ marginLeft: '70px' }}>
                <InputNumber {...pluginCPU} style={{ width: 200 }} min={0} step={0.1} /> 核
                </div>
            </Form.Item>
            <Form.Item>
              <span style={{ marginLeft: '70px' }}>内存</span>
              <div style={{ marginLeft: '70px' }}>
                <InputNumber {...pluginMem} style={{ width: 200 }} min={0} step={1} /> M
                </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}

function mapStateToProp(state, props) {
  const { clusterID } = props.cluster
  const defaultNodeList = {
    [clusterID]: {
      isFetching: false,
      isEmptyObject: true,
      nodes: {}
    }
  }
  let allNode = state.cluster_nodes.getAllClusterNodes
  if (!allNode || !allNode[clusterID]) {
    allNode = defaultNodeList
  }
  const defaultClusterPlugins = {

  }
  let isFetching = false
  let clusterPlugins = state.cluster.clusterPlugins && state.cluster.clusterPlugins.result && state.cluster.clusterPlugins.result[camelize(props.cluster.clusterID)]
  if (!clusterPlugins) {
    clusterPlugins = defaultClusterPlugins
  }
  if(state.cluster.clusterPlugins) {
    isFetching = state.cluster.clusterPlugins.isFetching
  }
  return {
    nodeList: allNode,
    clusterPlugins,
    isFetching
  }
}

export default connect(mapStateToProp, {
  deleteMiddleware,
  updateMiddleware,
  createMiddleware,
  getClusterPlugins,
  updateClusterPlugins,
  getAllClusterNodes,
})(Form.create()(ClusterPlugin))

