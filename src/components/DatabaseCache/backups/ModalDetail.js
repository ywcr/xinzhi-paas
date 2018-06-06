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
import { camelize } from 'humps'
import classNames from 'classnames'
import { Button, Icon, Spin, Modal, Collapse, Row, Col, Dropdown, Slider, Timeline, Popover, InputNumber, Tabs, Tooltip, Card, Radio, Select, Form} from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadDbClusterDetail, deleteDatabaseCluster, putDbClusterDetail, loadDbCacheList } from '../../actions/database_cache'
import { setServiceProxyGroup } from '../../actions/services'
import { getProxy } from '../../actions/cluster'
import { parseServiceDomain } from '../parseDomain'
import './style/ModalDetail.less'
import AppServiceEvent from '../AppModule/AppServiceDetail/AppServiceEvent'
import { calcuDate, parseAmount} from '../../common/tools.js'
import NotificationHandler from '../../common/notification_handler'
import { ANNOTATION_SVC_SCHEMA_PORTNAME, ANNOTATION_LBGROUP_NAME } from '../../../constants'
import mysqlImg from '../../assets/img/database_cache/mysql.png'
import redisImg from '../../assets/img/database_cache/redis.jpg'
import zkImg from '../../assets/img/database_cache/zookeeper.jpg'
import esImg from '../../assets/img/database_cache/elasticsearch.jpg'
import etcdImg from '../../assets/img/database_cache/etcd.jpg'

const Option = Select.Option;
const Panel = Collapse.Panel;
const ButtonGroup = Button.Group
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;

class VolumeHeader extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { data } = this.props
    return (
      <Row>
        <Col className="group-name textoverflow" span="8">
          <Icon type="folder-open" />
          <Icon type="folder" />
          <Link to={`/app_manage/container/` + data.objectMeta.name}>{data.objectMeta.name}</Link>
        </Col>
        <Col span="6">
          <div className={data.podPhase}>
            <i className="fa fa-circle"></i> &nbsp;
          {data.podPhase}
          </div>
        </Col>
        <Col span="10">
          创建时间&nbsp;&nbsp;{calcuDate(data.objectMeta.creationTimestamp)}
        </Col>
      </Row>
    )
  }
}

class VolumeDetail extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const volumes = this.props.volumes.podSpec.volumes
    const containers = this.props.volumes.podSpec.containers[0]
    if (!volumes) {
      return (
        <div></div>
      )
    }
    const configFileItem = volumes.map(list => {
      if (list.name === 'datadir') {
        return list.persistentVolumeClaim.claimName
      }
    })
    const volumeMounts = containers.volumeMounts.map(list => {
      if (list.name === 'datadir') {
        return list.mountPath
      }
    })
    return (
      <Row className='file-list'>
        <Timeline>
          <Timeline.Item key={configFileItem}>
            <Row className='file-item'>
              <div className='line'></div>
              <table>
                <tbody>
                  <tr>
                    <td style={{ padding: '15px' }}>
                      <div style={{ width: this.props.selfScope.state.winWidth }} className='textoverflow'><Icon type='file-text' style={{ marginRight: '10px' }} />{configFileItem}</div>
                    </td>

                    <td style={{ width: '130px', textAlign: 'center' }}>
                      <div className='li'>关联容器</div>
                      <div className='lis'>挂载路径</div>
                    </td>
                    <td>
                      <div className="li"><Link to={`/app_manage/container/` + this.props.volumes.objectMeta.name}>{this.props.volumes.objectMeta.name}</Link></div>
                      <div className='lis'>{volumeMounts}</div>
                    </td>
                  </tr>
                </tbody>
              </table>

            </Row>
          </Timeline.Item>
        </Timeline>
      </Row>
    )
  }
}

