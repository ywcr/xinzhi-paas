/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceLog component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component } from 'react'
import { DatePicker, Spin, Tabs, Row, Col } from 'antd'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/AppServiceLog.less"
import { formatDate } from '../../../common/tools'
import { DATE_PIRCKER_FORMAT, UPGRADE_EDITION_REQUIRED_CODE } from '../../../constants'
import { loadServiceLogs, clearServiceLogs } from '../../../actions/services'
import { loadContainerDetailEvents } from '../../../actions/app_manage'
import { throwError } from '../../../actions'
import { getQueryLogList } from '../../../actions/manage_monitor'
import { mode } from '../../../../configs/model'
import { STANDARD_MODE } from '../../../../configs/constants'
import moment from 'moment'
import merge from 'lodash/merge'
import NotificationHandler from '../../../common/notification_handler'
const RangePicker = DatePicker.RangePicker;
const YESTERDAY = new Date(moment(moment().subtract(1, 'day')).format(DATE_PIRCKER_FORMAT))
const standardFlag = (mode == STANDARD_MODE ? true : false);
const TabPane = Tabs.TabPane

class AppServiceLog extends Component {
  constructor(props) {
    super(props)
    this.resizeLog = this.resizeLog.bind(this)
    this.loadContainersEvents = this.loadContainersEvents.bind(this)
    this.moutseRollLoadLogs = this.moutseRollLoadLogs.bind(this)
    this.changeCurrentDate=this.changeCurrentDate.bind(this)
    this.state = {
      currentDate: formatDate(new Date(), DATE_PIRCKER_FORMAT),
      pageIndex: 1,
      pageSize: 200,
      useGetLogs: true,
      preScroll: 0,
      logSize: 'normal',
      serviceLogs: [],
      logList:[],
      status:'0',
      defaultValue:''
    }
  }
  componentWillMount() {
    this.setState({
      defaultValue:undefined
    })
    const { cluster, serviceName, loggingEnabled,getQueryLogList,conta} = this.props
    const self = this
    if (!loggingEnabled) {
      let notification = new NotificationHandler()
      notification.warn('尚未安装日志服务，无法查看日志')
      return
    }
      let dateStart='',dateEnd=''
      var time_out = (this.state.currentDate.replace(/[^\d.]/g, ""));
    if(this.state.currentDate!=''&&this.state.currentDate){
        dateStart=moment().subtract('hours',8).format('YYYY-MM-DDTHH:mm:ss')+'Z'
        dateEnd=((this.state.currentDate).split(' '))[0]+'T'+((this.state.currentDate).split(' '))[1]+'Z'
    }
     const {namespace} =this.props.serviceDetail.metadata
    //  notification.warn('尚未安装日志服务，无法查看日志')
    let notification = new NotificationHandler()
      conta==''?notification.warn('服务已停止，容器列表为空'):getQueryLogList(this.props.cluster,namespace,conta,  
          {
              from: 0,
              size: 200,
              direction:'forward',
              date_start: dateStart,
              date_end: dateEnd,
              log_type: 'stdout',
              serviceName:serviceName
            }
          ,{
          
          success: {
              func: (res) => {
                let list=[]
                  if(res.logs&&res.logs!=null) {
                    
                      this.setState({
                          status:'9',
                          fromPage: this.state.fromPage + 1,
                          logList: (this.state.logList).concat(res.logs),
                          all:'',
                          date_end:dateEnd,
                          date_start:dateStart,  
                      },(()=>{
                        this.state.logList.length>0?this.state.status='1':'-1'
                      }) )
                  }else if(res.logs==null){
                    this.setState({
                      status:'-1'
                    })
                  }
              },
              isAsync: true,
          }
      });
    this.setState({
      pageIndex: 2
    })
  }
  loadContainersEvents() {
    const { cluster, loadContainerDetailEvents, containers } = this.props
    containers.map(container => {
      loadContainerDetailEvents(cluster, container.metadata.name)
    })
  }
  componentWillUnmount() {
    const cluster = this.props.cluster
    const serviceName = this.props.serviceName
    this.props.clearServiceLogs(cluster, serviceName)
    window.onscroll = '';
  }
  componentDidMount() {
    // this.setState({
    //   defaultValue:undefined
    // })
}
  componentWillReceiveProps(nextProps) {
    
    const { serviceDetailmodalShow, serviceLogs, eventLogs, cluster ,containers} = nextProps
    this.setState({
      statusContainers:containers
    })
    if (this.props.activeKey == '#logs' && !serviceDetailmodalShow) {
      this.setState({logSize: 'normal'})
    }
     if(serviceDetailmodalShow == this.props.serviceDetailmodalShow) return
    //  if(!serviceDetailmodalShow){
    //    this.props.clearServiceLogs(this.props.cluster, this.props.serviceName)
    //    return
    //  }
    //  state = merge({}, state, {
    //    currentDate: formatDate(new Date(), DATE_PIRCKER_FORMAT),
    //    pageIndex: 1,
    //    pageSize: 200,
    //    useGetLogs: true,
    //    preScroll: 0,
    //    serviceLogs,
    //  })
    //  this.setState(state)
  setTimeout(() => {
    this.changeCurrentDate(new Date(), true, nextProps.cluster, nextProps.serviceName,this.props.conta)
  }, 1000);
     
  }
 regScroll(myHandler) {
    if (window.onscroll === null) {
        window.onscroll = myHandler
    } else if (typeof window.onscroll === 'function') {
        var oldHandler = window.onscroll;
        window.onscroll = function () {
            myHandler();
            oldHandler();
        }
    }
}
moutseRollLoadLogs() {
  const _this = this;
  if (Math.round(this.infoBox.scrollTop + this.infoBox.offsetHeight) != this.infoBox.scrollHeight) return
  const cluster = this.props.cluster
  const serviceName = this.props.serviceName
  const self = this
  const scrollBottom = this.infoBox.scrollBottom
  if (!this.props.loggingEnabled) {
    let notification = new NotificationHandler()
    notification.warn('尚未安装日志服务，无法查看日志')
    return
  }
    var body = {
      date_start: this.state.date_start,
      date_end: this.state.date_end,
      from:_this.state.pageIndex-1,
      size: 200,
      direction:'forward',
      keyword: '',
      log_type: 'stdout',
      serviceName:serviceName
    }
   const {containers,getQueryLogList,namespace} =this.props
    let tempList = [];
    containers.map((item) => {
        tempList.push(item)
    });
    let tempList2 = tempList.map((item) => {
      return item.metadata.name;
    })
    let notification = new NotificationHandler()
    tempList2==''?notification.warn('服务已停止，容器列表为空'):
      getQueryLogList(this.props.cluster,namespace,tempList2,body,{
        
        success: {
            func: (res) => {
              let list=[]
                if(res.logs&&res.logs!=null) {
                    this.setState({
                        fromPage: this.state.fromPage + 1,
                        logList: (this.state.logList).concat(res.logs),
                        all:''
                    },(()=>{

                    }))
                }
            },
            isAsync: true,
        }
    });
  this.setState({
    pageIndex: this.state.pageIndex + 1
  })
}
  changeCurrentDate(date, refresh, tcluster,tserviceName,statusContainers) {
    if(date[1]==null||date[0]==null){
      this.setState({
        defaultValue:undefined
      })
      return
    }else{
      this.setState({
        defaultValue:date
      })
    }
    const {loadServiceLogs,getQueryLogList,namespace,conta}=this.props
      if (!date) return
      const cluster = tcluster || this.props.cluster
      const serviceName = tserviceName || this.props.serviceName
      const self = this
      // this.props.clearServiceLogs(cluster, serviceName)
      if (!this.props.loggingEnabled) {
        let notification = new NotificationHandler()
        notification.warn('尚未安装日志服务，无法查看日志')
        return
      }
      this.setState({
        logList:[]
      })

      let date_end=moment(date[1]).format(DATE_PIRCKER_FORMAT)
      let date_start=moment(date[0]).format(DATE_PIRCKER_FORMAT)
      if(date[1]==date[0]){
        this.setState({
          date_end:(date_end.split(' ')[0])+'T'+(date_end.split(' ')[1])+'Z',
          // date_start:(date_start.split(' ')[0])+'T'+(date_start.split(' ')[1])+'Z'
          date_start:moment().subtract('hours',8).format('YYYY-MM-DDTHH:mm:ss')+'Z'
      },()=>{
        let notification = new NotificationHandler()
        this.props.conta==''?'':
        getQueryLogList(this.props.cluster,this.props.namespace,this.props.conta, {
              from: 0,
              direction:'forward',
              size: this.state.pageSize,
              date_start: this.state.date_start,
              date_end: this.state.date_end,
              log_type: 'stdout',
              serviceName:serviceName
          }, {
            success: {
              func: (res) => {
                let logList=[]
                  if(res.logs&&res.logs!=null) {
                      this.setState({
                         status:'9',
                          fromPage: this.state.fromPage + 1,
                          logList:[],
                          logList: (this.state.logList).concat(res.logs),
                          all:''
                      },(()=>{
                        this.state.logList.length>0?this.state.status='1':'-1'
                      })
                    )
                  }else if(res.logs==null){
                    this.setState({
                      status:'-1'
                    })
                  }
              },
              isAsync: true,
          }
          })
      })
      }else{
        this.setState({
          date_end:(date_end.split(' ')[0])+'T'+(date_end.split(' ')[1])+'Z',
          date_start:(date_start.split(' ')[0])+'T'+(date_start.split(' ')[1])+'Z'
      },()=>{
        let notification = new NotificationHandler()
        this.props.conta==''?notification.warn('服务已停止，容器列表为空'):
        getQueryLogList(this.props.cluster,this.props.namespace,this.props.conta, {
              from: 0,
              direction:'forward',
              size: this.state.pageSize,
              date_start: this.state.date_start,
              date_end: this.state.date_end,
              log_type: 'stdout',
              serviceName:serviceName
          }, {
            success: {
              func: (res) => {
                let logList=[]
                  if(res.logs&&res.logs!=null) {
                      this.setState({
                         status:'9',
                          fromPage: this.state.fromPage + 1,
                          logList:[],
                          logList: (this.state.logList).concat(res.logs),
                          all:''
                      },(()=>{
                        this.state.logList.length>0?this.state.status='1':'-1'
                      })
                    )
                  }else if(res.logs==null){
                    this.setState({
                      status:'-1'
                    })
                  }
              },
              isAsync: true,
          }
          })
      })
      }
     


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
  getLogs() {
    const { cluster } = this.props
    const { serviceLogs ,status } = this.state
    const clusterLogs = serviceLogs[cluster]
    const logs =this.state.logList
    let page = Math.ceil(logs.length / 200)
    let remainder = logs.length % 200
    switch(status){
      case '0':
     return '日志查询中'
      
      case '9':
      return <div className="loadingBox"><Spin size="large"></Spin></div>
      case '1':
       (()=>{
      })
      break
      case '-1':
    return '本服务没有日志'
    }
 

    function spellTimeLogs(time, log) {
      return (
        <span className='logDetailSpan'>
          { log.mark && <span className='markSpan'>[{log.mark}] </span> }
          { log.name && <span className='nameSpan'>[{log.name}] </span> }
          { <span className='timeSpan'>[{(time)}] </span> }
          { log.log }
        </span>
      )
    }
    const logContent = logs.map((log, index) => {
      let time = ''
      let newDate = new Date();
        if (log.timeNano) {
          time = newDate.setTime(log.timeNano / 1000000);
          time = formatDate(time)
        }
      if (index === 0) {
        if (log.log === '无更多日志\n') {
          return (<span key={index}>{ `${log.log}\npage ${page}\n` }</span>)
        }
        return (
          <span key={index}>
            { `page ${page}\n` }
            {spellTimeLogs(time, log)}
          </span>)
      }
      if (index + 1 === remainder && page !== 1) {
        return (
          <span key={index}>
            { `page ${--page}\n` }
            {spellTimeLogs(time, log)}
          </span>
        )
      }
      if ((index + 1) % 50 === 0 && page !== 1) {
        return (
          <span key={index}>
            { `page ${--page}\n` }
            {spellTimeLogs(time, log)}
          </span>
        )
      }
      return (
        <span key={log.id} index={index}>
          {spellTimeLogs(time, log)}
        </span>
      )
    })
    return logContent
  }

  refreshLogs() {
      const { cluster, serviceName, loggingEnabled,namespace ,conta} = this.props
      const self = this
        if (!loggingEnabled) {
          let notification = new NotificationHandler()
          notification.warn('尚未安装日志服务，无法查看日志')
          return
        }
        let dateStart='',dateEnd=''

      this.props.loadServiceLogs(cluster,namespace,serviceName, {
          from: 0,
          size: 200,
          direction:'forward',
          date_start: dateStart,
          date_end: dateEnd,
          log_type: 'stdout',
          serviceName:serviceName
      }, {
          success: {
            func(result) {
              self.infoBox.scrollTop = self.infoBox.scrollHeight
              if (!result.data || result.data.length < 50) {
                self.setState({
                  useGetLogs: false
                })
              }
              // Show events when log empty
              if (!result.data || result.data.length === 0) {
                self.loadContainersEvents()
              }
            },
            isAsync: true
          }
        })
  }
  resizeLog() {
    //this function for resize log modal to 'large' or 'normal'
    const { logSize } = this.state;
    if(logSize == 'normal') {
      this.setState({
        logSize: 'large'
      })
    } else {
      this.setState({
        logSize: 'normal'
      })
    }
  }
  disabledDate(current) {
      let dateTime=Date.now()-7*86400000;
      return  (current  &&  current.getTime() < dateTime) || current.getTime()> Date.now()
  }
   collectLogsTemplate(){
    const { serviceDetail, serviceName } = this.props
    let applog = {}
    let url = ''
    if(serviceDetail &&　serviceDetail.spec &&　serviceDetail.spec.template && serviceDetail.spec.template.metadata && serviceDetail.spec.template.metadata.annotations && serviceDetail.spec.template.metadata.annotations.applogs){
      let arr = JSON.parse(serviceDetail.spec.template.metadata.annotations.applogs)
      if(arr.length){
        applog = arr[0]
        url = '/manange_monitor/query_log?from=serviceDetailLogs&serviceName=' + serviceName + '&servicePath=' + applog.path
      }
    }
    return <div>
      <div className='info'>
        <Row className='rowStyle'>
          <Col span={6}>来源类型</Col>
          <Col span={18}>{applog.path ? '目录' : '不采集'}</Col>
        </Row>
        <Row className='rowStyle'>
          <Col span={6}>日志目录</Col>
          <Col span={18}>{applog.path || '--'}</Col>
        </Row>
        <Row className='rowStyle'>
          <Col span={6}>采集规则</Col>
          <Col span={18}>{applog.inregex || '--'}</Col>
        </Row>
        <Row className='rowStyle'>
          <Col span={6}>排除规则</Col>
          <Col span={18}>{applog.exregex || '--'}</Col>
        </Row>
      </div>
      {
        applog.path
          ? <div className="footer">
            <span onClick={() => browserHistory.push(url)}>
              日志查询>>
            </span>
        </div>
          : null
      }
    </div>
  }
  render() {
    return (
      <div id="AppServiceLog">
        <div className='body'>
          <Tabs type="card" className='logTabs'>
            <TabPane key="0" tab="标准日志">
              <div className={ this.state.logSize == 'large' ? "largeBox bottomBox" : "bottomBox"}>
                <div className="introBox">
               
                  <div className="operaBox">
                  {/* <i className="fa fa-expand">默认显示8小时</i> */}
                    <i className="fa fa-expand" onClick={this.resizeLog}></i>
                    <i className="fa fa-refresh" onClick={() => { this.refreshLogs() } }></i>
                    <RangePicker
                      showTime 
                      format="yyyy/MM/dd HH:mm:ss"
                      value={this.state.defaultValue}
                      disabledDate={this.disabledDate}
                      onChange={(date) => this.changeCurrentDate(date) }
                      />
                  </div>
                  {this.state.date_end!=''||this.state.date_end!='null'||this.state.date_end!='undefined'?<div className="infoBox" ref={(c) => this.infoBox = c} onScroll ={ this.moutseRollLoadLogs }>
                    <pre> { this.getLogs() } </pre>
                  </div>:''}
                  <div style={{ clear: "both" }}></div>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
            </TabPane>
            <TabPane key="1" tab="采集日志">
              <div className='collectLogs'>
                { this.collectLogsTemplate() }
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { loginUser, current } = state.entities

  const {conta} =state.services.serviceContainers
  const {namespace}=current.space
  const { containerDetailEvents } = state.containers
  const { cluster } = props
  const defaultEvents = {
    isFetching: false,
    eventList: []
  }
  let allContainerEvents = containerDetailEvents[cluster]
  const eventLogs = []
  if (!allContainerEvents) {
    allContainerEvents = {}
  }
  for(let key in allContainerEvents) {
    if (allContainerEvents.hasOwnProperty(key)) {
      let events = allContainerEvents[key] || defaultEvents
      let { eventList } = events
      eventList.map((event, index) => {
        let { type, message, lastSeen, objectMeta } = event
        let timeNano = + new Date(lastSeen) * 1000000 + ''
        let eventLog = {
          id: `${objectMeta.name}_${index}`,
          name: key,
          mark: 'event',
          kind: 'instance',
          timeNano: timeNano,
          log: message + '\n',
        }
        /*if (type !== 'Normal') {
          eventLog.log += ` <font color="orange">${message}</font>`
        } else {
          eventLog.log += ` <font>${message}</font>`
        }*/
        eventLogs.push(eventLog)
      })
    }
  }
  let loggingEnabled = true
  if (current && current.cluster && current.cluster.disabledPlugins) {
    loggingEnabled = !current.cluster.disabledPlugins['logging']
  }
  return {
    loginUser: loginUser.info,
    serviceLogs: state.services.serviceLogs,
    eventLogs,
    conta,
    namespace,
    loggingEnabled: loggingEnabled
  }
}
AppServiceLog = connect(mapStateToProps, {
  loadServiceLogs,
  clearServiceLogs,
  throwError,
  getQueryLogList,
  loadContainerDetailEvents,
})(AppServiceLog)

export default AppServiceLog
