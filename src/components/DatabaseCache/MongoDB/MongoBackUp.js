/*
*Author:Dujingya
*Create time：2017-09-13 10:41
*Description:
*/
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
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Input, Select,Slider, InputNumber, Button, Form, Icon ,message, Radio } from 'antd'
import { deleteDatabaseRedis,backUpCluster,Timeline,fetch_backup_list, putDbClusterDetail,ClearNodeList,RdbsModifyParametersCluster,MonitorMetricList,MonitorList,MongoDbNodesCluster,NodesMonitorCluster,RdbsParametersCluster } from '../../../actions/database_cache'
import NotificationHandler from '../../../common/notification_handler'
import '../style/CreateDatabase.less'
import { camelize } from 'humps'
let notification = new NotificationHandler()

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;


/*==================备份=====================*/
class MongoBackUp extends Component{
    constructor(props){
        super(props)
        this.state={
            loading:false
        }
        this.handleReset=this.handleReset.bind(this)
        this.createBackup=this.createBackup.bind(this)
    }

    databaseName(rule, value, callback) {
        //this function for check the new database name is exist or not
        if (!Boolean(value)) {
            callback();
            return
        } else {
            if (value.length < 3) {
                callback([new Error('数据库名称长度不能少于3位')]);
            }
            if (value.length > 12) {
                callback([new Error('数据库名称长度不高于12位')]);
            }
            let repetition = /([-])\1/;
            let checkName = /^[a-z]([-a-z0-9]*[a-z0-9])$/;
            if(!repetition.test(value)){
              if (!checkName.test(value)) {
                callback([new Error('名称仅由小写字母、数字和横线组成，且以小写字母开头')]);
              }
            }else{
              callback([new Error('不允许输入连续字符[-]')]);
            }
        }
        callback()
    }

    handleReset(e) {
        //this function for reset the form
        e.preventDefault();
        this.props.form.resetFields();
        const { scope } = this.props;
        scope.setState({
            backupModalShow: false
        });
    }
     createBackup(e){
         e.preventDefault();
         const _this = this;
         const { scope,currentData,type ,fetch_backup_list,backUpCluster,CreateDbRedisCluster, setCurrent} = this.props;
         this.props.form.validateFields((errors, values) => {
             if (!!errors) {
                 return;
             }
             let arrId=[],backId=''
             if(type=='rdbs'){
                 backId=currentData.rdbId
             }else if(type=='mongos'){
                 backId=currentData.mongoId
             }else if(type=='cache'){
                 backId=currentData.cacheId
             }
             if(values.name==''){
                 return
             }
             arrId.push(backId)
             let body = {
                 "cluster":_this.props.cluster,
                 "is_full":1,
                 "resources":arrId,
                 "snapshot_name":values.name
             }

             let notification = new NotificationHandler()
             this.setState({
                 loading:true
             })

             backUpCluster(body,{
                 success: {
                     func: (res)=> {
                         this.setState({
                             loading:false
                         })
                         notification.success('创建成功')
                         fetch_backup_list(body.cluster,backId)
                         this.props.scope.setState({
                             backupModalShow: false
                         })

                     },
                     isAsync: true
                 },
                 failed: {
                     func: (res)=> {
                         if (res.statusCode == 409) {
                             notification.error('数据库服务 ' + values.name + ' 同已有资源冲突，请修改名称后重试')
                         } else {
                             notification.error(res.message)
                         }
                     }
                 },
                 finally: {
                     func:()=> {
                         this.setState({loading: false})
                     }
                 }
             });
         });
     }
    render(){
        const {currentData,type} = this.props;
        const {getFieldProps, getFieldError, isFieldValidating ,getFieldValue} = this.props.form;
        const nameProps = getFieldProps('name', {
            rules: [
                { required: true, whitespace: true ,message:'请输入名称'},
                { validator: this.databaseName },
            ],
        });

        let dbName='',dbId='';
        if(type=='rdbs'){
              dbName=currentData.rdbName
              dbId=currentData.rdbId

        }else if(type=='mongos'){
            dbName=currentData.mongoName
            dbId=currentData.mongoId
        }else if(type=='cache'){
            dbName=currentData.cacheName
            dbId=currentData.cacheId
        }

        return (
            <div id='Createbackgup' type='right'>
                <div  className='priceTip'>
                    <h2>计费说明:</h2>
                    <p>备份的价格=备份链上所有备份点空间总和(GB)*¥0.0004每小时，<span>不足1GB按1GB计算</span></p>
                </div>
                <Form horizontal >
                    <div className='infoBox'>
                        <div className='commonBox'>
                            <div className='title'>
                                <span>名称</span>
                            </div>
                            <div className='inputBox'>
                                <FormItem
                                    hasFeedback
                                    help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                                >
                                    <Input {...nameProps} size='large' id="dbUserName" placeholder="请输入名称"  />
                                </FormItem>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                        <div className='commonBox'>
                            <div className='title'>
                                <span className='font awesome'>资源</span>
                            </div>
                            <div className='inputBox'>
                                <label className="inline">
                                    <svg className='database commonImg'><use xlinkHref='#database' /></svg>&nbsp;{dbName}&nbsp;<a className="id" href="" data-permalink="">({dbId})</a><input type="hidden" name="resources" value="mongo-qyieq5po"/></label>
                            </div>
                            <div style={{ clear: 'both' }}></div>
                        </div>
                    </div>
                    <div className='btnBox'>
                        <Button size='large' onClick={this.handleReset}>
                            取消
                        </Button>
                            <Button size='large' type='primary' onClick={this.createBackup}>
                                确定
                          </Button>
                        
                    </div>
                </Form>
            </div>
        )
    }
}