class BaseInfo extends Component {
  constructor(props) {
    super(props)
    this.state ={
      passShow: false,
      storageValue: parseInt(this.props.databaseInfo.volumeInfo.size)
    }
  }
  componentDidMount() {
    const winWidth = document.body.clientWidth
    if (winWidth > 1440) {
      this.setState({winWidth: '220px'})
      return
    }
    this.setState({winWidth: '120px'})
  }
  copyDownloadCode(index) {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("databaseCodeInput");
    code[index].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }
  findPassword(spec) {
    const length = spec.containers.length
    for (let i = 0; i < length; i++) {
      const container = spec.containers[i]
      if (container.env && container.env.length > 0) {
        const envLength = container.env.length
        for (let j = 0; j < envLength; j++) {
          const env = container.env[j]
          if (env.name && env.name.indexOf("PASSWORD") !== -1) {
            return env.value
          }
        }
      }
    }
    return ""
  }
  render() {
    const { bindingIPs, databaseInfo ,dbName } = this.props
    const parentScope = this.props.scope
    const rootScope = parentScope.props.scope
    const selfScope = this
    let podSpec = {}
    if (databaseInfo.podList.pods && databaseInfo.podList.pods.length > 0) {
      podSpec = databaseInfo.podList.pods[0].podSpec
    }
    let storagePrc = parentScope.props.resourcePrice.storage * parentScope.props.resourcePrice.dbRatio
    let containerPrc = parentScope.props.resourcePrice['2x'] * parentScope.props.resourcePrice.dbRatio
    const hourPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc ), 4)
    const countPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc) * 24 * 30 , 4)
    const showHourPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * this.props.currentData.desired +  this.props.currentData.desired * containerPrc), 4)
    const showCountPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * this.props.currentData.desired +  this.props.currentData.desired * containerPrc) * 24 * 30, 4)
    storagePrc = parseAmount(storagePrc, 4)
    containerPrc = parseAmount(containerPrc, 4)

    const modalContent = (
      <div className="modal-content">
        <div className="modal-header">更改实例数  <Icon type='cross' onClick={() => parentScope.colseModal()} className='cursor' style={{ float: 'right' }} /></div>
        <div className="modal-li padTop"><span className="spanLeft">服务名称</span><span>{dbName}</span></div>
        <div className="modal-li">
          <span className="spanLeft">实例副本</span>
          <InputNumber onChange={(e) => parentScope.setState({ replicas: e })}
                       value={parentScope.state.replicas}
                       min={ this.props.database == 'zookeeper' ? 3 : 1 }
                       max={5} /> &nbsp; 个
        </div>
        <div className="modal-li">
          <span className="spanLeft">存储大小</span>
          {/* <Slider min={500} max={10000} onChange={(value)=>parentScope.onChangeStorage(value)} value={parentScope.state.storageValue} step={100} /> */}
          <InputNumber min={512} step={512} max={20480} disabled={true} value={databaseInfo.volumeInfo.size} /> &nbsp;
        </div>
        <div className="modal-price">
          <div className="price-left">
            <div className="keys">实例：<span className="unit">{ containerPrc.fullAmount }</span>/（个*小时）* { parentScope.state.replicas } 个</div>
            <div className="keys">存储：<span className="unit">{ storagePrc.fullAmount }</span>/（GB*小时）* { parentScope.state.replicas } 个</div>
          </div>
          <div className="price-unit">
            <p>合计：
            <span className="unit">{countPrice.unit=='￥' ? ' ￥' : ''}</span>
            <span className="unit blod">{ hourPrice.amount }{containerPrc.unit=='￥'? '' : ' T'}/小时</span>
            </p>
            <p>
            <span className="unit">（约：{ countPrice.fullAmount } /月）</span>
            </p>
          </div>
        </div>
        {parentScope.state.putModaling ?
          <div className="modal-footer"><Button size="large" onClick={() => parentScope.colseModal()}>取消</Button><Button size="large" loading={true} type="primary">保存</Button></div>
        :
          <div className="modal-footer"><Button size="large" onClick={() => parentScope.colseModal()}>取消</Button><Button size="large" type="primary" onClick={() => parentScope.handSave()}>保存</Button></div>
       }
      </div>
    )
    const volumeMount = databaseInfo.podList.pods.map((list, index) => {
      return (
        <Panel header={<VolumeHeader data={list} />} key={'volumeMount-' + index}>
          <VolumeDetail volumes={list} key={'VolumeDetail-' + index} selfScope={selfScope}/>
        </Panel>
      )
    })
    return (
      <div className='modalDetailBox' id="dbClusterDetailInfo">
        <div className='configContent'>
          {this.props.database === 'elasticsearch' || this.props.database === 'etcd' ? null :
          <div><div className='configHead'>参数</div>
            <ul className='parse-list'>
              <li><span className='key'>参数名</span> <span className='value'>参数值</span></li>
              <li><span className='key'>用户名：</span> <span className='value'>{ this.props.database === 'zookeeper' ? "super" : "root" }</span></li>
              {this.state.passShow ?
              <li><span className='key'>密码：</span> <span className='value'>{ this.findPassword(podSpec) }</span><span className="pasBtn" onClick={() => this.setState({ passShow: false })}><i className="fa fa-eye-slash"></i> 隐藏</span></li>
              :
              <li><span className='key'>密码：</span> <span className='value'>******</span><span className="pasBtn" onClick={() => this.setState({ passShow: true })}><i className="fa fa-eye"></i> 显示</span></li>}
            </ul>
          </div>}
          <div className='configHead'>实例副本 <span>{this.props.currentData.desired}个 &nbsp;</span>
            <Popover content={modalContent} title={null} trigger="click" overlayClassName="putmodalPopover"
              visible={rootScope.state.putVisible} getTooltipContainer={()=> document.getElementById('AppServiceDetail')}
              >
              <Button type="primary" size="large" onClick={() => parentScope.props.scope.putModal()}>更改实例数</Button>
            </Popover>
          </div>
          <Collapse accordion>
            {volumeMount}
          </Collapse>
        </div>
      </div>
    )
  }
}

