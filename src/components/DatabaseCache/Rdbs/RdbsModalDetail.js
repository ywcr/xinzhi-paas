/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Databse Cluster detail
 *
 * v2.0 - 2016-10-11
 * @author Bai Yu
 * @change by Gaojian
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classNames from 'classnames'
import { Button, Icon, Spin, Modal, Collapse, Menu, Row, Col, Dropdown, Slider, Timeline, Popover, InputNumber, Tabs, Tooltip, Card, Radio, Select, Form, Table, Progress, Input } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { deleteDatabaseRedis, fetch_backup_list, deleteNodeBackupList, deleteBackupList, putDbClusterDetail, MonitorList, ClearNodeList, MonitorMetricList, loadDbCacheRedisList, MongoDbNodesCluster, RdbsParametersCluster, RdbsModifyParametersCluster, RdbsAddNodeCluster } from '../../../actions/database_cache'
import { getProxy } from '../../../actions/cluster'
import { calcuDate, formatDate } from '../../../common/tools.js'
import Monitor from '../MongoDB/NodesMonitor/monitor'
import NotificationHandler from '../../../common/notification_handler'
import '../style/ModalDetail.less'
import moment from 'moment'

import mysqlImg from '../../../assets/img/database_cache/mysql.png'
import psqlImg from '../../../assets/img/database_cache/psql.jpeg'

const Option = Select.Option;
const Panel = Collapse.Panel;
const ButtonGroup = Button.Group
const TabPane = Tabs.TabPane;
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;


/*==================备份=====================*/
class CreateBackup extends Component {
    constructor(props) {
      super(props)
      this.state = {
        selectedRowKeys: [],
       type: 'rdb'
       }
      this.handleMenuClick = this.handleMenuClick.bind(this)
    }
    componentWillMount() {
        this.props.scope.getBackUpListStatus()
    }

    refreshBackUpList = () => {
        clearInterval(this.props.scope.loadStatusTimeout)
        this.props.scope.getBackUpListStatus()
    }
    componentWillReceiveProps(nextProps) {
        if (!(this.props.isCurrentTab === false && nextProps.isCurrentTab === true)) {
            return
        }
        this.setState({
            selectedRowKeys:[],
            selectedRows:[]
        })
        this.props.scope.getBackUpListStatus()
    }

    componentWillUnmount(){
        this.props.scope.clearTime()
    }
    
    
      CreateBackup = () => {
        const { scope } = this.props.scope.props
        scope.setState({
          backupModalShow: true
        })
      }
     
     handleMenuClick(e) {
        const { deleteBackupList, cluster, currentData, fetch_backup_list } = this.props.scope.props
        let notification = new NotificationHandler()
         const _this=this;

         switch (e.key) {
         case 'delete':
           this.state.selectedRows.map((item, index) => {
             deleteBackupList(cluster, item.snapshotId, {
               success: {
                 func: (res) => {
                   notification.success('删除成功')
                     _this.props.getBackUpListStatus

                     this.setState({
                    selectedRowKeys:[],
                    selectedRows:[]
                  })
                },
                  isAsync: true
                }
             })

        })
        break;
      default:
        return
    }

  }

  render() {
    const { getBackUpList } = this.props.scope.props
    const _this = this;
    let backupList = []
    if (getBackUpList && getBackUpList.snapshotSet && getBackUpList.snapshotSet.length > 0) {
      backupList = getBackUpList.snapshotSet
    }
    const columns = [
      {
        title: '备份链ID',
        dataIndex: 'snapshotId',
        key: 'snapshotId',
      },
      {
        title: '名称',
        dataIndex: 'snapshotName',
        key: 'snapshotName',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
          render: (text, record, index) => {
              return <span>
                        {record.status == 'available' ?
                            <span className='normal'><i className="fa fa-circle"></i> 活跃 </span> :
                            (record.status == 'deleted' ?
                                    <span className='transition'><i className="fa fa-circle"></i> 删除中。。。 </span> :
                                    (record.status == 'suspended' ?
                                            <span className='normal'><i className="fa fa-circle"></i> 已暂停 </span> :
                                            (record.status == 'pending' ?
                                                    <span className='normal'><i
                                                        className="fa fa-circle"></i> 更新中...</span>
                                                    : null
                                            )
                                    )
                            )
                        }
                       </span>
          }
      },
      {
        title: '总数大小(GB)',
        dataIndex: 'size',
        key: 'size',
        render:(text,record,index)=>{
            let size=parseInt(text/1024)
            return <span>{size}</span>
        }
      },
      {
        title: '备份点',
        dataIndex: 'isHead',
        key: 'isHead',
      },
        {
            title: '备份于',
            dataIndex: 'snapshotTime',
            key: 'snapshotTime',
            render:(text,record,index)=>{
                return <span>{formatDate(record.snapshotTime)}</span>

            }
        }
    ]
      const { selectedRowKeys } = this.state;

      const rowSelection = {
          selectedRowKeys,
          onChange(selectedRowKeys,selectedRows) {
              _this.setState({
                  selectedRowKeys,
                  selectedRows
              })
          }
      };

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item disabled={this.state.selectedRowKeys.length == 0 ? true : false} key="delete">删除</Menu.Item>
      </Menu>
    );



