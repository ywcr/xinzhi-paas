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
import { Button, Icon, Spin, Modal, Collapse, Row, Col, Dropdown, Slider, Timeline, Popover,Input, InputNumber, Tabs, Tooltip, Card, Radio, Select, Form,Table} from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { deleteDatabaseConfigRedis, putDbClusterDetail, loadDbCacheRedisList,RdbsParametersCluster,RdbsModifyParametersCluster } from '../../../actions/database_cache'
import { getProxy } from '../../../actions/cluster'
import { calcuDate, formatDate} from '../../../common/tools.js'
import NotificationHandler from '../../../common/notification_handler'
import '../style/ModalDetail.less'
import mysqlImg from '../../../assets/img/database_cache/mysql.png'
import redisImg from '../../../assets/img/database_cache/redis.jpg'
import memcachedImg from '../../../assets/img/database_cache/memcached.png'
import zkImg from '../../../assets/img/database_cache/zookeeper.jpg'
import esImg from '../../../assets/img/database_cache/elasticsearch.jpg'
import etcdImg from '../../../assets/img/database_cache/etcd.jpg'

const Option = Select.Option;
const Panel = Collapse.Panel;
const ButtonGroup = Button.Group
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

class BaseInfo extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
  }
  render() {
    const {currentData} = this.props;
    return <div className='modalDetailBox' id="dbClusterDetailInfo">
        <div className='configContent'>
          <div>
            <ul className='parse-list'>
              <li><span className='key'>ID：</span> <span className='value' style={{color: '#2db7f5'}}>{currentData.cacheParameterGroupId}</span></li>
              <li><span className='key'>名称：</span> <span className='value'>{currentData.cacheParameterGroupName}</span></li>
              <li><span className='key'>描述：</span> <span className='value'>{currentData.description?currentData.description:'暂无描述'}</span></li>
              <li><span className='key'>类型：</span> <span className='value'>{currentData.cacheType}</span></li>
              <li><span className='key'>资源：</span> <span className='value'>{currentData.resources?currentData.resources:'暂无资源'}</span></li>
              <li><span className='key'>创建时间：</span> <span className='value'>{formatDate(currentData.createTime)}</span></li>              
            </ul>
          </div>
        </div>
      </div>
  }
}
class RedisCofigList extends Component{
     constructor(props){
         super(props)
         this.state={
             modify:false,
             inputVisible:false
         }
     }
     componentWillMount(){

     }

    modifyCofigList=()=>{
         this.setState({
             modify:true,
             inputVisible:true
         })
    }

    cancer=()=>{
         this.setState({
             modify:false,
             inputVisible:false
         })
    }
    handleSubmit=(e)=>{
        //this function for user submit the form
        e.preventDefault();
        const {getFieldProps, getFieldError, isFieldValidating ,getFieldValue} = this.props.form;
        const {cluster,RdbsModifyParametersCluster}=this.props.scope.props
        const {currentData}=this.props.scope.props;
        const _this=this

        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            }
            let parameters=[];
            for(let key in values){
                let object={};
                object.cache_parameter_name=key;
                object.cache_parameter_value=values[key]
                parameters.push(object)
            }

            let notification = new NotificationHandler()
            RdbsModifyParametersCluster(parameters,cluster,'cacheParameterGroups',currentData.cacheParameterGroupId,{
                success: {
                    func: ()=> {
                        notification.success('修改成功')
                        const {currentData,cluster,RdbsParametersCluster}=this.props.scope.props;

                        RdbsParametersCluster(cluster,'cacheParameterGroups',currentData.cacheParameterGroupId)
                        _this.setState({
                            modify:false,
                            inputVisible:false
                        })
                    },
                    isAsync: true
                },
                failed: {
                    func: (res)=> {
                        notification.error(res.message)
                    }
                },
                finally: {
                    func:()=> {
                        this.setState({loading: false})
                    }
                }
            })
        });
    }
     render(){
         const {scope,currentData,cluster}=this.props;
         const {paramtersList}=scope.props;
         const {getFieldProps, getFieldError, isFieldValidating ,getFieldValue} = this.props.form;
         const columns = [
             {
                 title: '参数',
                 dataIndex: 'cacheParameterName',
                 key:'cacheParameterName',
                 render: (text,record) =>{
                   if(record.isStatic!=0){
                      return <span href="#">{text}&nbsp;&nbsp;&nbsp;<span style={{color:'#ccc'}}>* 不支持集群服务</span></span>
                  }else{
                      return <span href="#">{text}</span>
                  }
                 }
             },
             {
                 title: '值',
                 dataIndex: 'cacheParameterValue',
                 key:'cacheParameterValue',
                 render:(text,record)=>{
                     const reg=/^[0-9]*$/;
                     if(this.state.inputVisible&&record.isReadonly==0){
                         if(text){
                             return   <FormItem style={{marginBottom:'0'}}><Input {...getFieldProps(`${record.cacheParameterName}`, {
                                 rules: [
                                     {required: true, message: '范围值'+record.valueRange}
                                 ],
                                 initialValue: `${text}`} )} size='large'   style={{ width: '180px', paddingRight:'28px'} }  /></FormItem>
                         }else{
                             return <span href="#" style={{width:'180px',display:'block'}}>{text}</span>
                         }
                     }else{
                         return <span href="#" style={{width:'180px',display:'block'}}>{text}</span>
                     }
                 }
             },
             {
                 title: '值范围',
                 dataIndex: 'valueRange',
                 key:'valueRange',
                 render: (text,record) =>{
                        return <span href="#">{text}</span>
                 }

             }
         ]
         return (
             <div className='modalDetailBox' >
                 <div className='configContent' style={{padding:'0px'}}>
                     {/*修改配置*/}
                     {this.state.modify==true?<div><Button style={{margin:'10px 20px'}} onClick={this.handleSubmit}  type="primary"  className="buttonClass">保存</Button>
                         <Button  onClick={this.cancer} type="primary" className="buttonClass">取消</Button></div>:
                         <Button  style={{margin:'10px 20px'}} onClick={this.modifyCofigList} type="primary" className="buttonClass">修改属性</Button>}
                     <Table style={{margin:'10px 20px'}} pagination={false}  columns={columns} dataSource={paramtersList.data.cacheParameterSet} />
                 </div>
             </div>
         )
     }
}