class VisitTypes extends Component{
  constructor(props) {
    super(props)
    this.state = {
      value: 0,
      disabled:true,
      forEdit: false,
      selectDis: undefined,
      deleteHint: true,
      svcDomain: [],
      copyStatus: false,
      isInternal: false,
      addrHide: false,
      proxyArr: [],
      currentProxy: [],
      groupID:'',
      selectValue: ''
    }
  }
  componentWillMount() {
    const { service, getProxy, clusterID, databaseInfo } = this.props;
    const lbinfo = databaseInfo.serviceInfo.annotations[ANNOTATION_LBGROUP_NAME]

    if(lbinfo == 'none') {
      this.setState({
        initValue: 1,
        initSelectDics: true
      })
    } else {
      this.setState({
        initValue: 2,
        initGroupID: lbinfo,
        initSelectDics: false,
      })
    }
    getProxy(clusterID,true,{
      success: {
        func: (res) => {
          this.setState({
            proxyArr:res[camelize(clusterID)].data
          })
        },
        isAsync: true
      },
    })
  }
  componentWillReceiveProps(nextProps) {
    const { detailModal, isCurrentTab } = nextProps;
    if ((!detailModal && this.props.detailModal != nextProps.detailModal) || (!isCurrentTab && isCurrentTab != this.props.isCurrentTab)) {
      this.cancelEdit()
    }
  }
  onChange(e) {
    let value = e.target.value;
    let flag;
    this.setState({
      value: value,
      selectDis: false,
      selectValue: null
    });
    if (value === 1) {
      flag = 'incluster'
      this.setState({
        selectDis: true
      })
    } else {
      flag = 'other'
    }
  }
  toggleDisabled() {
    this.setState({
      disabled: false,
      forEdit:true
    });
  }
  saveEdit() {
    const { groupid, initValue } = this.state;
    let value = this.state.value
    if(!value) {
      value = this.state.initValue
    }
    const { databaseInfo, setServiceProxyGroup, clusterID, form, scope } = this.props;
    form.validateFields((err, values) => {
      if(err) {
        return
      }
      let groupID = 'none'
      if(value == 2) {
        groupID = form.getFieldValue('groupID')
      }
      const notification = new NotificationHandler()
      notification.spin('保存中更改中')
      setServiceProxyGroup({
        cluster: clusterID,
        service: databaseInfo.serviceInfo.externalName,
        groupID
      },{
        success: {
          func: (res) => {
            notification.close()
            notification.success('出口方式更改成功')
            const { loadDbClusterDetail } = scope.props
            setTimeout(() => {
              loadDbClusterDetail(clusterID, databaseInfo.objectMeta.name, false)
            }, 0)
            this.setState({
              disabled: true,
              forEdit:false
            });
            if (value ===1) {
              this.setState({
                initValue: 1,
                initSelectDics: true,
                addrHide: true,
                isinternal:false,
                addrhide: false,
                value: undefined,
                selectDics: undefined
              })
            } else {
              this.setState({
                initValue: 2,
                initGroupID: groupID,
                initSelectDics: false,
                addrHide: false,
                selectDics: undefined,
                value: undefined,
                isinternal:true,
              })
              form.setFieldsValue({
                groupID
              })
            }
          },
          isAsync: false
        },
        failed: (res) => {
          notification.close()
          let message = '更改出口方式失败'
          if(res.message) {
            message = res.message
          }
          if(res.message && res.message.message) {
            message = res.message.message
          }
          notification.error(message)
        }
      })
    })
  }
  cancelEdit() {
    this.setState({
      disabled: true,
      forEdit:false,
      value: this.state.initValue,
      selectDis: this.state.initSelectDis,
    });
    const { form } = this.props
    form.setFieldsValue({
      groupID: this.state.initGroupID
    })
  }
  handleChange(value) {
    this.setState({
      groupID: value,
      selectValue: value
    })
  }
  copyTest() {
    let target = document.getElementsByClassName('copyTest')[0];
    target.select()
    document.execCommand("Copy", false);
    this.setState({
      copyStatus: true
    })
  }
  startCopyCode(domain){
    let target = document.getElementsByClassName('copyTest')[0];
    target.value = domain;
  }
  returnDefaultTooltip() {
    this.setState({
      copyStatus: false
    })
  }
  render() {
    const { bindingIPs, domainSuffix, databaseInfo, form } = this.props
    const { value, disabled, forEdit, selectDis, deleteHint, copyStatus, addrHide, proxyArr, initValue, initGroupID, initSelectDics } = this.state;
    const lbinfo = databaseInfo.serviceInfo.annotations[ANNOTATION_LBGROUP_NAME]
    let clusterAdd = [];
    let port = databaseInfo.serviceInfo.ports[0].port;
    let serviceName = databaseInfo.serviceInfo.name;
    let portNum = databaseInfo.podList.listMeta.total;
    for (let i = 0; i < portNum; i++) {
      clusterAdd.push({
        start:`${serviceName}-${i}`,
        end:`${serviceName}-${i}.${serviceName}:${port}`
      })
    }
    const domainList = clusterAdd && clusterAdd.map((item,index)=>{
          return (
            <dd className="addrList" key={item.start}>
              <span className="domain">{item.end}</span>
              <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
                <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,item.end)} onClick={this.copyTest.bind(this)}/>
              </Tooltip>
            </dd>
          )
      })
    let validator = (rule, value, callback) => callback()
    if(value == 2) {
      validator = (rule, value, callback) => {
        if(!value) {
          return callback('请选择网络出口')
        }
        return callback()
      }
    }
    const selectGroup = form.getFieldProps("groupID", {
      rules:[{
        validator
      }],
      initialValue: initGroupID
    })
    const proxyNode = proxyArr.length > 0 ? proxyArr.map((item,index)=>{
      return (
          <Option key={item.id} value={item.id}>{item.type == 'public' ? '公网：' : '内网：'}{item.name}</Option>
      )
    }):null
    let domain = ''
    if (domainSuffix) {
      domain = eval(domainSuffix)[0]
    }
    let bindingIP = ''
    if (bindingIPs) {
      bindingIP = eval(bindingIPs)[0]
    }
    // get domain, ip from lbgroup
    proxyArr && proxyArr.every(proxy => {
      if (proxy.id === lbinfo) {
        domain = proxy.domain
        bindingIP = proxy.address
        return false
      }
      return true
    })
    let portAnnotation = databaseInfo.serviceInfo.annotations[ANNOTATION_SVC_SCHEMA_PORTNAME]
    let externalPort = ''
    if (portAnnotation) {
      externalPort = portAnnotation.split('/')
      if (externalPort && externalPort.length > 1) {
        externalPort = externalPort[2]
      }
    }
    let externalUrl = '-'
    if (externalPort != '') {
      if (domain) {
        externalUrl = databaseInfo.serviceInfo.name + '-' + databaseInfo.serviceInfo.namespace + '.' + domain + ':' + externalPort
      } else {
        externalUrl = bindingIP + ':' + externalPort
      }
    }
    const radioValue = value || initValue
    const hide = selectDis == undefined ? initSelectDics : selectDis
    return (
      <Card id="visitsTypePage">
        <div className="visitTypeTopBox">
          <div className="visitTypeTitle">集群访问方式</div>
          <div className="visitTypeInnerBox">
            {
              forEdit ? [
                <Button key="cancel" size="large" onClick={this.cancelEdit.bind(this)}>取消</Button>,
                <Button key="save" type="primary" size="large" onClick={this.saveEdit.bind(this)}>保存</Button>
              ] :
                <Button type="primary" size="large" onClick={this.toggleDisabled.bind(this)}>编辑</Button>
            }
            <div className="radioBox">
              <RadioGroup onChange={this.onChange.bind(this)} value={radioValue}>
                <Radio key="b" value={2} disabled={disabled}>可集群外访问</Radio>
                <Radio key="a" value={1} disabled={disabled}>仅在集群内访问</Radio>
              </RadioGroup>
              <p className="typeHint">
                {
                  radioValue === 1 ? '选择后该数据库与缓存集群仅提供集群内访问；': '数据库与缓存可提供集群外访问，选择一个网络出口；'
                }
              </p>
              <div className={classNames("inlineBlock selectBox",{'hide': hide})}>
                <Form.Item>
                  <Select size="large" style={{ width: 180 }} {...selectGroup} disabled={disabled}
                        getPopupContainer={()=>document.getElementsByClassName('selectBox')[0]}
                >
                  {proxyNode}
                </Select>
               </Form.Item>
              </div>
              <div className={classNames("inlineBlock deleteHint",{'hide': deleteHint})}><i className="fa fa-exclamation-triangle" aria-hidden="true"/>未配置该网络出口模式，请选择其他模式</div>
            </div>
          </div>
        </div>
        <div className="visitTypeBottomBox">
          <div className="visitTypeTitle">访问地址</div>
          <div className="visitAddrInnerBox">
            <input type="text" className="copyTest" style={{opacity:0}}/>
            <div className={classNames("outPutBox",{'hide':addrHide})}>
              <Icon type="link"/>出口地址：
              <span className="domain">{externalUrl}</span>
              <Tooltip placement='top' title={copyStatus ? '复制成功' : '点击复制'}>
                <Icon type="copy" onMouseLeave={this.returnDefaultTooltip.bind(this)} onMouseEnter={this.startCopyCode.bind(this,externalUrl)} onClick={this.copyTest.bind(this)}/>
              </Tooltip>
            </div>
            <dl className="addrListBox">
              <dt className="addrListTitle"><Icon type="link"/>集群内实例访问地址</dt>
              <dd className="addrList">
                {domainList}
              </dd>
            </dl>
          </div>
        </div>
      </Card>
    )
  }
}