    if (!backupList || backupList.length == 0) {
      return (
        <div className='modalDetailBox' >
          <div className='configContent'>
            <Button style={{ marginTop: "20px" }} type="primary" size="large" onClick={this.CreateBackup}><Icon type="camera-o" />创建备份</Button>
            <p style={{ marginTop: '5px', color: '#777', fontStyle: 'italic' }}>您还有没有备份哦，点击创建</p>
          </div>
        </div>
      )
    } else {
      return (
        <div className='modalDetailBox'>
          <div className='configContent' style={{ padding: '0px' }}>
            <div className='detailName'>
              <Button style={{ margin: '15px', padding: '8px 8px 8px 15px' }} type="primary" size="large" onClick={this.CreateBackup}><Icon type="camera-o" />创建备份</Button>
              <Button type='primary' onClick={this.refreshBackUpList} style={{ margin: '15px 15px 15px 0', fontSize: "14px", padding: '8px 15px' }}>刷新<Icon type='reload'></Icon></Button>
              <Dropdown overlay={menu} trigger={['click']}>
                <Button type="primary" style={{ margin: '15px 0px', fontSize: "14px", padding: '8px 10px' }}>
                  更多操作 <Icon type="down" />
                </Button>
              </Dropdown>
            </div>
            <Table rowSelection={rowSelection} pagination={false} columns={columns} dataSource={backupList} />
          </div>
        </div>
      )
    }
  }
}