function mapStateToProps(state, props) {
    const { cluster } = state.entities.current
    const defaultMysqlList = {
        cluster: cluster.clusterID,
        isFetching: false,
        database: 'mongos',
        databaseList: [],
        nodeMonitorList:[],
        paramtersList:[],
        backUpList:[]

    }
    const { databaseBackUpList,databaseAllNodesList,databaseMonitorList,databaseMonitorMetricList,databaseAllConfigList ,databaseModifyAllConfigList} = state.databaseCache
    const { database, databaseList, isFetching } = databaseAllNodesList.mongos || defaultMysqlList
    const {paramtersList}=databaseAllConfigList.mongos || defaultMysqlList
    const {paramters}=databaseModifyAllConfigList.mongos||defaultMysqlList
    const {nodesMonitorList}=databaseMonitorList.mongos || defaultMysqlList
    const {monitorMetricList}=databaseMonitorMetricList.mongos||defaultMysqlList
    const {backUpList}=databaseBackUpList.mongos||defaultMysqlList


    return {
        database:isFetching,
        isFetching:isFetching,
        cluster: cluster.clusterID,
        domainSuffix: cluster.bindingDomains,
        bindingIPs: cluster.bindingIPs,
        resourcePrice: cluster.resourcePrice, //storage
        databaseList,
        paramtersList,
        nodesMonitorList,
        monitorMetricList,
        backUpList
    }
}

MongoBackUp = createForm()(MongoBackUp);

MongoBackUp.PropTypes = {
    intl: PropTypes.object.isRequired,
    MongoDbNodesCluster:PropTypes.func.isRequired,
    fetch_backup_list:PropTypes.func.isRequired,
    MonitorList:PropTypes.func.isRequired,
    backUpCluster:PropTypes.func.isRequired,
    MonitorMetricList:PropTypes.func.isRequired,
    RdbsModifyParametersCluster:PropTypes.func.isRequired,
    RdbsParametersCluster:PropTypes.func.isRequired,
    databaseAllNodesList: PropTypes.func.isRequired,
    NodesMonitorCluster:PropTypes.func.isRequired,
}

MongoBackUp = injectIntl(MongoBackUp, {
    withRef: true,
})

export default connect(mapStateToProps, {
    putDbClusterDetail,
    MongoDbNodesCluster,
    backUpCluster,
    fetch_backup_list,
    RdbsModifyParametersCluster,
    MonitorList,
    MonitorMetricList,
    NodesMonitorCluster,
    ClearNodeList,
    RdbsParametersCluster
})(MongoBackUp)
