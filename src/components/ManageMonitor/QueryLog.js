/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Operation Audit list
 *
 * v2.0 - 2016-11-02
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Row,Card, Select, Button,Col,Alert, DatePicker, Input, Spin, Popover, Icon, Checkbox,Modal, Radio, Form, Tooltip } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getQueryLogList, getServiceQueryLogList } from '../../actions/manage_monitor'
import { loadServiceContainerList } from '../../actions/services'
import { loadUserTeamspaceList } from '../../actions/user'
import { throwError } from '../../actions'
import { getClusterOfQueryLog, getServiceOfQueryLog } from '../../actions/manage_monitor'
import './style/QueryLog.less'
import { formatDate } from '../../common/tools'
import NotificationHandler from '../../common/notification_handler.js'
import { mode } from '../../../configs/model'
import { STANDARD_MODE } from '../../../configs/constants'
import { UPGRADE_EDITION_REQUIRED_CODE, DATE_PIRCKER_FORMAT } from '../../constants'
import moment from 'moment'
import Title from '../Title'
import cloneDeep from 'lodash/cloneDeep'
import classNames from 'classnames'
import { setTimeout } from 'timers';
const YESTERDAY = new Date(moment(moment().subtract(1, 'day')).format(DATE_PIRCKER_FORMAT))
const standardFlag = (mode == STANDARD_MODE ? true : false);
const Option = Select.Option;
const menusText = defineMessages({
  headTitle: {
    id: 'ManageMonitor.QueryLog.headTitle',
    defaultMessage: '日志查询 | 新智云',
  },
  title: {
    id: 'ManageMonitor.QueryLog.title',
    defaultMsessage: '日志查询',
  },
  user: {
    id: 'ManageMonitor.QueryLog.user',
    defaultMsessage: '空间',
  },
  selectUser: {
    id: 'ManageMonitor.QueryLog.selectUser',
    defaultMsessage: '选择用户',
  },
  cluster: {
    id: 'ManageMonitor.QueryLog.cluster',
    defaultMsessage: '集群',
  },
  selectCluster: {
    id: 'ManageMonitor.QueryLog.selectCluster',
    defaultMsessage: '选择集群',
  },
  service: {
    id: 'ManageMonitor.QueryLog.service',
    defaultMsessage: '服务',
  },
  selectService: {
    id: 'ManageMonitor.QueryLog.selectService',
    defaultMsessage: '选择服务',
  },
  instance: {
    id: 'ManageMonitor.QueryLog.instance',
    defaultMsessage: '实例',
  },
  selectInstance: {
    id: 'ManageMonitor.QueryLog.selectInstance',
    defaultMsessage: '选择实例',
  },
  startTime: {
    id: 'ManageMonitor.QueryLog.startTime',
    defaultMsessage: '开始',
  },
  endTime: {
    id: 'ManageMonitor.QueryLog.endTime',
    defaultMsessage: '结束',
  },
  keyword: {
    id: 'ManageMonitor.QueryLog.keyword',
    defaultMsessage: '关键词',
  },
  search: {
    id: 'ManageMonitor.QueryLog.search',
    defaultMsessage: '立即查询',
  },
  noNamespace: {
    id: 'ManageMonitor.QueryLog.noNamespace',
    defaultMsessage: '请选择空间',
  },
  noCluster: {
    id: 'ManageMonitor.QueryLog.noCluster',
    defaultMsessage: '请选择集群',
  },
  noService: {
    id: 'ManageMonitor.QueryLog.noService',
    defaultMsessage: '请选择服务',
  },
  noInstance: {
    id: 'ManageMonitor.QueryLog.noInstance',
    defaultMsessage: '请选择实例',
  },
  searchType: {
    id: 'ManageMonitor.QueryLog.searchType',
    defaultMsessage: '模糊查询',
  },
  allBtn: {
    id: 'ManageMonitor.QueryLog.allBtn',
    defaultMsessage: '全选',
  },
  cancelBtn: {
    id: 'ManageMonitor.QueryLog.cancelBtn',
    defaultMsessage: '取消',
  },
});

function checkClass(popup, isError) {
  if (isError) {
    return 'cloneSelectError cloneSelectInput';
  } else if (popup) {
    return 'cloneSelectInputClick cloneSelectInput';
  } else {
    return 'cloneSelectInput';
  }
}

function keywordFormat(log, scope) {
  let str = scope.state.key_word;
  if(str != '*') {
    let reg = new RegExp(str, "gi");
    log = log.replace(reg, "<font style='color:rgb(255, 255, 0)'>" + str + "</font>");
    return log;
  } else {
    return log;
  }
}

function timeFormat(time) {
  let newDate = new Date();
  time = parseInt(time);
  let newTime = newDate.setTime(time / 1000000);
  return formatDate(newTime);
}

