/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  CreateDatabase module
 *
 * v2.0 - 2016-10-18
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Input, Select, InputNumber, Button, Form, Icon ,message, Radio,Steps} from 'antd'
import { CreateDbCluster ,loadDbCacheList} from '../../actions/database_cache'
import { setCurrent } from '../../actions/entities'
import { loadTeamClustersList } from '../../actions/team'
import NotificationHandler from '../../common/notification_handler'
import { MY_SPACE } from '../../constants'
import { parseAmount } from '../../common/tools.js'
import './style/CreateDatabase.less'
import { camelize } from 'humps'
const RadioGroup = Radio.Group

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
const Step = Steps.Step;
const steps = [{title:'资源设置'},{title:'网络设置'},{title:'账号设置'}]
// const up = array.map((item, i) => ({
//
//   title: `步骤${i - 1}`,
// }));
let CreateDatabase = React.createClass({
  getInitialState: function () {
    return {
      currentType: this.props.database,
      current: Math.floor(Math.random() * steps.length),
      showPwd: 'text',
      firstFocues: true,
      onselectCluster: true,
       value: 1,
    }
  },
  next() {
   let current = this.state.current + 1;
   if (current === steps.length) {
     current = 0;
   }
   this.setState({ current });
 },
 up() {
  let current = this.state.current - 1;
  if (current === steps.length) {
    current = 0;
  }
  this.setState({ current });
},
  componentWillReceiveProps(nextProps) {
    // if create box close return default select cluster
    if(!nextProps.scope.state.CreateDatabaseModalShow) {
      this.setState({onselectCluster: true, loading: false})
    }
    this.setState({
      currentType: nextProps.database,
    })
  },
  onChangeCluster() {
    this.setState({onselectCluster: false})
  },
  selectDatabaseType(database) {
    //this funciton for user select different database
    this.setState({
      currentType: database
    });
    document.getElementById('dbName').focus()
  },
  onChangeNamespace(spaceName) {
    //this function for user change the namespace
    //when the namespace is changed, the function would be get all clusters of new namespace
    const { teamspaces, loadTeamClustersList, setCurrent, form, current } = this.props
    let newTeamspaces = ([MY_SPACE]).concat(teamspaces)
    newTeamspaces.map(space => {
       if (space.namespace == spaceName) {
        // setCurrent({
        //   space,
        //   team: {
        //     teamID: teamID
        //   }
        // })
        loadTeamClustersList(space.teamID, { size: 100 }, {
          success: {
            func: (result) => {
              if(result.data.length > 0) {
                form.setFieldsValue({
                  'clusterSelect': result.data[0].clusterID
                })
              } else {
                form.setFieldsValue({'clusterSelect':''})
              }
            },
            isAsync: true
          }
        })
       }
    })
    // this.props.loadTeamClustersList(teamId, { size: 100 })
  },
  databaseExists(rule, value, callback) {
    //this function for check the new database name is exist or not
    const { databaseNames } = this.props;
    let existFlag = false;
    if (!Boolean(value)) {
      callback();
      return
    } else {
      databaseNames.map((item) => {
        if (value == item) {
          callback([new Error('抱歉，该数据库名称已被占用。')]);
          existFlag = true;
        }
      });

      if (value.length < 3) {
        callback([new Error('数据库名称长度不能少于3位')]);
        existFlag = true;
      }
      if (value.length > 12) {
        callback('数据库名称长度不高于12位');
        existFlag = true;
      }
      let repetition = /([-])\1/;
      let checkName = /^[a-z]([-a-z0-9]*[a-z0-9])$/;
      if(!repetition.test(value)){
        if (!checkName.test(value)) {
          callback([new Error('名称仅由小写字母、数字和横线组成，且以小写字母开头')]);
          existFlag = true;
        }
      }else{
        callback([new Error('不允许输入连续字符[-]')]);
        existFlag = true;
      }
      if (!existFlag) {
        callback();
      }
    }
  },
  checkPwd: function () {
    //this function for user change the password box input type
    //when the type is password and change to the text, user could see the password
    //when the type is text and change to the password, user couldn't see the password
    if (this.state.showPwd == 'password') {
      this.setState({
        showPwd: 'text'
      });
    } else {
      this.setState({
        showPwd: 'password'
      });
    }
  },
  setPsswordType() {
    if (this.state.firstFocues) {
      this.setState({
        showPwd: 'password',
        firstFocues: false
      });

    }
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    scope.setState({
      CreateDatabaseModalShow: false
    });
  },
  handleSubmit(e) {
    //this function for user submit the form
    e.preventDefault();
    const _this = this;
    const { scope,  CreateDbCluster, setCurrent} = this.props;
    const { teamspaces, teamCluster} = this.props;
    const { loadDbCacheList } = scope.props;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      _this.setState({loading: true})
      let templateId
      this.props.dbservice.map(item => {
        if (item.category === _this.state.currentType) {
          return templateId = item.id
        }
      })
      if (this.state.onselectCluster) {
        values.clusterSelect = this.props.cluster
      }
      let notification = new NotificationHandler()
      if (values.replicas > 5) {
        notification.error('副本数不能大于5')
        return
      }
      let newTeamspaces = ([MY_SPACE]).concat(teamspaces)
      let newSpace, newCluster
      newTeamspaces.map(list => {
        if (list.namespace === values.namespaceSelect) {
          return newSpace = list
        }
      })
      teamCluster.map(list => {
        if (list.clusterID === values.clusterSelect) {
          return newCluster = list
        }
      })
      let externalIP = ''
      if (newCluster.publicIPs && newCluster.publicIPs != "") {
        let ips = eval(newCluster.publicIPs)
        if (ips && ips.length > 0) {
          externalIP = ips[0]
        }
      }
      let lbGroupID = 'none'
      if(values.outerCluster){
        lbGroupID = values.outerCluster
      }
      const replicas = this.state.currentType == 'zookeeper' ? values.zkReplicas : values.replicas
      const body = {
        cluster: values.clusterSelect,
        externalIP: externalIP,
        serviceName: values.name,
        password: values.password,
        replicas: replicas,
        volumeSize: values.storageSelect,
        teamspace: newSpace.namespace,
        templateId,
        lbGroupID,
      }
      CreateDbCluster(body, {
        success: {
          func: ()=> {
            notification.success('创建成功')
            loadDbCacheList(body.cluster, _this.state.currentType)
            setCurrent({
              cluster: newCluster,
              space: newSpace
            })
            _this.props.form.resetFields();
            scope.setState({
              CreateDatabaseModalShow: false
            });
          },
          isAsync: true
        },
        failed: {
          func: (res)=> {
            if (res.statusCode == 409) {
              notification.error('数据库服务 ' + values.name + ' 同已有资源冲突，请修改名称后重试')
            } else {
              notification.error('创建数据库服务失败')
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
  },
  renderSelectOption(){
    const { clusterProxy, cluster } = this.props
    const clusterId = camelize(cluster)
    if(!clusterProxy || !clusterProxy[clusterId] || !clusterProxy[clusterId].data || !clusterProxy[clusterId].data.length){
      return <Option value="none" key="none" disabled>暂无可用网络出口</Option>
    }
    return clusterProxy[clusterId].data.map((item, index) => {
      let name = '公网'
      if(item.type == 'private'){
        name = '内网'
      }
      return <Option value={item.id} key={item.address + index}>{name}: {item.name}</Option>
    })
  },
  render() {
    const { current } = this.state;
    const { isFetching, teamspaces, teamCluster, space } = this.props;
    const teamspaceList = teamspaces.map((list, index) => {
      return (
        <Option key={list.namespace}>{list.spaceName}</Option>
      )
    })
    const clusterList = teamCluster.map(item => {
      return (
        <Option key={item.clusterID}>{item.clusterName}</Option>
      )
    })
    const { getFieldProps, getFieldError, isFieldValidating ,getFieldValue} = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, whitespace: true ,message:'请输入名称'},
        { validator: this.databaseExists },
      ],
    });
    const accessTypeProps = getFieldProps('accessType',{
      initialValue: 'outcluster',
      rules: [{
        required: true,
        message: '请选择集群访问方式'
      }]
    })

    const accessTypePropsout = getFieldProps('accessTypeout',{
      initialValue: 'out',
      rules: [{
        required: true,
        message: 'dsd'
      }]
    })

    let accessTypeout = getFieldValue('accessTypeout')
    let accessType = getFieldValue('accessType')
    let outClusterProps
    if(accessType == 'outcluster'){
      outClusterProps = getFieldProps('outerCluster',{
        rules: [
          { required: true, message: '请选择网络出口' },
        ],
      })
    }
    const replicasProps = getFieldProps('replicas', {
      initialValue: 3
    });
    const zkReplicasProps = getFieldProps('zkReplicas', {
      initialValue: 3
    });
    const selectStorageProps = getFieldProps('storageSelect', {
      initialValue: 512
    });
    const passwdProps = getFieldProps('password', {
      rules: [
        {
          required: this.state.currentType !== 'elasticsearch',
          whitespace: true,
          message: '请填写密码'
        },
      ],
    });
    const selectNamespaceProps = getFieldProps('namespaceSelect', {
      rules: [
        { required: true, message: '请选择空间' },
      ],
      initialValue: space.namespace,
      onChange: this.onChangeNamespace
    });
    const selectClusterProps = getFieldProps('clusterSelect', {
      rules: [
        { required: true, message: '请选择集群' },
      ],
      initialValue: this.props.clusterName,
      onChange: this.onChangeCluster
    });
    const storageNumber = getFieldValue('replicas');
    const strongSize = getFieldValue('storageSelect');
    const hourPrice = parseAmount((strongSize /1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio , 4)
    const countPrice = parseAmount((strongSize /1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio * 24 * 30, 4)
    const statefulApps = {
      mysql: 'MySQL',
      redis: 'Redis',
      zookeeper: 'ZooKeeper',
      elasticsearch: 'ElasticSearch',
    }
    const statefulAppOptions = Object.getOwnPropertyNames(statefulApps).map(
      app => <Select.Option value={app} key={app}>{statefulApps[app]}</Select.Option>)
    const statefulAppMenus = (
      <Select defaultValue='mysql' value={this.state.currentType} onChange={this.selectDatabaseType}>
        {statefulAppOptions}
      </Select>
    )

    return (
      // const { current } = this.state
      <div id='CreateDatabase' type='right'>
        <div>

          <Steps current={current}>
            {steps.map((s, i) => <Step key={i} title={s.title} description={s.description} />)}
          </Steps>
          <div style={{ marginTop: 1 }}>

          </div>
        </div>
        {
          current === 0 && (
          <Form horizontal>
          <div className="modal-price">
                <div className="price-left">
                  <div className="keys">实例：{parseAmount(this.props.resourcePrice['2x'] * this.props.resourcePrice.dbRatio, 4).fullAmount}/（个*小时）* { storageNumber } 个</div>
                  <div className="keys">存储：{ parseAmount(this.props.resourcePrice.storage * this.props.resourcePrice.dbRatio, 4).fullAmount}/（GB*小时）* {storageNumber} 个</div>
                </div>
                <div className="price-unit">
                  <p>合计：<span className="unit">{countPrice.unit=='￥' ? ' ￥' : ''}</span><span className="unit blod">{ hourPrice.amount }{countPrice.unit=='￥'? '' : ' T'}/小时</span></p>
                  <p className="unit">（约：{ countPrice.fullAmount }/月）</p>
                </div>
              </div>
            <div className='infoBox'>
              <div className='commonBox'>
                <div className='title'>
                  <span>版本</span>
                </div>
                <div className='inputBox'>
                  {statefulAppMenus}
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
            <div className='commonBox'>
                <div className='title'>
                  <span>类型</span>
                </div>
                <div className='inputBox'>
                  <RadioGroup >
                    <Radio key="a" value="out">性能型</Radio>
                    <Radio key="b" value="none">超高性能型</Radio>
                </RadioGroup>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div className='commonBox'>
                <div className='title'>
                  <span>类型</span>
                </div>
                <div className='radioBox'>
                
                  <Radio.Group >
                    <Radio name='rdb_type' key="1" value="12">1核2G</Radio>
                    <Radio name='rdb_type' key="2" value="24">2核4G</Radio>
                    <Radio name='rdb_type' key="3" value="48">4核8G</Radio>
                    <Radio name='rdb_type' key="4" value="816">8核16G</Radio>
                    <Radio name='rdb_type' key="5" value="832">8核32G</Radio>
                </Radio.Group>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div className='commonBox'>
                <div className='title'>
                  <span>自动备份</span>
                </div>
                <div className='inputBox'>
                  <FormItem style={{ width: '150px', float: 'left', marginRight: '20px' }}>
                    <Select {...selectNamespaceProps} className='envSelect' size='large'>
                      <Option value="default">关闭</Option>
                      { teamspaceList }
                    </Select>
                  </FormItem>
                  <p><i>*</i>自动备份将单独收费。</p>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div className='commonBox'>
                <div className='title'>
                  <span>存储大小</span>
                </div>
                <div className='inputBox'>
                  <FormItem  style={{ width: '80px', float: 'left' }}>
                    <InputNumber {...selectStorageProps}  defaultValue={512} min={512} step={512} max={20480} size='large' disabled={isFetching}/>
                  </FormItem>
                  <span className='litteColor' style={{ float: 'left', paddingLeft: '15px' }}>GB</span>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              
            </div>
            <div className='btnBox'>
            <Button type='primary' onClick={this.next}>下一步</Button>
        </div>
          </Form>
          )
        }
        {current === 1 &&
          <Form horizontal>
            <div className="modal-price">
                <div className="price-left">
                  <div className="keys">实例：{parseAmount(this.props.resourcePrice['2x'] * this.props.resourcePrice.dbRatio, 4).fullAmount}/（个*小时）* { storageNumber } 个</div>
                  <div className="keys">存储：{ parseAmount(this.props.resourcePrice.storage * this.props.resourcePrice.dbRatio, 4).fullAmount}/（GB*小时）* {storageNumber} 个</div>
                </div>
                <div className="price-unit">
                  <p>合计：<span className="unit">{countPrice.unit=='￥' ? ' ￥' : ''}</span><span className="unit blod">{ hourPrice.amount }{countPrice.unit=='￥'? '' : ' T'}/小时</span></p>
                  <p className="unit">（约：{ countPrice.fullAmount }/月）</p>
                </div>
              </div>
              <div className='infoBox'>
                <div className='commonBox accesstype'>
                  <div className='title'>
                    <span>集群访问方式</span>
                  </div>
                  <div className='radioBox'>
                    <FormItem>
                      <Radio.Group {...accessTypeProps}>

                        <Radio value="none" key="1">仅在集群内访问</Radio>
                          <Radio value="outcluster" key="2">可集群外访问</Radio>
                      </Radio.Group>
                    </FormItem>
                    {
                      accessType === 'outcluster'
                      ? <div className='accessTips'>选择后该数据库与缓存集群仅提供集群内访问</div>
                      : <div className='accessTips'>数据库与缓存集群可提供集群外访问</div>
                    }
                  </div>
                  <div style={{ clear: 'both' }}></div>
                </div>
                {
                  accessType === 'outcluster'
                  ?
                  <div>
                    <div className='commonBox outclusterBox'>
                      <div className='title'></div>
                      <div className='inputBox'>
                        <FormItem>
                          <Select
                            {...outClusterProps}
                            placeholder='基础网络 ID，如，vxnet-xxxxxxxx。'
                          >
                            { this.renderSelectOption() }
                          </Select>

                        </FormItem>
                      </div>


                      <div style={{ clear: 'both' }}></div>

                    </div>
                    <div className='commonBox outclusterBox'>
                      <div className='title'>
                        <span>防火墙</span>
                      </div>
                      <Radio.Group {...accessTypePropsout}>

                        <Radio value="none" key="1">使用已有防火圈</Radio>
                          <Radio value="out" key="2" >自动创造适用该类型的防火墙</Radio>
                      </Radio.Group>
                      {
                        accessTypeout === 'out' &&
                        <Select defaultValue="sg-l2didy8o(缺省防火墙)" style={{ width: 300 }} >
                          <Option value="sg-l2didy8o">sg-l2didy8o(缺省防火墙)</Option>
                          <Option value="sg-02prbfdo" >sg-02prbfdo(k8s-FW)</Option>
                          <Option value="sg-vojvyutz" >sg-vojvyutz(default-FW)</Option>
                          <Option value="sg-73irxbuf" >sg-73irxbuf(paas-test)</Option>
                          <Option value="sg-lyg57khf" >sg-lyg57khf(paas-dev)</Option>
                          <Option value="sg-qy99sgkh" >sg-qy99sgkh(paas)</Option>
                          <Option value="sg-818n3w1d" >sg-818n3w1d(Redis_3_0_5_Cluster-15ujt7nr)</Option>
                        </Select>
                      }


                    </div>
                  </div>: null
                }
                <div className='commonBox accesstype'>
                  <div className='title'>
                    <span>IP</span>
                  </div>
                  <div className='radioBox'>
                    <FormItem>
                      <Radio.Group {...accessTypeProps}>

                        <Radio value="none" key="1">自动分配</Radio>
                          <Radio value="outcluster" key="2">手动指定</Radio>
                      </Radio.Group>
                    </FormItem>
                  </div>
                  <div style={{ clear: 'both' }}></div>
                </div>
              </div>
              <div className='btnBox'>
                <Button  onClick={this.up}>上一步</Button>
                <Button type='primary' onClick={this.next}>下一步</Button>
              </div>
          </Form>

}
 {current === 2 &&
<Form horizontal>
          <div className="modal-price">
                <div className="price-left">
                  <div className="keys">实例：{parseAmount(this.props.resourcePrice['2x'] * this.props.resourcePrice.dbRatio, 4).fullAmount}/（个*小时）* { storageNumber } 个</div>
                  <div className="keys">存储：{ parseAmount(this.props.resourcePrice.storage * this.props.resourcePrice.dbRatio, 4).fullAmount}/（GB*小时）* {storageNumber} 个</div>
                </div>
                <div className="price-unit">
                  <p>合计：<span className="unit">{countPrice.unit=='￥' ? ' ￥' : ''}</span><span className="unit blod">{ hourPrice.amount }{countPrice.unit=='￥'? '' : ' T'}/小时</span></p>
                  <p className="unit">（约：{ countPrice.fullAmount }/月）</p>
                </div>
              </div>
            <div className='infoBox'>
              <div className='commonBox'>
                <div className='title'>
                  <span>名称</span>
                </div>
                <div className='inputBox' style={{width:"200px"}}>
                  <FormItem
                    hasFeedback
                     help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                    >
                    <Input {...nameProps} size='large' id="dbName" placeholder="请输入名称" disabled={isFetching} maxLength={20} />
                  </FormItem>
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
               {this.state.currentType == 'elasticsearch' ? null :
            <div className='commonBox'>
              <div className='title'>
                <span>密码</span>
              </div>
              <div className='inputBox' style={{width:"200px"}}>
                <FormItem
                  hasFeedback
                  >
                  <Input {...passwdProps} onFocus={()=> this.setPsswordType()} type={this.state.showPwd} size='large' placeholder="请输入密码" disabled={isFetching} />
                  <i className={this.state.showPwd == 'password' ? 'fa fa-eye' : 'fa fa-eye-slash'} onClick={this.checkPwd}></i>
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>}
            <div className='common'>
              <i >密码至少8位，并包括大小写字母及数字。请妥善保管密码！</i>
            </div>
             {this.state.currentType == 'elasticsearch' ? null :
            <div className='commonBox'>
              <div className='title'>
                <span>用户名</span>
              </div>
              <div className='inputBox' style={{width:"200px"}}>
                <FormItem
                  hasFeedback
                  >
                  <Input {...passwdProps} onFocus={()=> this.setPsswordType()} type={this.state.showPwd} size='large' placeholder="请输入用户名" disabled={isFetching} />
                  
                  <i className={this.state.showPwd == 'password' ? 'fa fa-eye' : 'fa fa-eye-slash'} onClick={this.checkPwd}></i>
                </FormItem>
               
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>}
            <div className='common'>
              <i >用户名最少6位。 RDB 创建时同时生成 root 账号，密码与此用户相同</i>
            </div>
             
              
            </div>
             <div className='btnBox'>
             <Button type='primary' onClick={this.up}>上一步</Button>
            <Button size='large' onClick={this.handleReset}>
              取消
            </Button>
            {this.state.loading ?
            <Button size='large' type='primary' loading={this.state.loading}>
              确定
            </Button>
            :
            <Button size='large' type='primary' onClick={this.handleSubmit}>
              确定
            </Button>
            }
          </div>
          </Form>
         
}
      </div>
    )
  }
});

function mapStateToProps(state, props) {
  const { cluster, space } = state.entities.current
  const defaultDbNames = {
    isFetching: false,
    cluster: cluster.clusterID,
    databaseNames: []
  }
  const { databaseAllNames } = state.databaseCache
  const { databaseNames, isFetching } = databaseAllNames.DbClusters || defaultDbNames
  const { teamspaces } = state.user.teamspaces.result || []
  const teamCluster = state.team.teamClusters.result.data || []
  const { current } = state.entities
  return {
    cluster: cluster.clusterID,
    clusterName: cluster.clusterName,
    space,
    current,
    databaseNames,
    isFetching,
    teamspaces,
    teamCluster,
    resourcePrice: cluster.resourcePrice //storage
  }

}

CreateDatabase = createForm()(CreateDatabase);

CreateDatabase.propTypes = {
  intl: PropTypes.object.isRequired,
  CreateDbCluster: PropTypes.func.isRequired,
  loadTeamClustersList: PropTypes.func.isRequired,
  setCurrent: PropTypes.func.isRequired
}

CreateDatabase = injectIntl(CreateDatabase, {
  withRef: true,
})

export default connect(mapStateToProps, {
  CreateDbCluster,
  loadTeamClustersList,
  setCurrent
})(CreateDatabase)