function mapSateToProp(state) {
  const { current } = state.entities;
  const { clusterID } = current.cluster
  return {
    bindingDomains: state.entities.current.cluster.bindingDomains,
    bindingIPs: state.entities.current.cluster.bindingIPs,
    clusterID
  }
}

VisitTypes = connect(mapSateToProp, {
  setServiceProxyGroup,
  getProxy
})(Form.create()(VisitTypes))

class LeasingInfo extends Component {
  constructor(props) {
    super(props)
    this.state ={
      storageValue: parseInt(this.props.databaseInfo.volumeInfo.size)
    }
  }
  render() {
    const parentScope = this.props.scope
    const { databaseInfo } = this.props
    let storagePrc = parentScope.props.resourcePrice.storage * parentScope.props.resourcePrice.dbRatio
    let containerPrc = parentScope.props.resourcePrice['2x'] * parentScope.props.resourcePrice.dbRatio
    const hourPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc ), 4)
    const countPrice = parseAmount((parentScope.state.storageValue /1024 * storagePrc * parentScope.state.replicas +  parentScope.state.replicas * containerPrc) * 24 * 30 , 4)
    storagePrc = parseAmount(storagePrc, 4)
    containerPrc = parseAmount(containerPrc, 4)
    return (
      <div className='modalDetailBox' id="dbClusterDetailInfo">
        <div className='configContent'>
          <div className='configHead'>租赁信息</div>
          <div className="containerPrc">
            <p><Icon type="pay-circle-o" /> 实例：<span className="unit">{ containerPrc.fullAmount }/（个*小时）</span> * {databaseInfo.podInfo.desired}个</p>
            <p><Icon type="hdd" /> 存储：<span className="unit">{ storagePrc.fullAmount }/（GB*小时）</span> * {databaseInfo.podInfo.desired}个</p>
          </div>
          <div className="countPrice">
            合计价格：<span className="unit">{hourPrice.unit =='￥' ? '￥': ''}</span><span className="unit blod">{hourPrice.amount}{hourPrice.unit =='￥' ? '': ' T'}/小时</span> <span className="unit" style={{marginLeft:'10px'}}>（约：{countPrice.fullAmount}/月）</span>
          </div>
        </div>
      </div>
    )
  }
}

