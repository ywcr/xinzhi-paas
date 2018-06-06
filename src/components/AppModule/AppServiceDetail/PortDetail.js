/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PortDetail component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card, Spin, Dropdown, Icon, Menu, Button, Select, Input, Form, Modal } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/PortDetail.less"
import { loadK8sService, clearK8sService, updateServicePort } from '../../../actions/services'
import { isDomain } from '../../../common/tools'
import NotificationHandler from '../../../common/notification_handler.js'
import findIndex from 'lodash/findIndex'
import cloneDeep from 'lodash/cloneDeep'
import { ANNOTATION_HTTPS, SERVICE_KUBE_NODE_PORT } from '../../../../constants'
import { camelize } from 'humps'

let uuid=0
let ob = {}
let defaultPort = []
let changeType = {}
let allPort = []
let allUsedPort = []

function validatePortNumber(proxyType, portNumber) {
  let minimumPort = 10000
  let maximumPort = 65535
  if (proxyType == SERVICE_KUBE_NODE_PORT) {
    // TODO: Make it configurealbe
    minimumPort = 30000
    maximumPort = 32766
  }
  if( portNumber < minimumPort || portNumber > maximumPort ) {
    return '端口范围' +  minimumPort + ' ~ ' + maximumPort
  } else {
    return
  }
}

