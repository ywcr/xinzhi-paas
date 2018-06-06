/**
 *  CreateDatabase module
 *
 * v3.0 - 2017-08-01
 * @author YaoWei
 */

import React, { Component, PropTypes } from 'react' // 加载react
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux' // 加载react-redux
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl' // 实现多语音支持
import { Steps, Input, Select, InputNumber, Button, Form, Icon ,message, Radio,Table,Slider,Row,Col } from 'antd' // antd 按需加载
import { CreateDbRedisCluster ,loadDbCacheRedisList } from '../../../actions/database_cache'
import { setCurrent } from '../../../actions/entities'
import { loadTeamClustersList } from '../../../actions/team'
import NotificationHandler from '../../../common/notification_handler'
import { MY_SPACE } from '../../../constants'
import { parseAmount } from '../../../common/tools.js'
import '../style/CreateDatabase.less'
import { camelize } from 'humps'

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
const Step = Steps.Step;

let CreateDatabase = React.createClass({
  getInitialState: function () {
    return {
      showPwd: 'text',
      firstFocues: true,
      onselectCluster: true,
      inputValue: 1,
      current: 0,
      propsNum:1
    }
  },
  componentWillReceiveProps(nextProps) {
    // if create box close return default select cluster
    if(!nextProps.scope.state.CreateDatabaseModalShow) {
      this.setState({onselectCluster: true, loading: false})
    }
  },
  onChangeCluster() {
    this.setState({onselectCluster: false})
  },
  selectDatabaseType(database) {//切换版本
    //this funciton for user select different database
    this.props.form.resetFields(['clusterConfig']);
    document.getElementById('dbName').focus()
  },
  onChangeNamespace(spaceName) {
    //this function for user change the namespace
    //when the namespace is changed, the function would be get all clusters of new namespace
    const { teamspaces, loadTeamClustersList, setCurrent, form, current } = this.props
    let newTeamspaces = ([MY_SPACE]).concat(teamspaces)
    newTeamspaces.map(space => {
       if (space.namespace == spaceName) {
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
  databaseStorage(rule, value, callback){
    let existFlag = false;
    if (!Boolean(value)) {
      callback();
      return
    } else {
      if (value.length == '') {
        callback([new Error('请输入缓存大小')]);
        existFlag = true;
      }
      if (!existFlag) {
        callback();
      }
    }
  },
  databaseExists(rule, value, callback) {
    //this function for check the new database name is exist or not 名称
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
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    scope.setState({
      CreateDatabaseModalShow: false
    });
  },

  handleSubmit(e) {// 提交表单
    //this function for user submit the form
    e.preventDefault();
    const _this = this;
    // 接收 父模块传输的值
    const { scope,  CreateDbRedisCluster, setCurrent, cluster} = this.props;
    const { teamspaces, teamCluster} = this.props;
    const { loadDbCacheRedisList } = scope.props;
    this.props.form.validateFields((errors, values) => { // 表单验证
      if (!!errors) {
        return;
      }
      _this.setState({loading: true})
      let notification = new NotificationHandler()
      let newTeamspaces = ([MY_SPACE]).concat(teamspaces)
      let newSpace, newCluster
      const body = {
        "cluster":cluster,
      	"cache_class":values.currentType, //cache_class 性能型和高性能型缓存服务，性能型：0，高性能型：1
      	"cache_name":values.name, //缓存服务名称
      	"cache_parameter_group":values.clusterConfig, //缓存服务配置组ID，如果不指定则为默认配置组。
      	"cache_size":this.state.inputValue,  //required
      	"cache_type":values.clusterVersions,  //缓存服务类型，目前支持 Redis 2.8.17 和 Memcached 1.4.13.
      }
      if(values.clusterVersions != 'memcached1.4.13'){
        body.auto_backup_time = Number(values.clusterTime) //自动备份时间(UTC 的 Hour 部分)，有效值0-23，任何大于23的整型值均表示关闭自动备份，默认值 99
      }
      if(values.clusterVersions == 'redis3.0.5(集群)'){
        body.master_count = values.replicas; //节点组数量不能少于3个
        body.replicate_count = values.zkReplicas;
        body.cache_type = 'redis3.0.5'
      }
      CreateDbRedisCluster(body,'caches', {
        success: {
          func: ()=> {
            notification.success('创建成功')
            loadDbCacheRedisList(cluster, 'redis','caches')
            _this.props.form.resetFields();
            scope.setState({
              CreateDatabaseModalShow: false,
            });
            _this.setState({
              inputValue:1,
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
            _this.setState({
              inputValue:1,
            });
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
  onChange(e){
    this.setState({
      currentType: e.target.value,
    });
  },
  onChangeCache(value) {
    this.setState({
      inputValue: value,
    });
  },
  render() {
    const { isFetching, teamspaces, teamCluster, space } = this.props;
    const { current } = this.state;
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
    const { getFieldProps, getFieldError, isFieldValidating ,getFieldValue,setFieldsValue} = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, whitespace: true ,message:'请输入名称'},
        { validator: this.databaseExists },// Verifying Names
      ],
    });
    const currentTypeProps = getFieldProps('currentType',{ // Verifying Type
      initialValue: 0
    })
    let currentType = getFieldValue('currentType')
    const replicasProps = getFieldProps('replicas', {// Set the value of node group
      initialValue: 3
    });
    const zkReplicasProps = getFieldProps('zkReplicas', {// Set from the node values
      initialValue: 1
    });
    const selectStorageProps = getFieldProps('storageSelect', {// Set the cache size
      initialValue: 1,
    });

    const selectClusterProps = getFieldProps('clusterSelect', {
      rules: [
        { required: true, message: '请选择集群' },
      ],
      initialValue: this.props.clusterName,
      onChange: this.onChangeCluster
    });
    const selectClusterTime = getFieldProps('clusterTime', {
      rules: [
        { required: true, message: '' },
      ],
      initialValue: "-1"
    });
    const selectClusterVersions = getFieldProps('clusterVersions', {
      rules: [
        { required: true, message: '请选择版本' },
      ],
      initialValue: "redis3.0.5(集群)",
      onChange: this.selectDatabaseType
    });
    let currentVersion = getFieldValue('clusterVersions')
    const storageNumber = getFieldValue('replicas');
    const strongSize = getFieldValue('storageSelect');
    const hourPrice = parseAmount((strongSize /1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio , 4)
    const countPrice = parseAmount((strongSize /1024 * this.props.resourcePrice.storage * storageNumber + (storageNumber * this.props.resourcePrice['2x'])) * this.props.resourcePrice.dbRatio * 24 * 30, 4)
    const statefulApps = {
      'redis3.0.5(集群)': 'Redis 3.0.5  (集群)',
      'redis2.8.17': 'Redis 2.8.17',
      'redis3.0.5': 'Redis 3.0.5',
      'memcached1.4.13': 'Memcached 1.4.13',
    }
    const marks = {
      1: '1',
      2: '2',
      4: '4',
      6: '6',
      8: '8',
      12: '12',
      16: '16',
      20: '20',
      24: '24',
      28: '28',
      32: '32',
    };

    const selectClusterConfig = getFieldProps('clusterConfig', {
      rules: [
        { required: true, message: '请选择配置组' },
      ]
    });
    const stateConfig = []
    const setConfigArr = () => {
        this.props.databaseConfigList.forEach((element,index) => {
          currentVersion.indexOf(element.cacheType) !=-1? stateConfig.push(<Select.Option value={element.cacheParameterGroupId} key={element.cacheParameterGroupId}>{element.cacheParameterGroupId} ( {element.cacheParameterGroupName} ) </Select.Option>):''
        },this);
    }
    setConfigArr();
    const statefulAppConfigMenus = (
      <Select {...selectClusterConfig}  placeholder="请选择配置组">
        {stateConfig}
      </Select>
    )
    const statefulAppOptions = Object.getOwnPropertyNames(statefulApps).map(
      app => <Select.Option value={app} key={app}>{statefulApps[app]}</Select.Option>)
    const statefulAppMenus = (
      <Select {...selectClusterVersions} placeholder="请选择版本">
        {statefulAppOptions}
      </Select>
    )
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
      <Select {...selectClusterTime}>
        <Select.Option value='-1' key='-1'>关闭</Select.Option>
        {AutomaticOptions}
      </Select>
    )
    return (
      <div id='CreateDatabase' type='right'>
        <Form horizontal>
          <div className={'infoBox'}>
            <div className='commonBox'>
              <div className='title'>
                <span>版本</span>
              </div>
              <div className='inputBox'>
                <FormItem>
                  {statefulAppMenus}
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>类型</span>
              </div>
              <div className='radioBox createRedis'>
                <FormItem>
                  <Radio.Group {...currentTypeProps}>
                    <Radio value={0}>性能型</Radio>
                    <Radio value={1}>超高性能型</Radio>
                  </Radio.Group>
                </FormItem>
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
            {currentVersion == 'redis3.0.5(集群)' ?
            <div className='commonBox' style={{ height:'66px' }}>
              <div className='title'>
                <span>节点组数量</span>
              </div>
              <div style={{ position:'relative',overflow:'hidden',height:'62px' }}>
                <div className='inputBox replicas' style={{ width: '120px',position:'relative'}}>
                  <FormItem style={{ width: '80px', float: 'left' }}>
                     <InputNumber {...replicasProps} size='large' min={3} max={5} disabled={isFetching} />
                  </FormItem>
                  <span className='litteColor' style={{ float: 'left', paddingLeft: '15px' }}>个</span>
                </div>
                <div className='title'>
                  <span>每组从节点数量</span>
                </div>
                <div className='inputBox replicas' style={{ width: '120px'}}>
                  <FormItem style={{ width: '80px', float: 'left' }}>
                      <InputNumber {...zkReplicasProps} size='large' min={1} disabled={isFetching} />
                  </FormItem>
                  <span className='litteColor' style={{ float: 'left', paddingLeft: '15px' }}>个</span>
                </div>
                <div style={{ position:'absolute',left:'0',bottom:'-16px'}}>节点组数量不能少于3个，每个节点组包括1个主节点和N个从节点。</div>
              </div>


              <div style={{ clear: 'both' }}></div>
            </div>: null
            }
            <div className='commonBox' style={{ height:'66px' }}>
              <div className='title'>
                <span>缓存大小</span>
              </div>
              <div style={{ position:'relative',overflow:'hidden',height:'62px' }}>
                <div className='inputBox'>
                  <FormItem  style={{ width: '340px', float: 'left', paddingLeft:'5px' }}>
                    <Row>
                      <Col span={20} style={{'marginTop':'9px'}}>
                        <Slider min={1} max={32} marks={marks} onChange={this.onChangeCache} step={null} />
                      </Col>
                      <Col span={1}>
                      {this.state.inputValue}GB
                      </Col>
                    </Row>
                  </FormItem>
                </div>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>配置组</span>
              </div>
              <div className='inputBox'>
                <FormItem>
                 {statefulAppConfigMenus}
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            {currentVersion == 'memcached1.4.13' ? null :
            <div className='commonBox'>
              <div className='title'>
                <span>自动备份</span>
              </div>
              <div className='inputBox'>
                {AutomaticAppMenus}
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>}
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
          <div className={this.state.current == 0?'btnBox':'hidden'}>
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
  setCurrent
})(CreateDatabase)