function instanceSelected(config, instance) {
  //this function for view to user which instance is selected
  let selectedFlag = false;
  config.map((item) => {
    if (item == instance) {
      selectedFlag = true;
    }
  })
  if (selectedFlag) {
    return 'instanceSelected instanceDetail';
  } else {
    return 'instanceDetail';
  }
}
let lastScrollTop=0;
let NamespaceModal = React.createClass({ // 选择空间
  propTypes: {
    namespace: React.PropTypes.array
  },
  getInitialState: function () {
    return {
      currentList: []
    };
  },
  componentWillMount: function () {
    const {namespace} = this.props;
    this.setState({
      currentList: namespace
    });
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {namespace, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    namespace.map((item) => {
      if (item.spaceName.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  render: function () {
    const { scope, defaultNamespace } = this.props;
    let namespaceList = null;
    if (this.state.currentList.length == 0) {
      namespaceList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      namespaceList = this.state.currentList.map((item, index) => {
        return (
          <div className='namespaceDetail' key={index} onClick={scope.onSelectNamespace.bind(scope, item.spaceName, item.teamID, item.namespace)}>
            {item.spaceName}
          </div>
        )
      });
    }
    return (
      <div className='namespaceModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput namespaceInput' onChange={this.inputSearch} type='text' size='large' />
        </div>
        <div className='dataList'>
          <div className='namespaceDetail' key='defaultNamespace' onClick={scope.onSelectNamespace.bind(scope, '我的空间', 'default', defaultNamespace)}>
            <span>我的空间</span>
          </div>
          <div style={{margin: 1, overflow: 'scroll', height: 200}}>
      <div style={{ background: '#eee', position: 'relative' }} id="area">
      {namespaceList}
      </div>
    </div>
        </div>
      </div>
    )
  }
});

let ClusterModal = React.createClass({
  propTypes: {
    cluster: React.PropTypes.array
  },
  getInitialState: function () {
    return {
      currentList: []
    };
  },
  componentWillMount: function () {
    const {cluster} = this.props;
    this.setState({
      currentList: cluster
    });
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      currentList: nextProps.cluster
    })
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {cluster, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    cluster.map((item) => {
      if (item.clusterName.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  render: function () {
    const {scope, isFetching, cluster} = this.props;
    let clusterList = null;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (this.state.currentList.length == 0) {
      clusterList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      clusterList = this.state.currentList.map((item, index) => {
        return (
          <div className='clusterDetail' key={index} onClick={scope.onSelectCluster.bind(scope, item.clusterName, item.clusterID)}>
            <span className='leftSpan'>{item.clusterName}</span>
            <span className='rightSpan'>{item.instanceNum}</span>
            <span style={{ clear: 'both' }}></span>
          </div>
        )
      });
    }
    return (
      <div className='clusterModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput clusterInput' onChange={this.inputSearch} type='text' size='large' />
          <div className='titleBox'>
            <span className='leftSpan'>名称</span>
            <span className='rightSpan'>实例</span>
            <span style={{ clear: 'both' }}></span>
          </div>
        </div>
        <div className='dataList'>
          {clusterList}
        </div>
      </div>
    )
  }
});

let ServiceModal = React.createClass({// 服务
  propTypes: {
    service: React.PropTypes.array
  },
  getInitialState: function () {
    return {
      currentList: []
    };
  },
  componentWillMount: function () {
    const {service} = this.props;
    this.setState({
      currentList: service
    });
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      currentList: nextProps.service
    })
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {service, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    service.map((item) => {
      if (item.serviceName.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  render: function () {
    const {service, scope, isFetching, logType} = this.props;
    let serviceList = null;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (this.state.currentList.length == 0) {
      serviceList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      let mapCurrentList = this.state.currentList
      if(logType == 'file'){
        mapCurrentList = this.state.currentList.filter((item, index) => {
          if(item.annotations.annotations && item.annotations.annotations.applogs !== undefined){
            return item
          }
        })
      }
      if(mapCurrentList.length == 0){
        serviceList = (
          <div className='loadingBox'>
            <span>没数据哦</span>
          </div>
        )
      } else {
        serviceList = mapCurrentList.map((item, index) => {
          return (
            <div className='serviceDetail' key={index} onClick={scope.onSelectService.bind(scope, item.serviceName)}>
              <span className='leftSpan'>{item.serviceName}</span>
              <span className='rightSpan'>{item.instanceNum}</span>
              <span style={{ clear: 'both' }}></span>
            </div>
          )
        });
      }
    }
    return (
      <div className='serviceModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput serviceInput' onChange={this.inputSearch} type='text' size='large' />
          <div className='titleBox'>
            <span className='leftSpan'>名称</span>
            <span className='rightSpan'>实例</span>
            <span style={{ clear: 'both' }}></span>
          </div>
        </div>
        <div className='dataList'>
          {serviceList}
        </div>
      </div>
    )
  }
});

let InstanceModal = React.createClass({ // 实例
  propTypes: {
    instance: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      currentList: []
    };
  },
  componentWillMount: function () {
    const {instance} = this.props;
    this.setState({
      currentList: instance
    });
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      currentList: nextProps.instance
    })
  },
  inputSearch: function (e) {
    //this function for user search namespace
    const {instance, scope} = this.props;
    let value = e.target.value;
    let tempList = [];
    instance.map((item) => {
      if (item.name.indexOf(value) > -1) {
        tempList.push(item)
      }
    });
    this.setState({
      currentList: tempList
    });
  },
  onSelectAllInstances() {
    //this function for user select all instance
    const { scope } = this.props;
    const { currentList } = this.state;
    let tempList = currentList.map((item) => {
      return item.metadata.name;
    })
    scope.setState({
      all:'all',
      currentInstance: tempList,
      instancePopup: false,
      selectedInstance: false
    });
    var all = scope.state.all
    this.setState({
      all : all
    })
  },
  onCancelSelectedAllInstance() {
    //this function for user cancel select all instance
    const { scope } = this.props;
    scope.setState({
      currentInstance: [],
      instancePopup: false
    });
  },
  render: function () {
    const {scope, isFetching} = this.props;
    const {currentList} = this.state;
    let instanceList = null;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (currentList.length == 0) {
      instanceList = (
        <div className='loadingBox'>
          <span>没数据哦</span>
        </div>
      )
    } else {
      instanceList = currentList.map((item, index) => {
        return (
          <div className={instanceSelected(scope.state.currentInstance, item.metadata.name)} key={index} onClick={scope.onSelectInstance.bind(scope, item.metadata.name)}>
            {item.metadata.name}
          </div>
        )
      });
    }
    return (
      <div className='instanceModal'>
        <div className='searchBox'>
          <Input className='commonSearchInput instanceInput' onChange={this.inputSearch} type='text' size='large' />
          <div className='btnBox'>
            <div className='allBtn' onClick={this.onSelectAllInstances}>
              <FormattedMessage {...menusText.allBtn} />
            </div>
            <div className='confirmBtn' onClick={() => scope.setState({instancePopup: false})}>
              确定
            </div>
            <div className='cancelBtn' onClick={this.onCancelSelectedAllInstance}>
              <FormattedMessage {...menusText.cancelBtn} />
            </div>
          </div>
        </div>
        <div className='dataList'>
          {instanceList}
        </div>
      </div>
    )
  }
});

let LogComponent = React.createClass({
  getInitialState() {
    return {
      timeNano: null,
    }
  },
  searchLogContext(timeNano) {
    let { submitSearch } = this.props;
    submitSearch(timeNano, 'backward', {
      success: {
        func: () => {
          submitSearch(timeNano, 'forward', {
            success: {
              func: () => {
                setTimeout(() => {
                  const currentLog = document.getElementById(timeNano)
                  currentLog && currentLog.scrollIntoView()
                }, 30)
              },
              isAsync: true,
            }
          })
        },
        isAsync: true,
      }
    })
    this.setState({
      timeNano,
    })
  },
    componentDidMount(){
    },
    componetWillUnmount(){
    },

    isScrollToBottom(){
        const ele=document.getElementById('logList');
        let clientHeight=ele.clientHeight;
        let scrollTop=ele.scrollTop;
        let scrollHeight=ele.scrollHeight

        if((clientHeight+scrollTop+5)>scrollHeight){
            let { submitSearch } = this.props
            submitSearch()
        }

    },
  render: function () {
    let { logs, isFetching, scope, keyWords, backward } = this.props;
    const {status} = scope.state
    if(status == '0'){
      return (
        <div className='loadingBox'>
          暂无日志记录
        </div>
      )
    }else if(status == '9'){
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }else if(status == -1){
      return(
          <div className='loadingBox'>
                  本服务或容器没有日志
          </div>
      )
    }
    keyWords = keyWords && keyWords.trim()
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!logs || logs.length == 0) {
      let msg = '暂无日志记录'
      if (!scope.props.loggingEnabled) {
        msg = '尚未安装日志服务，无法查询日志'
      }
      return (
        <div className='loadingBox'>
          <span className='noDataSpan'>{msg}</span>
        </div>
      )
    }
    // 保存原有的 logs
    if (keyWords && !backward) {
      scope.stashLogs = cloneDeep(logs)
    }
    let logItems = logs.map((item, index) => {
      if(item&&item!=null){
          const logDetailClass = classNames({
              logDetail: true,
              logDetailActive: backward && item.timeNano === this.state.timeNano,
          })
          const logDetail = (
              <div className={logDetailClass} key={'logDetail' + index} id={item.timeNano}>
                <span className='instanceSpan'>{'[' + item.name + ']'}</span>
                <span className='instanceSpan'>{timeFormat(item.timeNano)}</span>
                <span className='logSpan'>
            <span dangerouslySetInnerHTML={{ __html: keywordFormat(item.log, scope) }}></span>
          </span>
              </div>
          )
          if (!keyWords || backward) {
              return logDetail
          }
          return (
              <Tooltip title="点击查看结果上下文" getTooltipContainer={() => document.getElementById('QueryLog')}>
                <div style={{cursor: 'pointer'}} onClick={this.searchLogContext.bind(this, item.timeNano)}>
                    {logDetail}
                </div>
              </Tooltip>
          )
      }

    })
    return (
      <div ref='logsList' id='logList' onScroll={this.isScrollToBottom} className='logList'>
        <pre>
          {logItems}
        </pre>
      </div>
    )
  }
});

class QueryLog extends Component {
  constructor(props) {
    super(props)
    this.onSelectNamespace = this.onSelectNamespace.bind(this);
    this.onSelectCluster = this.onSelectCluster.bind(this);
    this.onSelectService = this.onSelectService.bind(this);
    this.onSelectInstance = this.onSelectInstance.bind(this);
    this.hideUserPopup = this.hideUserPopup.bind(this);
    this.hideClusterPopup = this.hideClusterPopup.bind(this);
    this.hideServicePopup = this.hideServicePopup.bind(this);
    this.hideInstancePopup = this.hideInstancePopup.bind(this);
    this.onChangeStartTime = this.onChangeStartTime.bind(this);
    this.onChangeEndTime = this.onChangeEndTime.bind(this);
    this.onChangeKeyword = this.onChangeKeyword.bind(this);
    this.onChangeBigLog = this.onChangeBigLog.bind(this);
    this.onChangeQueryType = this.onChangeQueryType.bind(this);
    this.submitSearch = this.submitSearch.bind(this);
    this.throwUpgradeError = this.throwUpgradeError.bind(this);
    this.renderKeywordSpan = this.renderKeywordSpan.bind(this);
    this.firstSubmitSearch=this.firstSubmitSearch.bind(this);
    this.state = {
      namespacePopup: false,
      currentNamespace: null,
      namespaceList: null,
      clusterPopup: false,
      currentCluster: null,
      currentClusterId: props.cluster,
      clusterList: [],
      servicePopup: false,
      currentService: null,
      serviceList: [],
      instancePopup: false,
      currentInstance: [],
      instanceList: [],
      gettingNamespace: true,
      gettingCluster: false,
      gettingSerivce: false,
      gettingInstance: false,
      selectedNamespace: false,
      selectedCluster: false,
      selectedSerivce: false,
      selectedInstance: false,
      start_time: '',
      end_time: '',
      key_word: null,
      searchKeyword: null,
      bigLog: false,
      logButton:true,
      queryType: true,
      logType: 'stdout',
      path: '',
      backward: false,
      goBackLogs: false,
      searchStartTime:'',
      selectTime:'1',
      logUrl:'',
      searchEndTime:'',
      downLog:{},
      fromPage:0,
      logvisible:false,
      logList:[],
      confirmLoading:false,
      status:'0'
    }
  }


  disabledDate(current) {
    let dateTime=Date.now()-7*86400000;
    return  (current  &&  current.getTime() < dateTime) || current.getTime()> Date.now()
  }

  componentWillMount() {
    const { loadUserTeamspaceList, current, query, intl,loginUser } = this.props;
    const { formatMessage } = intl;
    const _this = this;
    loadUserTeamspaceList('default', { size: 1000 }, {
      success: {
        func: (res) => {
          _this.setState({
            namespaceList: res.teamspaces,
            gettingNamespace: false
          })
        },
        isAsync: true
      }
    });
    const { serviceName,podName,time } = this.props.location.query;
    if(serviceName,podName){
      _this.setState({
        currentNamespace:serviceName
      },function(){
        _this.onSelectService(serviceName);
        _this.onSelectInstance(podName,true);
        _this.onChangeEndTime(time.split('/').join('-')+' 23:59:59')
        _this.onChangeStartTime(time.split('/').join('-')+' 00:00:00')
        setTimeout(function(){
          _this.firstSubmitSearch(1)
        },500)
      })
    }
    const { space, cluster } = current;
    const { spaceName, teamID, namespace } = space;
    this.onSelectNamespace(spaceName, teamID, namespace);
    const { clusterName, clusterID } = cluster;
    this.onSelectCluster(clusterName, clusterID, namespace);
    const { service } = space;
  }

  componentDidMount(){
    const { location, cluster, loadServiceContainerList,loginUser,current } = this.props
    const query = location.query
    let end_time = new Date()
    let current_time = new Date()
    let startTime = current_time.setDate(current_time.getDate() - 5)
    let start_time = new Date(startTime)
    this.onChangeEndTime(end_time)
    this.onChangeStartTime(start_time)
    if(query.from == 'serviceDetailLogs'){
      loadServiceContainerList(cluster,this.state.currentNamespace == "我的空间"?current.cluster.namespace:this.state.currentNamespace, query.serviceName, null, {
        success: {
          func: (res) => {
            this.setState({
              gettingInstance: false,
              instanceList: res.data
            })
          },
          isAsync: true
        }
      })
      this.setState({
        currentService: query.serviceName,
        path: query.servicePath,
        logType: 'file'
      })
    }
  }

  onSelectNamespace(name, teamId, namespace) {
    //this function for user get search 10-20 of namespace list
    const { getClusterOfQueryLog } = this.props;
    const _this = this;
    if (name != this.state.currentNamespace) {
      this.setState({
        gettingCluster: true,
        namespacePopup: false,
        currentNamespace: name,
        currentCluster: null,
        currentService: null,
        currentInstance: [],
        clusterList: [],
        serviceList: [],
        instanceList: [],
        selectedNamespace: false,
        searchNamespace: namespace
      });
      getClusterOfQueryLog(teamId, namespace, {
        success: {
          func: (res) => {
            _this.setState({
              clusterList: res.data,
              gettingCluster: false
            });
          },
          isAsync: true
        }
      });
    }
  }

  onSelectCluster(name, clusterId, namespace) {
    //this function for user get search 10-20 of service list
    const { getServiceOfQueryLog } = this.props;
    const _this = this;
    if (this.state.searchNamespace != undefined) {
      namespace = this.state.searchNamespace;
    }
    if (name != this.state.currentCluster) {
      this.setState({
        gettingSerivce: true,
        clusterPopup: false,
        currentCluster: name,
        currentClusterId: clusterId,
        currentService: null,
        currentInstance: [],
        serviceList: [],
        instanceList: [],
        selectedCluster: false,
      });
      getServiceOfQueryLog(clusterId, namespace, {
        success: {
          func: (res) => {
            _this.setState({
              serviceList: res.data,
              gettingSerivce: false
            });
          },
          isAsync: true
        }
      });
    }
  }

  onSelectService(name) {
    //this function for user get search 10-20 of service list
    const _this = this;
    if (name != this.state.currentService) {
      this.setState({
        gettingInstance: true,
        currentService: name,
        servicePopup: false,
        currentInstance: [],
        instanceList: [],
        selectedSerivce: false,
      });
      const { loadServiceContainerList,cluster,loginUser,teamspaces,current} = this.props;
      loadServiceContainerList(cluster,this.state.currentNamespace == "我的空间"?loginUser.namespace:this.state.currentNamespace,name, null, {
        success: {
          func: (res) => {
            let path = '未配置采集目录'
            if(res.data && res.data[0] && res.data[0].metadata && res.data[0].metadata.annotations && res.data[0].metadata.annotations.applogs){
              let applogs = JSON.parse(res.data[0].metadata.annotations.applogs)
              path = applogs[0].path
            }
            _this.setState({
              gettingInstance: false,
              instanceList: res.data,
              path,
            })
          },
          isAsync: true
        }
      });
    }
  }

  onSelectInstance(name,bool) {
    //this function for user get search 10-20 of instance list
    let selectedFlag = false;
    let selectedIndex = -1;
    this.setState({
      selectedInstance: false,
    })
    if(bool){
      selectedFlag = false;
      selectedIndex = -1;
    }else{
      this.state.currentInstance.map((item, index) => {
        if (name == item) {
          selectedFlag = true;
          selectedIndex = index;
        }
      });
    }
    if (selectedFlag) {
      let tempList = [];
      if (selectedIndex == 0) {
        tempList = this.state.currentInstance.slice(1);
      } else {
        tempList = this.state.currentInstance.slice(0, selectedIndex);
      }
      tempList.concat(this.state.currentInstance.slice(selectedIndex + 1));
      this.setState({
        currentInstance: tempList
      });
    } else {
      let tempList = this.state.currentInstance;
      tempList.push(name);
      this.setState({
        currentInstance: tempList
      });
    }
  }

  hideUserPopup(e) {
    //this function for change the popup status, and change the select box css
    this.setState({
      namespacePopup: e
    });
  }

  hideClusterPopup(e) {
    //this function for change the popup status, and change the select box css
    this.setState({
      clusterPopup: e
    })
  }

  hideServicePopup(e) {
    //this function for change the popup status, and change the select box css
    this.setState({
      servicePopup: e
    })
  }

  hideInstancePopup(e) {
    //this function for change the popup status, and change the select box css
    this.setState({
      instancePopup: e
    })
  }

  onChangeStartTime(date) {
    //this function for change the start time
    if(!Boolean(date)) {
      this.setState({
        start_time: null
      });
      return;
    }
      let dateStr = moment(date).format(DATE_PIRCKER_FORMAT)
      this.setState({
         start_time: dateStr
      });
      let dateFormat=(dateStr.split(' ')[0])+'T'+(dateStr.split(' ')[1])+'Z'
      let searchTime = this.throwUpgradeError(dateFormat)
      this.setState({
          searchStartTime:searchTime
      })
  }

  onChangeEndTime(date) {
    //this function for change the end time
    if(!Boolean(date)) {
      this.setState({
        end_time: null
      });
      return;
    }

      let dateStr = moment(date).format(DATE_PIRCKER_FORMAT)
      this.setState({
        end_time: dateStr
      });
      let dateFormat=(dateStr.split(' ')[0])+'T'+(dateStr.split(' ')[1])+'Z'
      let searchTime = this.throwUpgradeError(dateFormat)
      this.setState({
          searchEndTime:searchTime
      })

  }

  // The user of standard edition can only select today, if not open the upgrade modal
  throwUpgradeError(dateStr){
    if (new Date(dateStr) > YESTERDAY) {
      return dateStr
    }
    const { loginUser, throwError } = this.props
    if (!standardFlag || loginUser.envEdition > 0) {
      return dateStr
    }
    const error = new Error()
    error.statusCode = UPGRADE_EDITION_REQUIRED_CODE
    error.message = {
      details: {
        kind: 'Logging',
        level: '0',
      }
    }
    throwError(error)
    return ''
  }

  onChangeKeyword(e) {
    //this function for change the keyword
    this.setState({
      key_word: e.target.value
    });
  }

  onChangeQueryType(e) {
    this.setState({
      queryType: e.target.checked
    })
  }

  firstSubmitSearch(type){
    const _this = this
    if(type != 2){
      this.setState({
        logList:[],
        fromPage:0
      },function(){
        _this.submitSearch('','','',type)
      })
    }else{
      _this.submitSearch('','','',type)
    }
  }

  submitSearch(time_nano, direction, callback,type) {

    //this function for search the log
    //check user had selected all item
    const _this = this;
    let checkFlag = true;
    if (!Boolean(this.state.currentNamespace)) {
      this.setState({
        selectedNamespace: true
      });
      checkFlag = false;
    }
    if (!Boolean(this.state.currentCluster)) {
      this.setState({
        selectedCluster: true
      });
      checkFlag = false;
    }
    if (!Boolean(this.state.currentService)) {
      this.setState({
        selectedSerivce: true
      });
      checkFlag = false;
    }
    if (!checkFlag) {
      return;
    }
    this.setState({
      goBackLogs: false,
    })
    const { getQueryLogList, getServiceQueryLogList, logs,loginUser } = this.props;

    let key_word = this.state.key_word;
    if (this.state.queryType) {
      if (key_word && key_word.length > 0) {
        key_word = this.state.key_word.trim();
      }
    }
    let body = {
      date_start: this.state.searchStartTime,
      date_end: this.state.searchEndTime,
      from: this.state.fromPage,
      size: 200,
      direction:'forward',
      // keyword: key_word,
      log_type: this.state.logType,
      serviceName:this.state.currentService
    }
/**
 * 
 *  date_end:"2018-01-25T08:33:29Z"
    date_start:"2018-01-20T08:33:29Z"
    direction :"forward" 
    from : 0
    keyword : null
    kind : "service"
    log_type :  "stdout"
    serviceName  : "gogs"
    size :200
 * 
 * 
 * */
// date_end:"2018-01-25T08:38:15Z"
// date_start:"2018-01-25T00:38:15Z"
// direction:"forward"
// from:0
// log_type:"stdout"
// serviceName:"gogs"
// size:200




    var time1 = new Date(body.date_start).getTime();
    var time2 = new Date(body.date_end).getTime();
    if(time1>time2){
      const notification = new NotificationHandler()
      notification.warn('开始时间不能晚于结束时间')
      return;
    }
    if (time_nano) {
      body.time_nano = time_nano
    }
    if (direction) {
      body.direction = direction
    }
    // 查询上下文时删除 keyword
    if (direction) {
      delete body.keyword
      this.setState({
        backward: true,
      })
    } else {
      this.setState({
        backward: false,
      })
    }
    this.setState({
      searchKeyword: this.state.key_word,
      logButton:true,  
    });
    let instances = this.state.currentInstance.join(',');
    let services = this.state.currentService
    const thisUrl = window.location.hostname;
    const logNamespace = _this.state.currentNamespace =="我的空间"?loginUser.namespace:_this.state.currentNamespace
    if(type!=2){
      if(this.state.all=='all'){
        this.setState({
          status:'9'
        })
        getServiceQueryLogList(this.state.currentClusterId,this.state.currentNamespace, services, body,{
          success: {
              func: (res) => {
                if(res.logs&&res.logs!=null){
                    this.setState({
                        fromPage:this.state.fromPage+1,
                        logList: (this.state.logList).concat(res.logs),
                        all:'',
                        logUrl : `https://${thisUrl}:38080/api/v2/logs/downloadLogFile?category=1&kind=${instances.length!=0? "pod" : "service"}&log_type=${_this.state.logType}&namespace=${logNamespace}&instances=${instances}&service=${_this.state.currentService}`,
                        downLog:{
                          endTime:_this.state.searchEndTime,
                          startTime:_this.state.end_time,
                        }
                    },(()=>{
                      this.state.logList.length>0?this.state.status='1':'-1'
                    }))
                }else if(res.logs==null){
                  this.setState({
                    status:'-1'
                  })
                }
                if(this.state.logList.length!=0){
                  this.setState({
                    logButton:false
                  })
                }
              },
              isAsync: true,
          }

      })
      }else if(this.state.all!='all'&&instances){
        this.setState({
          status:'9'
        })
               getQueryLogList(this.state.currentClusterId,this.state.currentNamespace, instances, body,{
            success: {
                func: (res) => {
                  let list=[]
                    if(res.logs&&res.logs!=null) {
                        this.setState({
                            fromPage: this.state.fromPage + 1,
                            logList: (this.state.logList).concat(res.logs),
                            all:'',
                            logUrl : `https://${thisUrl}:38080/api/v2/logs/downloadLogFile?category=1&kind=${instances.length!=0? "pod" : "service"}&log_type=${_this.state.logType}&namespace=${logNamespace}&instances=${instances}&service=${_this.state.currentService}`,
                            downLog:{
                              endTime:_this.state.searchEndTime,
                              startTime:_this.state.end_time,
                            }
                        },(()=>{
                          this.state.logList.length>0?this.state.status='1':'-1'
                        }))
                    }else if(res.logs==null){
                      this.setState({
                        status:'-1'
                      })
                    }
                    if(this.state.logList.length!=0){
                      this.setState({
                        logButton:false
                      })
                    }
                },
                isAsync: true,
            }
        });
      }else{
        this.setState({
          status:'9'
        })
        getServiceQueryLogList(this.state.currentClusterId,this.state.currentNamespace, services, body,{
          success: {
              func: (res) => {
                if(res.logs&&res.logs!=null){
                    this.setState({
                        fromPage:this.state.fromPage+1,
                        logList: (this.state.logList).concat(res.logs),
                        all:'',
                        logUrl : `https://${thisUrl}:38080/api/v2/logs/downloadLogFile?category=1&kind=${instances.length!=0? "pod" : "service"}&log_type=${_this.state.logType}&namespace=${logNamespace}&instances=${instances}&service=${_this.state.currentService}`,
                        downLog:{
                          endTime:_this.state.searchEndTime,
                          startTime:_this.state.end_time,
                        }
                    },(()=>{
                      this.state.logList.length>0?this.state.status='1':'-1'
                    }))
                }else if(res.logs==null){
                    this.setState({
                      status:'-1'
                    })
                }
                if(this.state.logList.length!=0){
                  this.setState({
                    logButton:false
                  })
                }
              },
              isAsync: true,
          }

      })
    }
    }else{
      this.setState({
        logvisible:true
      })
    }
  }

  onChangeBigLog() {
    //this function for change the log box big or small
    this.setState({
      bigLog: !this.state.bigLog
    })
  }

  renderKeywordSpan() {
    const { searchKeyword, backward } = this.state
    let text = '结果查询页'
    if (!searchKeyword) {
      return text
    }
    if (!backward) {
      text = `关键词 ${searchKeyword} 结果查询页`
      return text
    }
    return [
      <span className="goBackLogs" onClick={() => this.setState({goBackLogs: true, backward: false})}>
        <Icon type="rollback" /> {text}
      </span>,
      <span className="anticonRight context"><Icon type="right" /></span>,
      <span className="context">结果行上下文</span>,
    ]
  }
  handleChange(value){
    this.setState({
      selectTime:value
    })
  }
  deriveLog(){
    const _this = this;
    const {loginUser} = this.props;
    let dateStr = moment(_this.state.end_time).subtract(_this.state.selectTime, "hours").format(DATE_PIRCKER_FORMAT)
    let dateFormat=(dateStr.split(' ')[0])+'T'+(dateStr.split(' ')[1])+'Z'
    let endTime = (moment(_this.state.end_time).format(DATE_PIRCKER_FORMAT))
    let endTimes = (endTime.split(' ')[0])+'T'+(endTime.split(' ')[1])+'Z'
    let startTime = this.throwUpgradeError(dateFormat)
    const notification = new NotificationHandler()
    let instances = this.state.currentInstance.join(',');
    let services = this.state.currentService
    const thisUrl = window.location.hostname;
    const logNamespace = _this.state.currentNamespace =="我的空间"?loginUser.namespace:_this.state.currentNamespace
    let logUrl = `https://${thisUrl}:38080/api/v2/logs/downloadLogFile?category=1&kind=${instances.length!=0? "pod" : "service"}&log_type=${_this.state.logType}&namespace=${logNamespace}&instances=${instances}&service=${services}`;
    
    notification.success('日志正在导出，请稍后。')
    try{
      window.location=logUrl+`&startTime=${startTime}&endTime=${endTimes}`      
    }catch(err){
      notification.warn('日志导出失败，请稍后重试。')
    }
    this.setState({
      logvisible:false,
    },function(){
      _this.setState({
        selectTime:"1",
      })
    })
  }
  render() {
    const { logs, isFetching, intl, defaultNamespace } = this.props;
    const { formatMessage } = intl;
    const scope = this;
    const { gettingNamespace,logList,logButton, start_time,selectTime, end_time, key_word, backward, goBackLogs,logvisible,confirmLoading ,status} = this.state;
    if (gettingNamespace) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    return (
      <QueueAnim className='QueryLogBox' type='right'>
        <div id='QueryLog' key='QueryLog' className={this.state.bigLog ? 'bigLogContainer' :''} >
          <Title title="日志查询" />
          <div className='logsOfType'>
            <Modal title="日志导出"
              visible={logvisible}
              onOk={this.deriveLog.bind(this)}
              confirmLoading={confirmLoading}
              onCancel={()=>{this.setState({logvisible:false,confirmLoading:false,selectTime:"1"})}}
            >
            <Alert message="以当前所选结束时间为节点，导出最近1小时、2小时、5小时内的日志。" type="info" />
            <Row>
              <Col span={4} style={{lineHeight: '30px',textAlign:'right'}}> 选择时间：</Col>
              <Col span={8} style={{'marginLeft':'10px'}}>
                <Select defaultValue="" value={selectTime} style={{ width: 120 }} onChange={this.handleChange.bind(this)}>
                    <Option value="1">1小时</Option>
                    <Option value="2">2小时</Option>
                    <Option value="5">5小时</Option>
                </Select>
              </Col>
            </Row>
            </Modal>
            <Form.Item
              labelCol={{span: 2}}
              wrapperCol={{span: 20}}
              label="日志类型"
              key="logOfType"
            >
              <Radio.Group>
                <Radio
                  checked={this.state.logType == 'stdout'}
                  onClick={() => {this.setState({logType: 'stdout', currentService: null, currentInstance: [],instanceList: []})}}
                  value="stdout"
                  key="stdout"
                >
                  标准日志查询
                </Radio>
                <Radio
                  checked={this.state.logType == 'file'}
                  onClick={() => {this.setState({logType: 'file', currentService: null, currentInstance: [], instanceList: []})}}
                  value="file"
                  key="file"
                >
                  采集日志查询
                </Radio>
              </Radio.Group>
            </Form.Item>
          </div>
          <div className='operaBox'>
            <div className='commonBox'>
              {/*空间*/}
              <span className='titleSpan'>{standardFlag ? [<span>团队：</span>] : [<FormattedMessage {...menusText.user} />]}</span>
              <Popover
                content={<NamespaceModal scope={scope} namespace={this.state.namespaceList} defaultNamespace={defaultNamespace} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideUserPopup}
                visible={this.state.namespacePopup}
                arrowPointAtCenter={true}
                >
                <div className={checkClass(this.state.namespacePopup, this.state.selectedNamespace)} >
                  <span className='selectedSpan'>{this.state.currentNamespace ? this.state.currentNamespace : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectUser} /></span>]}</span>
                  <Icon type='down' />
                  <span className='wrongSpan'><FormattedMessage {...menusText.noNamespace} /></span>
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'>{standardFlag ? [<span>区域：</span>] : [<FormattedMessage {...menusText.cluster} />]}</span>
              <Popover
                content={<ClusterModal scope={scope} cluster={this.state.clusterList} isFetching={this.state.gettingCluster} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideClusterPopup}
                visible={this.state.clusterPopup}
                arrowPointAtCenter={true}
                >
                <div className={checkClass(this.state.clusterPopup, this.state.selectedCluster)} >
                  <span className='selectedSpan'>{this.state.currentCluster ? this.state.currentCluster : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectCluster} /></span>]}</span>
                  <Icon type='down' />
                  <span className='wrongSpan'><FormattedMessage {...menusText.noCluster} /></span>
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.service} /></span>{/*服务*/}
              <Popover
                content={<ServiceModal scope={scope} service={this.state.serviceList} isFetching={this.state.gettingSerivce} logType={this.state.logType}/>}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideServicePopup}
                visible={this.state.servicePopup}
                arrowPointAtCenter={true}
                >
                <div className={checkClass(this.state.servicePopup, this.state.selectedSerivce)} >
                  <span className='selectedSpan'>{this.state.currentService ? this.state.currentService : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectService} /></span>]}</span>
                  <Icon type='down' />
                  <span className='wrongSpan'><FormattedMessage {...menusText.noService} /></span>
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.instance} /></span>{/*实例*/}
              <Popover
                content={<InstanceModal scope={scope} instance={this.state.instanceList} isFetching={this.state.gettingInstance} />}
                trigger='click'
                placement='bottom'
                getTooltipContainer={() => document.getElementById('QueryLog')}
                onVisibleChange={this.hideInstancePopup}
                visible={this.state.instancePopup}
                arrowPointAtCenter={true}
                >
                <div className={checkClass(this.state.instancePopup, this.state.selectedInstance).replace('cloneSelectError', '')} >

                  <span className='selectedSpan'>{this.state.currentInstance.length != 0 ? this.state.currentInstance.join(',') : [<span className='placeholderSpan'><FormattedMessage {...menusText.selectInstance} /></span>]}</span>
                  <Icon type='down' />
                  <span className='wrongSpan'><FormattedMessage {...menusText.noInstance} /></span>
                </div>
              </Popover>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.startTime} /></span>
              <DatePicker
                disabledDate={this.disabledDate}
                onChange={this.onChangeStartTime}
                showTime
                format="yyyy-MM-dd HH:mm:ss"
                 value={start_time}
                style={{ float: 'left', minWidth: '155px', width: 'calc(100% - 85px)' }}
                size='large' />
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.endTime} /></span>
              <DatePicker
                disabledDate={this.disabledDate}
                onChange={this.onChangeEndTime}
                showTime
                format="yyyy-MM-dd HH:mm:ss"
                 value={end_time}
                style={{ float: 'left', minWidth: '155px', width: 'calc(100% - 85px)' }}
                size='large' />
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <span className='titleSpan'><FormattedMessage {...menusText.keyword} /></span>
              <Input className='keywordInput' onChange={this.onChangeKeyword} style={{ float: 'left' }} size='large' />
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <Checkbox onChange={this.onChangeQueryType} checked={this.state.queryType} style={{ marginLeft: '29px', display: 'none' }}>
                <FormattedMessage {...menusText.searchType} /></Checkbox>
              <Button size='large' type='primary' onClick={()=>this.firstSubmitSearch(2)} style={{float:'right'}}>
                导出日志
              </Button>
              <Button className='searchBtn' size='large' type='primary'  onClick={() => this.firstSubmitSearch(1)} style={{ marginRight: '35px',float:'right' }} disabled={!this.props.loggingEnabled}>
                <i className='fa fa-wpforms'></i>
                <FormattedMessage {...menusText.search} />
              </Button>
              
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <Card className={this.state.bigLog ? 'bigLogBox logBox' : 'logBox'}>
            <div className='titleBox'>
              <span className='keywordSpan'>
                {this.renderKeywordSpan()}
                
              </span>
              {
                this.state.logType == 'file' && this.state.currentService
                ? <span className='filePath'>
                  采集日志目录：{this.state.path}
                </span>
                : null
              }
              <i className={this.state.bigLog ? 'fa fa-compress' : 'fa fa-expand'} onClick={this.onChangeBigLog} />
            </div>
            <div className='msgBox'>
              <LogComponent
                logs={
                  goBackLogs
                  ? this.stashLogs
                  : this.state.logList
                }
                isFetching={isFetching}
                scope={scope}
                keyWords={key_word}
                backward={backward}
                submitSearch={this.submitSearch}
              />
            </div>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { current, loginUser } = state.entities
  const { cluster, space } = current
  const defaultNamespace = space.namespace
  const { teamspaces } = state.user
  const { teamClusters } = state.team
  const defaultLogs = {
    cluster: cluster.clusterID,
    isFetching: false,
    logs: []
  }
  const defaultContainers = {
    containersList: {}
  }
  const { getQueryLog } = state.manageMonitor
  const { serviceContainers } = state.services
  const { logs, isFetching } = getQueryLog.logs || defaultLogs
  const containersList = serviceContainers[cluster.clusterID] || defaultContainers
  const { query } = props.location
  let loggingEnabled = true
  if (current && current.cluster && current.cluster.disabledPlugins) {
    loggingEnabled = !current.cluster.disabledPlugins['logging']
  }
  return {
    loginUser: loginUser.info,
    isTeamspacesFetching: teamspaces.isFetching,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    isTeamClustersFetching: teamClusters.isFetching,
    teamClusters: (teamClusters.result ? teamClusters.result.data : []),
    cluster: cluster.clusterID,
    clusters:cluster,
    containersList,
    isFetching,
    logs,
    current,
    query,
    loggingEnabled,
    defaultNamespace
  }
}

QueryLog.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
}

QueryLog = injectIntl(QueryLog, {
  withRef: true,
})

QueryLog = Form.create({})(QueryLog);

export default connect(mapStateToProps, {
  getQueryLogList,
  getServiceQueryLogList,
  loadServiceContainerList,
  loadUserTeamspaceList,
  getClusterOfQueryLog,
  getServiceOfQueryLog,
  throwError,
})(QueryLog)