/*==================节点======================*/
class NodalPoint extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      monitoring: '',
      meterSet: '',
      monitorMetricList: '',
      selectedRows: '',
      selectedRowsList: [],
      rdbInstanceId: '',
      plainOptions :false,
      isDisabled:'1',

    }
    this.handleMenuClickNode = this.handleMenuClickNode.bind(this)
  }
    componentWillMount() {
        this.props.scope.getAddNodeList()
    }

    componentWillUnmount(){
        this.props.scope.clearTime()
    }

  monitoringChange(value, record, index) {
    const _this = this
    const { scope, currentData } = this.props;
    const { MonitorList, MonitorMetricList, cluster, databaseList } = scope.props;
    if (databaseList && databaseList.data) {
      MonitorList(cluster, 'rdbs', databaseList.data.rdbSet[0].rdbInstances[index].rdbInstanceId, this.state.step, currentData.rdbEngine, '', this.state.interval, '', currentData.rdbEngine)
      MonitorMetricList(cluster, 'rdbs', databaseList.data.rdbSet[0].rdbInstances[index].rdbInstanceId, 'status', this.state.step, currentData.rdbEngine, '', this.state.interval, '', currentData.rdbEngine)
    }
    this.setState({
      monitoring: value
    })
  }

  componentWillReceiveProps(nextProps) {
    const { scope, ClearNodeList, detailModal, isCurrentTab } = this.props;
    const { MongoDbNodesCluster } = scope.props;
    if (!detailModal) {
      this.setState({
        selectedRowKeys:[],
        selectedRows:[],
        monitoring: ''

      })
    }
    if (!(this.props.isCurrentTab == false && nextProps.isCurrentTab == true)) {
      return
    }
    this.setState({
      selectedRowKeys:[],
      selectedRows:[],
      monitoring: ''

    })
    const { currentData, cluster } = scope.props;
      this.props.scope.getAddNodeList()

  }

    componentWillUnmount(){
        this.props.scope.clearTime()
    }



  nodedMonitorRender(nodesMonitorList) {
    if (!nodesMonitorList || nodesMonitorList == [] || !nodesMonitorList.meterSet) {
      return null
    }
    return nodesMonitorList.meterSet.map((item, index) => {
      if (item.data == null) {
        return false
      } else {
        return <Monitor meterId={item.meterId} key={index} data={item} />
      }
    })
  }

  nodeMetricRender(monitorMetricList) {
    if (!monitorMetricList || monitorMetricList == [] || !monitorMetricList.meterSet || monitorMetricList.meterSet.length == 0) {
      return null
    }

    return monitorMetricList.meterSet[0].data.map((item, index) => {
      if (item.data == null) {
        return false
      } else {
        return <Monitor meterId={item.meterId} key={index} data={item} />
      }
    })
  }
  getInitialState() {
    return {
      loading: false,
      iconLoading: false,
      visible: false,
    };
  }
  showModal = (e) => {
    let _this = this;
    _this.setState({
      visible: true,
    });
  }
  onClickvalue = (step,interval,isDisabled)=>{
    // let isDisabled = '1';
    const styleu = {}
    this.state.step = step
    this.state.isDisabled = isDisabled
    this.state.interval = interval
    const _this= this;
    this.setState({
      monitoring: ''
  })
}
  handleOk() {
    const { getBackUpList } = this.props.scope.props;
    const { currentData } = this.props;
    let currentVersion = currentData.engineVersion
    const _this = this;
    const { RdbsAddNodeCluster } = this.props.scope.props;
    const { scope, cluster } = this.props;
    const { MongoDbNodesCluster } = this.props.scope.props;
    this.props.scope.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      let notification = new NotificationHandler()
      let parameters = [];
      for (let key in values) {
        let object = {};

        object[key] = values[key];
        parameters.push(object)
      }
      const body = {
// rdb_role
rdb_role: values.node_count,
        cluster: cluster,
      }
      RdbsAddNodeCluster(body.cluster, 'rdbs', this.props.scope.props.currentData.rdbId, body.rdb_role, {
        success: {
          func: () => {
            notification.success('创建成功')
              this.props.scope.getAddNodeList()

              this.setState({
              visible: false,
            });
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            notification.error(res.message)
            this.setState({
              visible: false,
            });
          }
        },
        finally: {
          func: () => {
            this.setState({ loading: false })
          }
        }
      });
    })
  }
  handleCancel(e) {
    this.setState({
      visible: false,
    });
  }
    handleMenuClickNode(e) {
    const { MongoDbNodesCluster } = this.props.scope.props;
        const { cluster, currentData, deleteNodeBackupList } = this.props.scope.props
        let notification = new NotificationHandler()
    
        switch (e.key) {
          case 'delete':
            this.state.selectedRows.map((item, index) => {
              deleteNodeBackupList(cluster, 'rdbs', item.rdbId, item.rdbInstanceId, {
                success: {
                  func: (res) => {
                    notification.success('删除成功')
                      this.props.scope.getAddNodeList()

                      this.setState({
                      selectedRowKeys:[],
                      selectedRows:[]
                    })
                  },
                  isAsync: true
                }
              })
           })
           break;
         default:
           return
       }
     }
  render() {
    const { currentData } = this.props;
    let currentVersion = currentData.engineVersion
    const _this = this; 
    const { scope, cluster } = this.props;
    const { databaseList, nodesMonitorList, monitorMetricList } = scope.props;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.scope.props.form;
    const { data } = databaseList && databaseList.data ? databaseList : [];
    const columns = [
      {
        title: '	节点类型',
        dataIndex: 'rdbInstanceRole',
        render: text => <a href="#">{text}</a>,
      },
      {
        title: '节点 ID',
        dataIndex: 'rdbInstanceId',
      },
      {
        title: '节点状态',
        dataIndex: 'status',
        render: (text, record, index) => {
          return <span>{record.transitionStatus == ''?
                  (record.status == 'active' ?
                  <span className='normal'><i className="fa fa-circle"></i> 活跃 </span>:
                  (record.status == 'stopped' ?
                  <span className='transition'><i className="fa fa-circle"></i> 已关闭 </span>:
                  (record.status == 'suspended' ?
                  <span className='normal'><i className="fa fa-circle"></i> 已暂停 </span>
                  :null)))
                  :
                  (record.transitionStatus == 'starting' ?<span className='transition'><i className="fa fa-circle"></i> 启动中...</span>:
                    (record.transitionStatus == 'stopping' ?<span className='transition'><i className="fa fa-circle"></i> 关闭中...</span>:
                      (record.transitionStatus == 'restarting' ?<span className='transition'><i className="fa fa-circle"></i> 重启中...</span>:
                        (record.transitionStatus == 'resizing' ?<span className='transition'><i className="fa fa-circle"></i> 扩容中...</span>:
                          (record.transitionStatus == 'creating' ?<span className='transition'><i className="fa fa-circle"></i> 创建中...</span>:
                            (record.transitionStatus == 'ceasing' ?<span className='transition'><i className="fa fa-circle"></i> 删除中...</span>:
                                    (record.transitionStatus == 'snapshot-creating' ?<span className='transition'><i className="fa fa-circle"></i> 备份创建中...</span>:
                                            (record.transitionStatus == 'updating' ?<span className='transition'><i className="fa fa-circle"></i> 更新中...</span>:null)
                                    )
                            )
                          )
                        )
                      )
                    )
                  )
                  }
                </span>
        }
      },
      {
        title: 'IP',
        dataIndex: 'ip',
      },
      {
        title: '监控',
        dataIndex: 'rdbInstanceId',
        key: 'monitoring',
        render: (text, record, index) => {
          return <span>
            {this.state.monitoring == text ?
              <span style={{ 'color': "#5cb85c" }}>监控中...</span>
              :
              <Button onClick={() => this.monitoringChange(text, record, index)}>查看</Button>}
          </span>
        }
      }
    ];
    const addNodalPoint = getFieldProps('node_count', {
      initialValue: "sleve"
    })
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange(selectedRowKeys,selectedRows) {
        _this.setState({
          selectedRowKeys,
          selectedRows
        })
      }
    };

        const menu = (
            <Menu onClick={this.handleMenuClickNode}>
              <Menu.Item disabled={_this.state.selectedRows.length==0 ? true:false} key="delete">删除</Menu.Item>
            </Menu>
          );
      
    const dataArray = [];
    let datas = ''
    if (data && data.rdbSet && data.rdbSet[0]) {
      datas = data.rdbSet[0].rdbInstances.map((item, key) => {
        const object = {};
        for (const key in item) {
          if (key == 'primary') {
            object[key] = item[key].toString()
          } else {
            object[key] = item[key]
          }
        }
        return object
      })
    }



    return (
      <div className='modalDetailBox' id="dbClusterDetailInfo">
        <div className='configContent' style={{ padding: 0 }}>

                  {(currentVersion == '5.6' || currentVersion == '5.7') ?
                  <div>
                 <div className='configContent' style={{ padding: 0,textAlign:'right' }}>
                 <div style ={{float:'left'}}>
                 <Dropdown overlay={menu} trigger={['click']} style={{textAlign:'left'}}>
                 <Button type="primary" style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>
                         更多操作 <Icon type="down" />
                 </Button>
               </Dropdown>              
               <Button type="primary"   onClick={this.showModal.bind(this)} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px',textAlign:'left' }}>添加节点</Button>
                 </div>
               
               监控周期：
               <Button type="primary" disabled={this.state.isDisabled == 1 ? true :false} onClick= {this.onClickvalue.bind(this,'5m','10s','1')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>实时</Button>
               <Button type="primary"disabled={this.state.isDisabled == 2 ? true :false} onClick= {this.onClickvalue.bind(this,'5m','6h','2')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>6小时</Button>
               <Button type="primary" disabled={this.state.isDisabled == 3 ? true :false} onClick= {this.onClickvalue.bind(this,'15m','1d','3')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>1天</Button>
               <Button type="primary" disabled={this.state.isDisabled == 5 ? true :false} onClick= {this.onClickvalue.bind(this,'1d','1m','5')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>1月</Button>
               <Button type="primary" disabled={this.state.isDisabled == 6 ? true :false} onClick= {this.onClickvalue.bind(this,'1d','6m','6')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>6月</Button>
               </div>
                      <Modal title="新增节点" visible={this.state.visible}
                        onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}
                      >
                        <div className='commonBox'>
                          <div className='title'>
                            <span>节点类型</span>
                          </div>
                          <div className='radioBox'>
                            <FormItem>
                              <Radio.Group {...addNodalPoint}>
                                <Radio value={"sleve"}>Slave节点</Radio>
                                <Radio value={"proxy"}>代理节点</Radio>
                              </Radio.Group>
                            </FormItem>
                          </div>
                         <div style={{ clear: 'both' }}></div>
                       </div>
                      </Modal>
            </div>
            : <div className='configContent' style={{ padding: 0,textAlign:'right' }}>
                监控周期：
                <Button type="primary" disabled={this.state.isDisabled == 1 ? true :false} onClick= {this.onClickvalue.bind(this,'5m','10s','1')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>实时</Button>
                <Button type="primary"disabled={this.state.isDisabled == 2 ? true :false} onClick= {this.onClickvalue.bind(this,'5m','6h','2')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>6小时</Button>
                <Button type="primary" disabled={this.state.isDisabled == 3 ? true :false} onClick= {this.onClickvalue.bind(this,'15m','1d','3')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>1天</Button>
                <Button type="primary" disabled={this.state.isDisabled == 5 ? true :false} onClick= {this.onClickvalue.bind(this,'1d','1m','5')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>1月</Button>
                <Button type="primary" disabled={this.state.isDisabled == 6 ? true :false} onClick= {this.onClickvalue.bind(this,'1d','6m','6')} style={{ margin: '5px 5px', fontSize: "14px", padding: '5px 5px' }}>6月</Button>
                </div>}
            <div>
            {/* {(currentVersion != '5.6'|| currentVersion != '5.7')?
            
                 :null} */}
            </div>
           

          <Table rowSelection={rowSelection} columns={columns} dataSource={datas} />
          {
            this.state.monitoring ?
              <div>
                <div>
                  {this.nodedMonitorRender(nodesMonitorList)}
                </div>
                <div>
                  {this.nodeMetricRender(monitorMetricList)}
                </div>
              </div>
              : ''
          }
        </div>
      </div>
    )
  }
}
class MongoCofigList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modify: false,
      inputVisible: false
    }
  }
  componentWillMount() {
    const { currentData, cluster, RdbsParametersCluster, MongoDbNodesCluster, RdbsModifyParametersCluster } = this.props.scope.props;
    RdbsParametersCluster(cluster, 'rdbs', currentData.rdbId)
  }

  modifyCofigList = () => {
    this.setState({
      modify: true,
      inputVisible: true
    })
  }

  cancer = () => {
    this.setState({
      modify: false,
      inputVisible: false
    })
  }

  handleSubmit = (e) => {
    //this function for user submit the form
    //this function for user submit the form
    e.preventDefault();
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue, primeNumberProps } = this.props.form;
    const { cluster, RdbsModifyParametersCluster } = this.props.scope.props
    const { currentData } = this.props.scope.props;
    const _this = this
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      let parameters = [];

      for (let key in values) {
        let object = {};

        object[key] = values[key];
        parameters.push(object)
      }

      let notification = new NotificationHandler()
      RdbsModifyParametersCluster(parameters, cluster, 'rdbs', currentData.rdbId, {
        success: {
          func: () => {
            notification.success('修改成功')
            const { currentData, cluster, RdbsParametersCluster } = this.props.scope.props;

            RdbsParametersCluster(cluster, 'rdbs', currentData.rdbId)
            _this.setState({
              modify: false,
              inputVisible: false
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            notification.error(res.message)
          }
        },
        finally: {
          func: () => {
            this.setState({ loading: false })
          }
        }
      })
    });
  }
  checkPrime(rule, value, callback) {
    if (typeof (value != boolean)) {
      value = 'true'
    } else {
      callback();
    }
  }
  render() {
    const { scope, currentData, cluster } = this.props;
    const { paramtersList } = scope.props;
    let dataParameter = []
    if (paramtersList && paramtersList.data && paramtersList.data.parameterSet) {
      dataParameter = paramtersList.data.parameterSet
    }
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;

    const columns = [
      {
        title: '参数',
        dataIndex: 'varName',
        key: 'varName',
        render: (text, record) => <span href="#">{record.varName}</span>,
      },
      {
        title: '值',
        dataIndex: 'varValue',
        key: 'varValue',

        render: (text, record) => {
        if (this.state.inputVisible && record.isReadonly == 0 && record.varName != 'query_cache_size') {
            if (text) {
              if ((record.varType == 'int' || record.varType == 'float' || record.varName == 'sync_relay_log') && record.varName != 'key_buffer_size') {
                return <FormItem style={{ marginBottom: '0' }}>
                  <InputNumber  {...getFieldProps(`${record.varName}`, {
                    rules: [
                      { required: true }
                    ],
                    initialValue: Number(`${text}`)
                  }) } size='large' style={{ width: '180px', paddingRight: '28px' }} /></FormItem>
              } else {
                return <FormItem style={{ marginBottom: '0' }}>
                  <Input {...getFieldProps(`${record.varName}`, {
                    rules: [
                      { required: true }
                    ],
                    initialValue: `${text}`
                  }) } size='large' style={{ width: '180px', paddingRight: '28px' }} /></FormItem>
              }

            } else {
              return text
            }
          } else {
            return text
          }
        }
      },
      {
        title: '范围',
        dataIndex: '',
        key: '',
        render: (text, record) => {
          if (text) {
            if (this.state.inputVisible && record.isReadonly == 0 && record.varName != 'query_cache_size') {
              if (record.varName == 'back_log' || record.varName == 'ft_min_word_len' || record.varName == 'innodb_ft_max_token_size' || record.varName == 'innodb_ft_min_token_size' || record.varName == 'lower_case_table_names' || record.varName == 'port' || record.varName == 'query_cache_type') {
                return '范围:' + `${record.minValue}` + "~" + `${record.maxValue}` + '  *此项保存后数据库会重启'
              } else {
                var a = record.minValue;
                var b = record.maxValue;
                if (a == null) {
                  return '范围:不限'
                }
                return '范围:' + `${record.minValue}` + "~" + `${record.maxValue}`
              }
            } else {
              return ''
            }

          } else {
            return text
          }

        }
      },
    ]



    return (
      <div className ="modalDetailBox">
        <div className='configContent' style={{ padding: '0px' }}>
           {this.state.modify == true ? <div><Button style={{ margin: '10px 20px' }} onClick={this.handleSubmit} type="primary" className="buttonClass">保存</Button>
            <Button onClick={this.cancer} type="primary" className="buttonClass">取消</Button></div> :
             ((scope.props.currentData.engineVersion!='9.4' && scope.props.currentData.engineVersion!='9.3') ?
             <Button style={{ margin: '10px 20px' }} onClick={this.modifyCofigList} type="primary" className="buttonClass">修改属性</Button>
           :''
           )}
              <Table style={{ margin: '10px 20px' }} pagination={false} columns={columns} dataSource={dataParameter} />
    
        </div>
       
      </div>
    )
  }


}

class BaseInfo extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
  }
  render() {
    var AutomaticArray = {
      '25': '关闭'
    }
    const Automatic = function () {
      for (let i = 0; i < 24; i++) {
        AutomaticArray[i] = i + ':00-' + (i + 1) + ':00'
      }
    }
    Automatic()
    const { currentData } = this.props;
    let currentVersion = currentData.engineVersion
    return <div className='modalDetailBox' id="dbClusterDetailInfo">
      <div className='configContent'>
        <div>
          <ul className='parse-list'>
            <li><span className='key'>ID：</span> <span className='value' style={{ color: '#2db7f5' }}>{currentData.rdbId}</span></li>
            <li><span className='key'>状态：</span> <span className='value' >
              {currentData.transitionStatus == '' ?
                (currentData.status == 'active' ?
                  <span className='normal'><i className="fa fa-circle"></i> 活跃 </span> :
                  (currentData.status == 'stopped' ?
                    <span className='error'><i className="fa fa-circle"></i> 已关闭 </span> :
                    (currentData.status == 'suspended' ?
                      <span className='errorr'><i className="fa fa-circle"></i> 已暂停 </span>
                      : null)))
                :
                (currentData.transitionStatus == 'starting' ? <span className=' warning'><i className="fa fa-circle"></i> 启动中...</span> :
                  (currentData.transitionStatus == 'stopping' ? <span className=' warning'><i className="fa fa-circle"></i> 关闭中...</span> :
                    (currentData.transitionStatus == 'restarting' ? <span className=' warning'><i className="fa fa-circle"></i> 重启中...</span> :
                      (currentData.transitionStatus == 'resizing' ? <span className=' warning'><i className="fa fa-circle"></i> 扩容中...</span> :
                        (currentData.transitionStatus == 'creating' ? <span className=' warning'><i className="fa fa-circle"></i> 创建中...</span> : null)
                      )
                    )
                  )
                )
              }
            </span></li>

            <li><span className='key'>名称：</span> <span className='value'>{currentData.rdbName}</span></li>
            <li><span className='key'>标签：</span> <span className='value'>{currentData.tags[0].tagName}</span></li>
            <li><span className='key'>描述：</span> <span className='value'>{currentData.description ? currentData.description : '暂无描述'}</span></li>

            <li><span className='key'>版本：</span> <span className='value'>
              {(currentVersion == '5.6' || currentVersion == '5.7' || currentVersion == '5.5') ? ("MySQL-" + currentVersion) : null}
              {(currentVersion == '9.3' || currentVersion == '9.4') ? ("PostgreSQL-" + currentVersion) : null}
            </span></li>
            <li><span className='key'>类型：</span> <span className='value'>{currentData.rdbClass == 0 ? '性能型' : '高性能型'}</span></li>
            <li><span className='key'>配置：</span> <span className='value'>
              {currentData.rdbType == 1 ?
                <span className='running'><i className="fa fa-circle"></i> 1核2G </span>
                : null
              }
              {currentData.rdbType == 2 ?
                <span className='running'><i className="fa fa-circle"></i> 2核4G </span>
                : null
              }{currentData.rdbType == 3 ?
                <span ><i className="fa fa-circle"></i> 4核8G </span>
                : null
              }{currentData.rdbType == 4 ?
                <span ><i className="fa fa-circle"></i> 8核16G </span>

                : null
              }
              {currentData.rdbType == 5 ?
                <span><i className="fa fa-circle"></i> 8核32G </span>

                : null
              }</span></li>
            <li><span className='key'>自动备份</span> <span className='value'>{AutomaticArray[currentData.autoBackupTime]}</span></li>
            <li><span className='key'>内存：</span> <span className='value'>{currentData.storageSize}GB</span></li>
            <li><span className='key'>创建时间：</span> <span className='value'>{formatDate(currentData.createTime)}</span></li>
            <li><span className='key'>创建于</span> <span className='value'>{calcuDate(currentData.createTime)}</span></li>
            <li><span className='key'>读</span> <span className='value'>{currentData.wvip ? currentData.wvip : currentData.masterIp}</span></li>
            <li><span className='key'>写</span> <span className='value'>{currentData.rvip ? currentData.rvip : currentData.masterIp}</span></li>
          </ul>
        </div>
      </div>
    </div>
  }
}
class ModalDetail extends Component {
  constructor(props) {
    super(props)
    const { activeKey } = this.props;

    this.state = {
      delModal: false,
      deleteBtn: false,
      detailModal: false,
      activeKey
    }
  }