class ModalDetail extends Component {
  constructor() {
    super()
    this.state = {
      currentDatabase: null,
      activeTabKey:'#BaseInfo',
      putModaling: false
    }
  }
  deleteDatebaseCluster(dbName) {
    //this function for use delete the database
    const { deleteDatabaseCluster, cluster, scope, database } = this.props;
    const { loadDbClusterDetail } = scope.props;
    const _this = this
    const clusterTypes = scope.state.clusterTypes
    this.setState({delModal: false})
    let notification = new NotificationHandler()
    _this.setState({ deleteBtn: true })
    deleteDatabaseCluster(cluster, dbName, database, {
      success: {
        func: () => {
          notification.success('删除成功')
          scope.setState({
            detailModal: false
          });
        }
      },
      failed: {
        func: (res) => {
          scope.setState({
            detailModal: false
          });
          _this.setState({deleteBtn: false})
          notification.error('删除失败', res.message.message)
        }
      }
    });

  }

  componentWillMount() {
    const { loadDbClusterDetail, cluster, dbName } = this.props
    const _this = this
    this.setState({
      currentDatabase: dbName,
    });
    loadDbClusterDetail(cluster, dbName, {
      success: {
        func: (res) => {
          _this.setState({
            replicas: res.database.podInfo.desired,
            storageValue: parseInt(res.database.volumeInfo.size)
          })
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    //this function for user select different image
    //the nextProps is mean new props, and the this.props didn't change
    //so that we should use the nextProps
    const { loadDbClusterDetail, cluster, dbName } = nextProps;
    const _this = this
    if (dbName != this.state.currentDatabase) {
      this.setState({
        currentDatabase: dbName,
        deleteBtn: false
      })
      loadDbClusterDetail(cluster, nextProps.dbName, {
        success: {
          func: (res) => {
            _this.setState({ replicas: res.database.podInfo.desired })
          }
        }
      });
    }
  }
  refurbishDetail() {
    const { loadDbClusterDetail, cluster, dbName } = this.props
    const _this = this
    this.setState({
      currentDatabase: dbName,
    });
    loadDbClusterDetail(cluster, dbName, {
      success: {
        func: (res) => {
          _this.setState({ replicas: res.database.podInfo.desired })
        }
      }
    });
  }

  putModal() {
    const putVisible = this.props.scope.state.putVisible
    this.props.scope.setState({
      putVisible: !putVisible
    })
  }
  handSave() {
    const {putDbClusterDetail, cluster, dbName, loadDbCacheList, loadDbClusterDetail} = this.props
    const parentScope = this.props.scope
    const _this = this
    const notification = new NotificationHandler()

    this.setState({putModaling: true})
    putDbClusterDetail(cluster, dbName, this.state.replicas, {
      success: {
        func: (res) => {
          notification.success('更新成功')
          parentScope.setState({ detailModal: false })
          _this.setState({putModaling: false})
          loadDbCacheList(cluster, this.props.database)
          loadDbClusterDetail(cluster, dbName, {
            success: {
              func: (res) => {
                parentScope.setState({
                  replicas: res.database.podInfo.desired,
                  storageValue: parseInt(res.database.volumeInfo.size)
                })
              }
            }
          });
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          parentScope.setState({ detailModal: false })
          _this.setState({putModaling: false})
          notification.error('更新失败', res.message.message)
        }
      }
    })
  }
  colseModal() {
    const storageValue = parseInt(this.props.databaseInfo.volumeInfo.size)
    this.putModal()
    this.setState({
      putModaling:false,
      replicas: this.props.databaseInfo.podInfo.desired,
      storageValue
    })
  }
  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    this.setState({
      activeTabKey
    })
  }
  logo(clusterType) {
    const logoMapping = {
      'mysql': mysqlImg,
      'redis': redisImg,
      'zookeeper': zkImg,
      'elasticsearch': esImg,
      'etcd': etcdImg,
    }
    if (!(clusterType in logoMapping)) {
      return redisImg
    }
    return logoMapping[clusterType]
  }
  dbStatus(phase) {
    if (phase.running >0) {
      return (<span className='running'><i className="fa fa-circle"></i> 运行中 </span>)
    }
    if (phase.padding >0) {
       return (<span className='padding'><i className="fa fa-circle"></i> 启动中 </span>)
    }
    if (phase.failed >0) {
       return (<span className='stop'><i className="fa fa-circle"></i> 启动失败 </span>)
    }
    return (<span className='stop'><i className="fa fa-circle"></i> 已停止 </span>)
  }
  render() {
    const { scope, dbName, isFetching, databaseInfo, domainSuffix, bindingIPs } = this.props;

    if (isFetching || databaseInfo == null) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }

    return (
      <div id='AppServiceDetail' className="dbServiceDetail">
        <div className='topBox'>
          <Icon className='closeBtn' type='cross' onClick={() => { scope.setState({ detailModal: false }) } } />
          <div className='imgBox'>
            <img src={ this.logo(this.props.database) } />
          </div>
          <div className='infoBox'>
            <p className='instanceName'>
              {databaseInfo.serviceInfo.name}
            </p>
            <div className='leftBox TenxStatus'>
              <div className="desc">{databaseInfo.serviceInfo.namespace} / {databaseInfo.serviceInfo.name}</div>
              <div> 状态：
                {this.dbStatus(databaseInfo.podInfo)}
              </div>

            </div>
            <div className='rightBox'>
              <div className='li'>
                <Button style={{marginRight:'10px'}} onClick={()=> this.refurbishDetail()}>
                  <i className="fa fa-refresh"></i>&nbsp;
                  刷新
                </Button>
                {this.state.deleteBtn ?
                  <Button size='large' className='btn-danger' type='ghost' loading={true}>
                    删除集群
                </Button>
                  :
                  <Button size='large' className='btn-danger' type='ghost' onClick={()=> this.setState({delModal: true}) }>
                    <Icon type='delete' />删除集群
                </Button>
                }
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <Modal title="删除集群操作" visible={this.state.delModal}
          onOk={()=> this.deleteDatebaseCluster(dbName)} onCancel={()=> this.setState({delModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除数据库 { dbName }?</div>
        </Modal>
        <div className='bottomBox'>
          <div className='siderBox'>
            <Tabs
              tabPosition='left'
              onTabClick={(e)=> this.onTabClick(e)}
              activeKey={this.state.activeTabKey}
              >
              <TabPane tab='基础信息' key='#BaseInfo'>
                <BaseInfo domainSuffix={domainSuffix} bindingIPs={bindingIPs} currentData={this.props.currentData.pods} databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
              </TabPane>
              <TabPane tab='访问方式' key='#VisitType'>
                <VisitTypes isCurrentTab={this.state.activeTabKey==='#VisitType'} domainSuffix={domainSuffix} bindingIPs={bindingIPs} currentData={this.props.currentData.pods} detailModal={this.props.detailModal}
                            databaseInfo={databaseInfo} storageValue={this.state.storageValue} database={this.props.database} dbName={dbName} scope= {this} />
              </TabPane>
              <TabPane tab='事件' key='#events'>
                <AppServiceEvent serviceName={dbName} cluster={this.props.cluster} type={'dbservice'}/>
              </TabPane>
              <TabPane tab='租赁信息' key='#leading'>
                <LeasingInfo databaseInfo={databaseInfo} scope= {this} />
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
    isFetching: false,
    cluster: cluster.clusterID,
    databaseInfo: null,
  }
  const { databaseClusterDetail } = state.databaseCache
  const { databaseInfo, isFetching } = databaseClusterDetail.databaseInfo || defaultMysqlList
  return {
    isFetching,
    cluster: cluster.clusterID,
    domainSuffix: cluster.bindingDomains,
    bindingIPs: cluster.bindingIPs,
    databaseInfo: databaseInfo,
    resourcePrice: cluster.resourcePrice //storage
    // podSpec: databaseInfo.pods[0].podSpec
  }
}

ModalDetail.PropTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  loadDbClusterDetail: PropTypes.func.isRequired,
  deleteDatabaseCluster: PropTypes.func.isRequired,
}

ModalDetail = injectIntl(ModalDetail, {
  withRef: true,
})

export default connect(mapStateToProps, {
  loadDbClusterDetail,
  deleteDatabaseCluster,
  putDbClusterDetail,
  loadDbCacheList,
  parseAmount
})(ModalDetail)