class ConfigModalDetail extends Component {
  constructor(props) {
    super(props)
    const {activeKey} = this.props;
    this.state = {
      delModal:false,
      deleteBtn:false,
      detailModal:false,
      activeKey
    }
  }
  componentWillMount() {
    const {currentData,cluster,RdbsParametersCluster}=this.props;

    RdbsParametersCluster(cluster,'cacheParameterGroups',currentData.cacheParameterGroupId)
  }

  componentWillReceiveProps() {
  }
  deleteRedis(){
    const {cluster,deleteDatabaseConfigRedis,currentData,scope} = this.props;
    const { getFieldProps } = this.props.form;
    let notification = new NotificationHandler()
    let _this = this;
    deleteDatabaseConfigRedis(cluster , currentData.cacheParameterGroupId ,'redis',{
      success: {
        func: () => {
          notification.success('删除成功')
          scope.setState({
            detailModal: false,
          });
          _this.setState({delModal:false})
        }
      },
      failed: {
        func: (res) => {
          _this.setState({delModal:false})
          scope.setState({
            detailModal: false,
          });
          notification.error('删除失败', res.message)
        }
      }
    });
  }
  changeTab(activeKey){
    if(activeKey=='#config'){
      const {currentData,cluster,RdbsParametersCluster}=this.props;
      RdbsParametersCluster(cluster,'cacheParameterGroups',currentData.cacheParameterGroupId)
    }
    const {scope} = this.props;
    scope.setState({ activeKey });
  }
  render() {
    const {currentData,scope,cluster,databaseList,activeKey} = this.props;
    return (
      <div id='AppServiceDetail' className="dbServiceDetail">
        <div className='topBox'>
          <Icon className='closeBtn' type='cross' onClick={() => { scope.setState({ detailModal: false,activeKey:'#BaseInfo'  })}}/>
          <div className='imgBox'>
            {currentData.cacheType =='memcached1.4.13'?<img src={memcachedImg} />:<img src={redisImg} />}
          </div>
          <div className='infoBox'>
            <p className='instanceName'>
                {currentData.cacheParameterGroupName}
            </p>
            <div className='leftBox TenxStatus'>
              <div className="desc">ID / {currentData.cacheParameterGroupId}</div>
            </div>
            <div className='rightBox'>
              <div className='li'>
                {this.state.deleteBtn?
                  <Button size='large' className='btn-danger' type='ghost' loading={true}>
                    删除配置组
                  </Button>:
                  <Button size='large' className='btn-danger' type='ghost' onClick={()=> this.setState({delModal: true}) }>
                      <Icon type='delete' />删除配置组
                  </Button>
                }
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <Modal title="删除配置组" visible={this.state.delModal}
          onOk={()=> this.deleteRedis()} onCancel={()=> this.setState({delModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除配置组 { currentData.cacheParameterGroupId }?</div>
        </Modal>
        <Form horizontal >
        <div className='bottomBox'>
          <div className='siderBox'>
            <Tabs
              tabPosition='left' onChange={this.changeTab.bind(this)}  activeKey={activeKey}
              >
              <TabPane tab='基础信息' key='#BaseInfo'>
                <BaseInfo currentData={currentData}/>
              </TabPane>
              <TabPane tab="缓存配置项" key='#config'>
                  <RedisCofigList form={this.props.form} currentData={currentData} scope={this}   />
              </TabPane>
            </Tabs>
          </div>
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
  }
  const { databaseAllConfigList } = state.databaseCache
  const { paramtersList }=databaseAllConfigList.cacheParameterGroups || defaultMysqlList
  return {
    cluster: cluster.clusterID,
    domainSuffix: cluster.bindingDomains,
    bindingIPs: cluster.bindingIPs,
    paramtersList,
    resourcePrice: cluster.resourcePrice //storage
  }
}

ConfigModalDetail.PropTypes = {
  intl: PropTypes.object.isRequired,
  deleteDatabaseConfigRedis: PropTypes.func.isRequired,
  RdbsParametersCluster: PropTypes.func.isRequired,
  RdbsModifyParametersCluster: PropTypes.func.isRequired
}

ConfigModalDetail = createForm()(ConfigModalDetail)

export default connect(mapStateToProps, {
  deleteDatabaseConfigRedis,
  RdbsParametersCluster,
  putDbClusterDetail,
  RdbsModifyParametersCluster
})(ConfigModalDetail)