    getBackUpListStatus() {
        const { currentData, cluster, fetch_backup_list } = this.props;
        const self = this;
        fetch_backup_list(cluster, currentData.rdbId,{
            success: {
                func: (res)=> {
                    clearInterval(self.loadStatusTimeout)
                    self.loadStatusTimeout=setInterval(function () {
                        fetch_backup_list(cluster, currentData.rdbId)
                    },5000)
                },
            }
        })
    }
  deleteRedis() {
    const { currentData, cluster, database, deleteDatabaseRedis, scope } = this.props;
    const { loadDbCacheRedisList } = scope.props;
    const _this = this;
    let notification = new NotificationHandler()
    _this.setState({ deleteBtn: true })
    deleteDatabaseRedis(cluster, currentData.rdbId, 'rdbs', {
      success: {
        func: () => {
          // notification.success('删除成功')
          scope.setState({
            detailModal: false,
          });
          _this.setState({ deleteBtn: false, delModal: false })
        }
      },
      failed: {
        func: (res) => {
          scope.setState({
            detailModal: false,
          });
          _this.setState({ deleteBtn: false, delModal: false })
          notification.error('删除失败', res.message)
        }
      }
    });
  }

    getAddNodeList(){
        const _this=this;
        const {cluster,currentData,MongoDbNodesCluster}=_this.props
        MongoDbNodesCluster(cluster,'rdbs', currentData.rdbId,{
            success: {
                func: (res)=> {
                    clearInterval(_this.loadStatus)
                    _this.loadStatus=setInterval(function () {
                        MongoDbNodesCluster(cluster, 'rdbs',currentData.rdbId);
                    },5000)
                },
            }
        })
    }

