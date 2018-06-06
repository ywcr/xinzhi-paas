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
import { Input, Select,Slider, InputNumber, Button, Form, Icon ,message, Radio } from 'antd'
import { CreateDbRedisCluster,getSingleList } from '../../../actions/database_cache'
import { USERNAME_REG_EXP_NEW,PASSWORD_MONGODB} from '../../../constants'
import { setCurrent } from '../../../actions/entities'
import { loadTeamClustersList } from '../../../actions/team'
import NotificationHandler from '../../../common/notification_handler'
import { MY_SPACE } from '../../../constants/index'
import { parseAmount } from '../../../common/tools.js'
import '../style/CreateDatabase.less'
import { camelize } from 'humps'

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
let CreateDatabase = React.createClass({
  getInitialState: function () {
    return {
      currentType: this.props.database,

      showPwd: 'text',
      firstFocues: true,
      onselectCluster: true
    }
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

  //用户名验证
  checkUserName(rule, value, callback) {
      if (!value) {
          callback([new Error('请填写用户名')])
          return
      }
      if (value.length < 6 || value.length > 16) {
          callback([new Error('长度为6~16个字符')])
          return
      }
      if (!USERNAME_REG_EXP_NEW.test(value)) {

          callback([new Error('以[a~z]开头，允许[0~9]，长度大于5，且以小写英文和数字结尾')])
          return
      }
      callback()
  },

  checkDescription(rule,value,callback){
      if (value&&( value.length >200)) {
          callback([new Error('长度不超过200个字符之间')])
          return
      }
      callback()
  },
  checkPwd (rule, value,callback) {

      if(!PASSWORD_MONGODB.test(value)){
          callback([new Error('密码长度为8-12位,并且至少包括一个大写字母,一个小写字母以及一个数字')])
          return
      }
      callback()
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
    const { scope,  CreateDbRedisCluster, setCurrent} = this.props;
    const { teamspaces,getSingleList,teamCluster} = this.props;
    const {loadDbCacheRedisList } = scope.props;
    const {rollpolling}=scope;


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


      let body = {
        cluster: values.clusterSelect,
        auto_backup_time:Number(values.auto_backup_time),
        mongo_name: values.name,
        mongo_password: values.password,
        mongo_type:values.mongo_type,
        mongo_username:values.userName,
        mongo_version:'3.0',
        resource_class:values.resource_class,
        storage_size: values.storageSelect
      }
      if(values.description!=''){
          body.description=values.description
      }

     CreateDbRedisCluster(body,'mongos',{
        success: {
          func: (res)=> {
            notification.success('创建成功')
              loadDbCacheRedisList(body.cluster,'mongos','mongos')
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
  render() {
    const { isFetching, teamspaces, teamCluster, space } = this.props;
    const {getFieldProps, getFieldError, isFieldValidating ,getFieldValue} = this.props.form;
    const {} = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, whitespace: true ,message:'请输入名称'},
        { validator: this.databaseExists },
      ],
    });

    const replicasProps = getFieldProps('replicas', {// Set the value of node group
        initialValue: 3
    });
    const descriptionProps=getFieldProps('description',{
        rules: [
            { validator: this.checkDescription },
        ],
    })

    //用户名规则
    const userNameProps = getFieldProps('userName', {
        rules: [
            { required: true, whitespace: true ,message:'请输入用户名'},
            { validator: this.checkUserName },
        ],
    })

    const passwdProps = getFieldProps('password', {
          rules: [
              { whitespace: true, message: '请填写密码'},
              { validator: this.checkPwd},

          ]
    });
    const accessTypePropaa = getFieldProps('resource_class',{ // Verifying Type
      initialValue: 0
    })
    const accessTyperdb_base_type = getFieldProps('mongo_type',{ // Verifying Type
      initialValue: 1
    })

    let accessType = getFieldValue('accessType')
    let outClusterProps
    if(accessType == 'outcluster'){
      outClusterProps = getFieldProps('outerCluster',{
        rules: [
          { required: true, message: '请选择网络出口' },
        ],
      })
    }

    const selectStorageProps = getFieldProps('storageSelect', {
      initialValue: 10
    });


    const storageNumber = getFieldValue('replicas');
    const strongSize = getFieldValue('storageSelect');
    const hourPrice = parseAmount((strongSize /1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio , 4)
    const countPrice = parseAmount((strongSize /1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio * 24 * 30, 4)

    const statefulApps = {
       MongoDB: 'MongoDB-3.0',
    }
    const statefulAppOptions = Object.getOwnPropertyNames(statefulApps).map(
      app => <Select.Option value={app} key={app}>{statefulApps[app]}</Select.Option>)
    const statefulAppMenus = (
      <Select defaultValue='MongoDB-3.0' value={this.state.currentType} onChange={this.selectDatabaseType}>
        {statefulAppOptions}
      </Select>
    )

      const auto_backup_time = getFieldProps('auto_backup_time', {
          rules: [
              { required: true, message: '' },
          ],
          initialValue: "-1"
      });
      //自动备份时间展示
      var AutomaticArray = {}
      const Automatic = function(){
          for (let i = 0; i < 24; i++) {
              AutomaticArray[i] = i+':00-'+(i+1)+':00'
          }
      }
      Automatic()
      const AutomaticOptions = Object.getOwnPropertyNames(AutomaticArray).map(
          app => <Select.Option value={app} key={app}>{AutomaticArray[app]}</Select.Option>)
      const AutomaticAppMenus = (
          <Select {...auto_backup_time}>
            <Select.Option value='-1' key='-1'>关闭</Select.Option>
              {AutomaticOptions}
          </Select>
      )
    return (
      <div id='CreateDatabase' type='right'>
        <Form horizontal >
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
                <span>名称</span>
              </div>
              <div className='inputBox'>
                <FormItem
                  hasFeedback
                   help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                  >
                  <Input {...nameProps} size='large' id="dbName" placeholder="请输入名称" disabled={isFetching} maxLength={20} />
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                 <span>类型</span>
              </div>
              <div className='radioBox'>
                <FormItem>
                  <Radio.Group {...accessTypePropaa}>
                   <Radio value={0}>性能型</Radio>
                    <Radio value={1}>超高性能型</Radio>
                  </Radio.Group>
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
          <div className='commonBox'>
              <div className='title'>
                 <span>配置</span>
              </div>
              <div className='radioBox'>
                <FormItem>
                  <Radio.Group {...accessTyperdb_base_type}>
                   <Radio value={1}>1核2G</Radio>
                    <Radio value={2}>2核4G</Radio>
                     <Radio value={3}>4核8G</Radio>
                     <Radio value={4}>8核16G</Radio>
                    <Radio value={5}>8核32G</Radio>
                  </Radio.Group>
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>存储大小</span>
              </div>
              <div className='inputBox'>
                <FormItem  style={{marginTop:'10px', width: '80%', float: 'left' }}>
                  <Slider {...selectStorageProps}  defaultValue={10} min={10} step={10} max={1000} size='large' disabled={isFetching}/>
                </FormItem>

                <span className='litteColor' style={{ float: 'left',  }}>{strongSize} GB</span>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className="commonBox">
              <div className="title"><span>自动备份</span></div>
              <div className='inputBox'>
                  {AutomaticAppMenus}
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>用户名</span>
              </div>
              <div className='inputBox'>
                <FormItem
                    hasFeedback
                    help={isFieldValidating('userName') ? '校验中...' : (getFieldError('userName') || []).join(', ')}
                >
                  <Input {...userNameProps} size='large' id="dbUserName" placeholder="请输入用户名" disabled={isFetching} maxLength={20} />
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>密码</span>
              </div>
              <div className='inputBox' style={{width:"200px"}} >
                <FormItem hasFeedback>
                  <Input type="password" placeholder="请输入密码" {...passwdProps}/>
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className="commonBox" style={{ marginTop: '12px' }}>
              <div className="title"><span>描述信息</span></div>
              <div className="inputBox">
                <FormItem className="description" style={{'height':'60px'}}>
                  <Input  {...descriptionProps} type="textarea" size="large" placeholder="请输入描述信息" disabled={isFetching} autosize={{ minRows: 2, maxRows: 2 }}/>
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
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
          </div>
          <div className='btnBox'>
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
  CreateDbRedisCluster: PropTypes.func.isRequired,
  loadTeamClustersList: PropTypes.func.isRequired,
  setCurrent: PropTypes.func.isRequired
}

CreateDatabase = injectIntl(CreateDatabase, {
  withRef: true,
})

export default connect(mapStateToProps, {
  CreateDbRedisCluster,
  loadTeamClustersList,
  setCurrent,
  getSingleList
})(CreateDatabase)