let MyComponent = React.createClass({
  getInitialState() {
    const { currentCluster, loginUser } = this.props
    return {
      // kube-nodeport doesn't support HTTP for now
      disableHTTP: !isDomain(currentCluster.bindingDomains) || (loginUser.info.proxyType == SERVICE_KUBE_NODE_PORT)
    }
  },
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    
    const _this = this
    const { serviceName } = this.props
    this.props.loadK8sService(this.props.cluster, serviceName, {
      success: {
        func: (res) => {
          let openPort = []
          for(let i=0;i< res.data[camelize(serviceName)].spec.ports.length; i++) {
            allPort.push(res.data[camelize(serviceName)].spec.ports[i])
            openPort.push(false)
          }
          let cut = openPort.length
          const { form } = this.props
          const keys = []
          let index = 0
          while(cut-- ) {
            index++
            keys.push(index)
          }
          form.setFieldsValue({
            keys
          })
          _this.setState({
            openPort
          })
        }
      }
    })
  },
  componentWillUnmount() {
    this.props.clearK8sService()
    ob = {}
  },
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow } = nextProps
    if (!(this.props.isCurrentTab === false && nextProps.isCurrentTab === true)) {
      return
    }
    if (!serviceDetailmodalShow) {
      ob = {}
      this.props.form.setFieldsValue({
        newKeys: []
      })
      this.setState({
        openPort: [],
        inPort: '1'
      })
      ob = {}
      return this.props.clearK8sService()
    }
    const { cluster, serviceName } = nextProps
    const _this = this
    this.props.loadK8sService(cluster, serviceName, {
      success: {
        func: (res) => {
          let openPort = []
          for(let i=0;i< res.data[camelize(serviceName)].spec.ports.length; i++) {
            openPort.push(false)
          }
          let cut = openPort.length
          const { form } = this.props
          const keys = []
          let index = 0
          while(cut-- ) {
            index++
            keys.push(index)
          }
          form.setFieldsValue({
            keys,
            newKeys: []
          })
          _this.setState({
            openPort
          })
        }
      }
    })
  },
  handCancel(i) {
    // cancel action
    const openPort = {[i]: false}
    this.setState({openPort, selectType: 0})
  },
  checkPort(rule, value, callback, index){
    if(!value) return callback()
    const { form, loginUser } = this.props
    const { getFieldValue } = form
    if(index != undefined) {
      if(getFieldValue(`ssl{index}`) == 'HTTP') {
        return callback()
      }
    }
    if(!/^[0-9]+$/.test(value.trim())) {
      callback(new Error('请填入数字'))
      return
    }
    const port = parseInt(value.trim())
    let msg = validatePortNumber(loginUser.info.proxyType, port)
    if (msg) {
      callback(new Error(msg))
      return
    }
    if(allPort.indexOf(port) >= 0) {
      callback(new Error('该端口已被使用'))
      return
    }
    return callback()
  },
  checkContainerPort(rule, value, callback) {
    if (!value) return callback()
    if (!/^[0-9]+$/.test(value.trim())) {
      callback(new Error('请填入数字'))
      return
    }
    const port = parseInt(value.trim())
    if (port < 1 || port > 65535) {
      callback(new Error('请填入1~65535'))
      return
    }
    if (allPort.indexOf(port) >= 0) {
      callback(new Error('该端口已被占用'))
      return
    }
    return callback()
  },
  checkInputPort(rule, value, callback) {
    const { form } = this.props
    const { getFieldValue } = form
    const keys = getFieldValue('newKeys')
    const lastOne = keys[keys.length - 1]
    if (getFieldValue(`newssl${lastOne}`) == 'HTTP') return callback()
    if (!value) return callback()
    if (!/^[0-9]+$/.test(value.trim())) {
      callback(new Error('请填入数字'))
      return
    }
    const port = parseInt(value.trim())
    const { loginUser } = this.props
    let msg = validatePortNumber(loginUser.info.proxyType, port)
    if (msg) {
      callback(new Error(msg))
      return
    }
    if (allUsedPort.indexOf(value.trim()) >= 0) {
      callback(new Error('该端口已被占用'))
      return
    }
    return callback()
  },
  editPort(name, index) {
    const openPort = {[index]: true}
    this.setState({openPort, inPort: '1'})
  },
  showModal(item, i) {
    const { form, k8sService, serviceName } = this.props
    const { getFieldValue } = form
    let keys = getFieldValue('keys')
    const port = getFieldValue(`port${keys[i]}`)
    let bindingPort = ''
    if (k8sService.isFetching === false && k8sService.data && k8sService.data[camelize(serviceName)] && k8sService.data[camelize(serviceName)] && k8sService.data[camelize(serviceName)].metadata.annotations) {
      bindingPort = k8sService.data[camelize(serviceName)].metadata.annotations.bindingPort || ''
    }
    if (k8sService.data[camelize(serviceName)].metadata.annotations[ANNOTATION_HTTPS] === 'true' && parseInt(port) === parseInt(bindingPort)) {
      const notification = new NotificationHandler()
      notification.error('请先关闭HTTPS后再删除此端口')
      return
    }
    this.setState({
      delModal: true,
      index: i,
      item: item
    })
  },
  deletePort() {
    const i = this.state.index
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    let keys = getFieldValue('keys')
    if(keys.length <= 1) {
      const notification = new NotificationHandler()
      notification.warn('端口至少需要保留一个')
      return
    }
    const index = keys.indexOf(i+1)
    if(index < 0) return
    keys.splice(index, 1)
    setFieldsValue({
      keys
    })
    this.setState({
      delModal: false,
      item: null,
      i: -1
    })
    this.save()
  },
  remove(k) {
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('newKeys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    if(ob[k]) {
      ob[k] = false
    }
    // can use data-binding to set
    form.setFieldsValue({
      newKeys: keys,
    });
    this.setState({
      newselectType: 0
    })
  },
  add() {
    if(this.state.newselectType) return
    uuid++;
    const { form } = this.props;
    let keys = form.getFieldValue('newKeys');
    keys = keys.concat(uuid);
    setTimeout(() => {
      this.newPortOb.refs.input.focus()
    })
    form.setFieldsValue({
      newKeys: keys,
    });
    this.setState({
      newselectType: 1
    })
  },
  save(index) {

    const { form, k8sService } = this.props
    const keys = form.getFieldValue('keys')
    const body = []
    const self = this
    if (index !== undefined) {
      const modifyPort = form.getFieldValue(`port${keys[index]}`)
      const newProtocol = form.getFieldValue(`selectssl${keys[index]}`) ? form.getFieldValue(`selectssl${keys[index]}`) : form.getFieldValue(`ssl${keys[index]}`)
      const { k8sService, serviceName } = this.props
      let bindingPort = ''
      if (k8sService.isFetching === false && k8sService.data && k8sService.data[camelize(serviceName)] && k8sService.data[camelize(serviceName)] && k8sService.data[camelize(serviceName)].metadata.annotations) {
        bindingPort = k8sService.data[camelize(serviceName)].metadata.annotations.bindingPort || ''
      }
      if (k8sService.data[camelize(serviceName)].metadata.annotations[ANNOTATION_HTTPS] === 'true' && parseInt(modifyPort) === parseInt(bindingPort) && newProtocol.toUpperCase() !== 'HTTP') {
        const notification = new NotificationHandler()
        notification.error('请先关闭HTTPS后再修改此端口协议')
        return
      }
    }
    if(keys) {
      form.validateFieldsAndScroll((errors, values) => {
        if(errors) {
          return
        }
        const { updateServicePort, loadK8sService } = self.props
        keys.forEach(key => {
          let protocol = form.getFieldValue(`selectssl${key}`) ?  form.getFieldValue(`selectssl${key}`) :  form.getFieldValue(`ssl${key}`)
          let port = form.getFieldValue(`changeinputPort${key}`) ? form.getFieldValue(`changeinputPort${key}`) : form.getFieldValue(`inputPort${key}`)
          if(port) {
            port = parseInt(port)
          }
          if (parseInt(form.getFieldValue(`port${key}`)) && protocol) {
            body.push({
              ['container_port']: parseInt(form.getFieldValue(`port${key}`)),
              protocol: protocol,
              ['service_port']: port
            })
          }
        })
        const newKeys = form.getFieldValue('newKeys')
        newKeys.forEach(key => {
            const { k8sService, serviceName } = this.props
            var a = this.props.k8sService.data[camelize(serviceName)].metadata.annotations;
            var objNew = k8sService.data[camelize(serviceName)].metadata.annotations;
            var countSubstr=function(str,substr){
                var count;
                var reg="/"+substr+"/gi";    //查找时忽略大小写
                reg=eval(reg);
                if(str.match(reg)==null){
                    count=0;
                }else{
                    count=str.match(reg).length;
                }
                return count;
            }
            delete(objNew['system/lbgroup']);

            var objStr=objNew['tenxcloud.com/schemaPortname'];
            if(countSubstr(objStr,'HTTP')){
            }
            var objArray=objStr.split(',');
            if(objArray.length>0){
                var count=0;
                for(var i=0;i<objArray.length;i++){
                    if(objArray[i].indexOf('TCP')>-1){
                    } else if(objArray[i].indexOf('HTTP')>-1  && form.getFieldValue(`newssl${key}`) == 'HTTP'){
                        count=count+1;
                        if(count>=1){
                            const notification = new NotificationHandler()
                            notification.error('相同服务不能同时暴露两个HTTP协议')
                            return false;
                        }
                    }
                }
            }
          if (parseInt(form.getFieldValue(`newport${key}`)) && form.getFieldValue(`newssl${key}`)) {
            body.push({
              ['container_port']: parseInt(form.getFieldValue(`newport${key}`)),
              protocol: form.getFieldValue(`newssl${key}`),
              ['service_port']: parseInt(form.getFieldValue(`newinputPort${key}`)),
            })
          }
        })
        const { cluster, serviceName } = self.props
        const notification = new NotificationHandler()
        notification.spin('端口更新中')
        updateServicePort(cluster, serviceName, body, {
          success: {
            func: (res) => {
              loadK8sService(cluster, serviceName, {
                success: {
                  func: (res) => {self.setState({
                    inPort: '1',
                    openPort: []
                    })
                    ob = {}
                    const keys = []
                    for(let i=0;i< res.data[camelize(serviceName)].spec.ports.length; i++) {
                      keys.push(i + 1)
                    }
                    self.setState({
                      newselectType: 0,
                      selectType: 0
                    })
                    self.props.form.setFieldsValue({
                      keys,
                      newKeys: []
                    })
                    //self.props.loadData()
                  },
                  isAsync: true
                },
              })
              notification.close()
              notification.success('端口更新成功')
            },
            isAsync: true
          },
          failed: {
            func: (result) => {
              notification.close()
              notification.error(result.message.message)
            }
          }
        })
      })
    }
    return
  },
  inputPort(index, e) {
    const { form } = this.props
    if(!e) {
      const protocol = form.getFieldValue(`inputPort${index}`)
      if(protocol.toLowerCase() == 'http') {
        return
      }
    }
    if(e && e.toLowerCase() == 'http') {
      this.setState({
        inPort: 1
      })
      form.setFieldsValue({
        [`inputPort${index}`]: 80
      })
    } else {
      const selectType = this.state.selectType
      form.setFieldsValue({
        [`inputPort${index}`]: null,
        [`changeinputPort${index}`]: null
      })
      this.setState({
        inPort: selectType
      })
    }
  },
  changeType(e, index) {
    const protocol = this.props.form.getFieldValue(`selectssl${index}`)
    if(protocol.toLowerCase() == 'http') {
      this.setState({
        selectType: e
      })
      return
    } else {
      this.setState({ inPort: e, selectType: e })
      if (e == 2) {
        setTimeout(() => {
          document.getElementById(`changeinputPort${index}`).focus()
        })
      }
    }
  },
  newInputPort(index, e) {
    const { form } = this.props
    if(e && e.toLowerCase() == 'http') {
      ob[index] = false
      form.setFieldsValue({
        [`newinputPort${index}`]: '80'
      })
    } else {
      const selectType = this.state.newselectType
      form.setFieldsValue({
        [`newinputPort${index}`]: null
      })
      ob[index] = selectType == 2
    }
  },
  newChangeType(e, index) {
    const protocol = this.props.form.getFieldValue(`newssl${index}`)
    this.setState({
      newselectType: e
    })
    if(protocol.toLowerCase() == 'http') {
      ob[index] = false
      return
    } else {
      if(e == 2) {
        ob[index] = true
        setTimeout(() => {
          this.newInputPortOb.refs.input.focus()
        })
        return
      }
      this.props.form.setFieldsValue({[`newinputPort${index}`]: null})
      ob[index] = false
    }
  },
  render: function () {
    const { k8sService } = this.props
    const { disableHTTP } = this.state
    const { getFieldProps, getFieldValue, resetFields } = this.props.form
    const self = this
    if (k8sService.isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!k8sService.data) {
      return (<div className='loadingBox'>
        无端口
      </div>)
    }
    let property = Object.getOwnPropertyNames(k8sService.data)
    if (property.length === 0) {
      return (<div className='loadingBox'>
        无端口
      </div>)
    }
    const service = k8sService.data[property[0]]
    if (!service.spec) {
      return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    }
    const ports = service.spec.ports
    const annotations = service.metadata.annotations
    let userPort = annotations['tenxcloud.com/schemaPortname']
    if(!userPort)  return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    userPort = userPort.split(',')
    userPort = userPort.map(item => {
      return item.split('/')
    })
    if (ports.length < 1) {
      return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    }
    getFieldProps('newKeys', {
      initialValue: [],
    });
    const formItems = []
    getFieldValue('newKeys').forEach((k) => {
      let rules = {}
      if(ob[k]) {
        rules = {
          required: true,
          whitespace: true,
          message: '请输入端口'
        }
      }
      formItems.push(
        <div className="portDetail" key={`list${k}`}>
          <div className="commonData">
            <Form.Item key={k}>
              <Input  {...getFieldProps(`newport${k}`, {
                ref : (instance) => this.newPortOb = instance,
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '输入容器端口',
                }, {validator: this.checkContainerPort}],
              })}  style={{ width: '80%', marginRight: 8 }}
              />
            </Form.Item>
          </div>
          <div className="commonData">
          <Form.Item  key={k}>
              <Select {...getFieldProps(`newssl${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请选择协议类型',
                }],
                initialValue: (disableHTTP ? 'TCP' : 'HTTP'),
                onChange: (e) => self.newInputPort(k, e)
              })} style={{width:'80px'}}>
              <Select.Option disabled={disableHTTP} key="TCP">TCP</Select.Option>
              <Select.Option  key='HTTP'>HTTP</Select.Option>
            </Select>
            </Form.Item>
          </div>
          <div className="commonData span2">
            <Select style={{ width:'90px', display: getFieldProps(`newssl${k}`).value == 'HTTP' ? 'none' : 'inline-block'}}  {...getFieldProps(`newserverPort${k}`, {
                rules: [{
                  required: true,
                  whitespace: true,
                }],
                onChange: (e) => self.newChangeType(e, k),
                initialValue: '动态生成'
              })} >
              <Select.Option key="1">动态生成</Select.Option>
              <Select.Option key="2">指定端口</Select.Option>
            </Select>
            <span style={{display: getFieldProps(`newssl${k}`).value == 'HTTP' ? 'inline-block' : 'none'}}>80</span>
          </div>
          <div className="commonData span2">
            <Form.Item key={k} style={{position: 'relative'}}>
            <Input  type='text' style={{width: '80px', marginLeft: '0px', display: ob[k] ? 'inline-block' : 'none'}} {...getFieldProps(`newinputPort${k}`, {ref: instance => this.newInputPortOb = instance,rules: [rules, {validator: this.checkInputPort}], initialValue: this.state.disableHTTP ? '': "80"})} />
            </Form.Item>
          </div>
          <div className="commonData span3">
            <Button type="primary" onClick={this.save}>保存</Button>
            <Button type="ghost" style={{marginLeft:'6px'}} onClick={()=> this.remove(k)}>取消</Button>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });

    const items = []
    allUsedPort = []
    allPort = []
    ports.forEach((item, index) => {
      const targetPort = findIndex(userPort, i => i[0] == item.name)
      if(targetPort < 0) return
      let target = userPort[targetPort]
      if(!target) return
      if(target[1].toLowerCase() == 'tcp' && target.length < 3) return
      const dropdown = (
        <Menu style={{width:'100px'}} onClick={()=> this.editPort(item.name, index)}>
          <Menu.Item key="1"><Icon type="edit" /> &nbsp;编辑</Menu.Item>
        </Menu>
      )
      const actionText = (
        <Menu style={{width:'100px'}} onClick={()=> this.handCancel(index)}>
          <Menu.Item key="1"><Icon type="minus-circle-o" /> &nbsp;取消</Menu.Item>
        </Menu>
      )
      allUsedPort.push(target[2])
      allPort.push(item.targetPort ? item.targetPort : '80')
      items.push (
        <div className="portDetail" key={item.name}>
          <div className="commonData">
            <Form.Item>
            <Input  type="hidden" {...getFieldProps(`port${index+1}`, {
              initialValue: item.targetPort
            })}/>
            <span>{item.targetPort}</span>
            </Form.Item>
          </div>
          <div className="commonData">
            <Form.Item>
            { this.state.openPort && this.state.openPort[index] ?
              <Select style={{width:'80px'}} {...getFieldProps(`selectssl${index+1}`, {
                initialValue: target[1],
                onChange: (e) => self.inputPort(index + 1, e)
                })} >
                <Select.Option key="TCP">TCP</Select.Option>
                <Select.Option disabled={disableHTTP} key="HTTP">HTTP</Select.Option>
              </Select>
              :
              <span><Input type="hidden" {...getFieldProps(`ssl${index+1}`, {
                initialValue: target[1]
              })}/>{target[1]}</span>
            }
           </Form.Item>
          </div>
          <div className="commonData span2">

            { this.state.openPort && this.state.openPort[index] ?
              getFieldProps(`selectssl${index+1}`).value == 'HTTP' ? <span>80</span> :
              <Select defaultValue='动态生成' style={{width:'90px'}} onChange={(e)=> this.changeType(e, index + 1)}>
                <Select.Option key="1">动态生成</Select.Option>
                <Select.Option key="2">指定端口</Select.Option>
              </Select>
              :
              <span><Input type="hidden" {...getFieldProps(`inputPort${index+1}`, {
                initialValue: target[1].toLowerCase() == 'http' ? 80 : target[2]
              })}/>{target[1].toLowerCase() == 'http' ? 80 : target[2]}</span>
            }

          </div>
          <div className="commonData span2">
            { this.state.openPort && this.state.openPort[index] && this.state.inPort =='2' ?
              <Form.Item style={{width: '90px', float: 'left', }}>
                <Input {...getFieldProps(`changeinputPort${index + 1}`, {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '输入容器端口',
                  }, {validator: (rule, value, callback) => this.checkPort(rule, value, callback, index+1)}]
                })}/>
               </Form.Item>
              :<span>&nbsp;</span>
            }
          </div>
          <div className="commonData span3">
            { this.state.openPort && this.state.openPort[index] ?
              <Dropdown.Button overlay={actionText} type="ghost" style={{width:'100px'}} onClick={() => {this.save(index)}}>
                  <Icon type="save" /> 保存
              </Dropdown.Button>
              :
              <Dropdown.Button overlay={dropdown} type="ghost" onClick={()=> this.showModal(item, index)} style={{width:'100px'}}>
                <Icon type="delete" />删除
              </Dropdown.Button >
            }
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    if(items.length == 0) return (
        <div className='loadingBox'>
            无端口
        </div>
     )
    return (
      <Card className="portList">
        {items}
        { formItems }
        <div className="pushRow">
         <a onClick={()=> this.add()}> <Icon type="plus" /> 添加端口映射</a>
        </div>
        <Modal title="删除端口操作" visible={this.state.delModal}
          onOk={() => this.deletePort()} onCancel={() => this.setState({ delModal: false })}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{ marginRight: '8px' }}></i>您是否确定要删除{this.state.item ? this.state.item.targetPort : ''}端口吗?</div>
        </Modal>
      </Card>
    );
  }
});

function mapSateToProp(state) {
  const { loginUser } = state.entities
  return {
    loginUser: loginUser,
    k8sService: state.services.k8sService,
  }
}
MyComponent = Form.create()(MyComponent);

MyComponent = connect(mapSateToProp, {
  loadK8sService,
  clearK8sService,
  updateServicePort
})(MyComponent)

class PortDetail extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { containerList, loading, currentCluster } = this.props
    return (
      <div id="PortDetail">
        <div className="titleBox">
          <div className="commonTitle">
            容器端口
          </div>
          <div className="commonTitle">
            协议
          </div>
          <div className="commonTitle span4">
            服务端口
          </div>
          <div className="commonTitle span2">
            操作
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <MyComponent
          config={containerList}
          loading={loading}
          cluster={this.props.cluster}
          currentCluster={currentCluster}
          serviceName={this.props.serviceName}
          loadData = {this.props.loadData}
          serviceDetailmodalShow={this.props.serviceDetailmodalShow}
          isCurrentTab={this.props.isCurrentTab} />
      </div>
    )
  }
}

PortDetail.propTypes = {
  cluster: PropTypes.string.isRequired,
  currentCluster: PropTypes.object.isRequired,
  serviceName: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default PortDetail