    clearTime(){
        clearInterval(this.loadStatusTimeout)
        clearInterval(this.loadStatus)
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.activeKey  !=  nextProps.activeKey) {
            this.clearTime()
        }
    }


    componentWillUnmount(){
        this.clearTime()
    }


    changeTab(activeKey) {
        this.clearTime()
      const { scope } = this.props;
      scope.setState({ activeKey });
      if (activeKey == '#config') {
        clearTimeout(this.loadStatusTimeout)
          this.getBackUpListStatus

          const { currentData, cluster, RdbsParametersCluster } = this.props;
        RdbsParametersCluster(cluster, 'rdbs', currentData.rdbId)
      }
      if(activeKey!="#NodeList"){
        scope.props.ClearNodeList('caches');
          this.getAddNodeList
      }else if(activeKey!="#watching"){
          this.getBackUpListStatus

      }

  }
  render() {
    const { currentData, activeKey, detailModal, scope } = this.props;
    return (
      <div id='AppServiceDetail' className="dbServiceDetail">
        <div className='topBox'>
          <Icon className='closeBtn' type='cross' onClick={() => { scope.setState({ detailModal: false, activeKey: '#BaseInfo' }); scope.props.ClearNodeList('rdbs'); }} />
          <div className='imgBox'>
          {currentData.engineVersion=='9.3'||currentData.engineVersion=='9.4'?<img src={psqlImg} />:<img  src={mysqlImg} />}   
          </div>
          <div className='infoBox'>
            <p className='instanceName'>
              {currentData.rdbName}
            </p>
            <div className='leftBox TenxStatus'>
              <div className="desc">ID / {currentData.rdbId}</div>
              <div> 状态：
                {currentData.transitionStatus == '' ?
                  (currentData.status == 'active' ?
                    <span className='normal'><i className="fa fa-circle"></i> 活跃 </span> :
                    (currentData.status == 'stopped' ?
                      <span className='error'><i className="fa fa-circle"></i> 已关闭 </span> :
                      (currentData.status == 'suspended' ?
                        <span className='errorr'><i className="fa fa-circle"></i> 已暂停 </span>
                        : null)))
                  :
                  (currentData.transitionStatus == 'starting' ?<span className=' warning'><i className="fa fa-circle"></i> 启动中...</span>:
                    (currentData.transitionStatus == 'stopping' ?<span className=' warning'><i className="fa fa-circle"></i> 关闭中...</span>:
                      (currentData.transitionStatus == 'restarting' ?<span className=' warning'><i className="fa fa-circle"></i> 重启中...</span>:
                        (currentData.transitionStatus == 'resizing' ?<span className=' warning'><i className="fa fa-circle"></i> 扩容中...</span>:
                          (currentData.transitionStatus == 'creating' ?<span className=' warning'><i className="fa fa-circle"></i> 创建中...</span>:
                           (currentData.transitionStatus == 'deleting' ?<span className='warning'><i className="fa fa-circle"></i> 删除中...</span>:
                                   (currentData.transitionStatus == 'snapshot-creating' ?<span className='normal transition'><i className="fa fa-circle"></i> 备份创建中...</span>:
                                           (currentData.transitionStatus == 'updating' ?<span className='normal transition'><i className="fa fa-circle"></i> 更新中...</span>:null)
                                   )
                           )

                        )
                        )
                      )
                    )
                  )
                }
              </div>

            </div>
            <div className='rightBox'>
              <div className='li'>
                {/* disabled={currentData.status == 'active'?false:true}  */}
                {this.state.deleteBtn ?
                  <Button size='large' className='btn-danger' type='ghost' loading={true}>
                    删除集群
                  </Button> :
                  <Button disabled={currentData.transitionStatus == '' ? false : true} size='large' className='btn-danger' type='ghost' onClick={() => this.setState({ delModal: true })}>
                    <Icon type='delete' />删除集群
                  </Button>
                }
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <Modal title="删除集群操作" visible={this.state.delModal}
          onOk={() => this.deleteRedis()} onCancel={() => this.setState({ delModal: false })}
        >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i>您是否确定要删除数据库 {currentData.rdbId}?</div>
        </Modal>
        <div className='bottomBox'>
          <div className='siderBox'>
            <Tabs
              tabPosition='left' onChange={this.changeTab.bind(this)} activeKey={activeKey}

            >
              <TabPane tab='基础信息' key='#BaseInfo'>
                <BaseInfo currentData={currentData} />
              </TabPane>
              <TabPane disabled={currentData.transitionStatus == '' ? false : true} tab="节点" key='#NodeList'>
                <NodalPoint detailModal={detailModal} isCurrentTab={activeKey === '#NodeList'} currentData={currentData} cluster={this.props.cluster} scope={this} />
              </TabPane>
              <TabPane disabled={currentData.transitionStatus == '' ? false : true} tab="配置" key='#config'>
                <MongoCofigList form={this.props.form} currentData={currentData} scope={this} />
              </TabPane>
              <TabPane tab="备份" key='#watching'>
                <CreateBackup currentData={currentData} isCurrentTab={activeKey === '#watching'} scope={this} />
              </TabPane>

            </Tabs>
          </div>
        </div>
      </div>
    )
  }

}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultMysqlList = {
    cluster: cluster.clusterID,
  }
  return {
    cluster: cluster.clusterID,
    domainSuffix: cluster.bindingDomains,
    bindingIPs: cluster.bindingIPs,
    resourcePrice: cluster.resourcePrice //storage
  }
}
function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultMysqlList = {
    cluster: cluster.clusterID,
    isFetching: false,
    database: 'rdbs',
    databaseList: [],
    paramtersList: [],
  }
  const { databaseAllNodesList, databaseBackUpList, databaseMonitorList, databaseMonitorMetricList, databaseAllConfigList } = state.databaseCache
  const { database, databaseList, isFetching } = databaseAllNodesList.rdbs || defaultMysqlList
  const { paramtersList } = databaseAllConfigList.rdbs || defaultMysqlList
  const { nodesMonitorList } = databaseMonitorList.rdbs || defaultMysqlList
  const { monitorMetricList } = databaseMonitorMetricList.rdbs || defaultMysqlList
  const { getBackUpList } = databaseBackUpList.mysql || defaultMysqlList

  return {
    database: isFetching,
    isFetching: isFetching,
    cluster: cluster.clusterID,
    domainSuffix: cluster.bindingDomains,
    bindingIPs: cluster.bindingIPs,
    resourcePrice: cluster.resourcePrice, //storage
    databaseList,
    paramtersList,
    nodesMonitorList,
    monitorMetricList,
    getBackUpList


  }
}
ModalDetail.PropTypes = {
  intl: PropTypes.object.isRequired,
  deleteDatabaseRedis: PropTypes.func.isRequired,
  MongoDbNodesCluster: PropTypes.func.isRequired,
  databaseAllNodesList: PropTypes.func.isRequired,
  RdbsParametersCluster: PropTypes.func.isRequired,
  MonitorMetricList: PropTypes.func.isRequired,
  fetch_backup_list: PropTypes.func.isRequired,
  deleteBackupList: PropTypes.func.isRequired,
  RdbsModifyParametersCluster: PropTypes.func.isRequired,
  RdbsAddNodeCluster: PropTypes.func.isRequired,
  deleteNodeBackupList:PropTypes.func.isRequired,

  // gitNode:
}
ModalDetail = createForm()(ModalDetail);
ModalDetail = injectIntl(ModalDetail, {
  withRef: true,
})
export default connect(mapStateToProps, {
  deleteDatabaseRedis,
  putDbClusterDetail,
  MongoDbNodesCluster,
  fetch_backup_list,
  deleteBackupList,
  RdbsParametersCluster,
  MonitorList,
  MonitorMetricList,
  RdbsModifyParametersCluster,
  RdbsAddNodeCluster,
  ClearNodeList,
  deleteNodeBackupList
})(ModalDetail)
