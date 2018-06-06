/**
 *  CreateDatabase module
 *
 * v3.0 - 2017-08-21
 * @author YaoWei
 */

import React, { Component, PropTypes } from 'react' // 加载react
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux' // 加载react-redux
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl' // 实现多语音支持
import { Steps, Input, Select, InputNumber, Button, Form, Icon ,message, Radio,Table,Slider,Row,Col } from 'antd' // antd 按需加载
import { CreateDbRedisCluster,loadDbCacheRedisConfigList} from '../../../actions/database_cache'
import NotificationHandler from '../../../common/notification_handler'
import '../style/CreateDatabase.less'

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
const Step = Steps.Step;

let CreateDatabase = React.createClass({
  getInitialState: function () {
    return {
      current: 0,
    }
  },
  componentWillReceiveProps(nextProps) {
    // if create box close return default select cluster
    if(!nextProps.scope.state.CreateConfigModalShow) {
      this.setState({loading: false})
    }
  },
  selectDatabaseType(database) {//切换版本
    //this funciton for user select different database
    this.props.form.resetFields(['clusterConfig']);
    document.getElementById('configName').focus()
  },
  databaseExists(rule, value, callback) {
    //this function for check the new database name is exist or not 名称
    const { databaseNames } = this.props;
    let existFlag = false;
    if (!Boolean(value)) {
      callback();
      return
    } else {
      if (value.length > 12||value.length<3) {
        callback('配置组名称长度不少于3位且不高于12位');
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
      CreateConfigModalShow: false
    });
  },
  
  handleSubmit(e) {// 提交表单
    //this function for user submit the form
    e.preventDefault();
    const _this = this;
    // 接收 父模块传输的值
    const { scope,  CreateDbRedisCluster, cluster} = this.props;
    const { loadDbCacheRedisConfigList } = scope.props;
    this.props.form.validateFields((errors, values) => { // 表单验证
      if (!!errors) {
        return;
      }
      _this.setState({loading: true})
      let notification = new NotificationHandler()
      const body = {
        "cluster":cluster,
      	"cache_parameter_group_name":values.createName, //缓存服务名称
      	"cache_type":values.clusterVersions,  //缓存服务类型，目前支持 Redis 2.8.17 和 Memcached 1.4.13.
      }
      CreateDbRedisCluster(body,'cacheParameterGroups', {
        success: {
          func: ()=> {
            notification.success('创建成功')
            loadDbCacheRedisConfigList(body.cluster,'redis')
            _this.props.form.resetFields();
            scope.setState({
                CreateConfigModalShow: false,
            });
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
      });

    });
  },
  onChange(e){
    this.setState({
      currentType: e.target.value,
    });
  },
  render() {
    const { isFetching, teamspaces, teamCluster, space } = this.props;
    const { current } = this.state;
    
    const { getFieldProps, getFieldError, isFieldValidating ,getFieldValue,setFieldsValue} = this.props.form;
    const createNameProps = getFieldProps('createName', {
      rules: [
        { required: true, whitespace: true ,message:'请输入名称'},
        { validator: this.databaseExists },// Verifying Names
      ],
    });
    const selectClusterVersions = getFieldProps('clusterVersions', {
      rules: [
        { required: true, message: '请选择版本' },
      ],
      initialValue: "redis3.0.5",
      onChange: this.selectDatabaseType
    });
    const statefulApps = {
      'redis3.0.5': 'Redis 3.0.5',
      'redis2.8.17': 'Redis 2.8.17',
      'memcached1.4.13': 'Memcached 1.4.13',
    }
    const statefulAppOptions = Object.getOwnPropertyNames(statefulApps).map(
      app => <Select.Option value={app} key={app}>{statefulApps[app]}</Select.Option>)
    const statefulAppMenus = (
      <Select {...selectClusterVersions} placeholder="请选择版本">
        {statefulAppOptions}
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
                <span>名称</span>
              </div>
              <div className='inputBox'>
                <FormItem hasFeedback help={isFieldValidating('createName') ? '校验中...' : (getFieldError('createName') || []).join(', ')}>
                  <Input {...createNameProps} size='large' id="configName" placeholder="请输入名称" />
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
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
  const teamCluster = state.team.teamClusters.result.data || []
  const { current } = state.entities
  return {
    cluster: cluster.clusterID,
    clusterName: cluster.clusterName,
    space,
    current,
    databaseNames,
    isFetching,
    teamCluster,
    resourcePrice: cluster.resourcePrice //storage
  }
}

CreateDatabase = createForm()(CreateDatabase);

CreateDatabase.propTypes = {
  intl: PropTypes.object.isRequired,
  CreateDbRedisCluster: PropTypes.func.isRequired,
}

CreateDatabase = injectIntl(CreateDatabase, {
  withRef: true,
})

export default connect(mapStateToProps, {
  CreateDbRedisCluster,
})(CreateDatabase)
