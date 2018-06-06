/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * NetworkConfiguration list component
 *
 * v0.1 - 2017-4-24
 * @author XuLongcheng
 */
import React from 'react'
import { camelize } from 'humps'
import { Icon, Select, Button, Card, Form, Input, Tooltip, Spin, Modal, Dropdown, Menu, Row, Col,Collapse,Table } from 'antd'
import { getProxy, updateProxy, getClusterNodeAddr, setDefaultGroup } from '../../actions/cluster'
import { changeClusterIPsAndDomains } from '../../actions/entities'
import { getAllClusterNodes } from '../../actions/cluster_node'
import NotificationHandler from '../../common/notification_handler'
import { connect } from 'react-redux'
import networkImg from '../../assets/img/integration/network.png'
import mappingImg from '../../assets/img/integration/mapping.svg'
import { loadUserTeamspaceList } from '../../actions/user'
import sketchImg from '../../assets/img/integration/Sketch.png'
import './style/NetworkConfiguration.less'
import { IP_REGEX, HOST_REGEX } from '../../../constants'

const Option = Select.Option
const Panel = Collapse.Panel;

let formadd=1;
let validing = false

let NetworkConfiguration = React.createClass ({
  getInitialState() {
    this.uuid = {
      configKey: 0,
      nodes: []
    }
    return {
      editCluster: false, // edit btn
      saveBtnDisabled: false,
      showDeleteModal: false,
      visible:false,
      settingDefalut: false,
      settingDefalutLoading: true,
      defaultSetting: undefined,
      deleteDefaultGroup: false,
      currentItem: {},
      defaultGroup: undefined,
    }
  },
  componentWillMount(){
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { getProxy, cluster,loadUserTeamspaceList } = this.props
    getFieldProps('arr', {
      initialValue: [0]
    })
    getFieldProps('networkConfigArray', {
      initialValue: [0]
    })
    this.loadData()
    loadUserTeamspaceList('default', { size: 1000 }).then(({response}) => {
      const { teamspaces } = response.result
      let currentTeam
      if (teamspaces) {
        this.setState({
          currentTeam,
        })
      }
    })
  },
  loadData(needFetching) {
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { getProxy, cluster } = this.props
    getProxy(this.props.cluster.clusterID, needFetching == undefined ? true : needFetching, {
      success: {
        func:(res) => {
          const clusterID = camelize(cluster.clusterID)
          if(res[clusterID] && res[clusterID].data) {
            const data = res[clusterID].data
            const networkConfigArray = []
            this.uuid.configKey = data.length -1
            data.forEach((item, index) => {
              let nodesArray = []
              let nodesItem = {
                key: index,
                nodesKey: item.nodes.length - 1
              }

              if(item.isDefault){
                this.setState({
                  defaultGroup: item.id
                })
              }

              item.nodes.forEach((nodeItem, nodeIndex) => {
                nodesArray.push(nodeIndex)
              })

              let networkConfig = {
                key: index,
                arr: nodesArray,
              }
              this.uuid.nodes.push(nodesItem)
              networkConfigArray.push(networkConfig)
            })
            setFieldsValue({
              'arr': [0],
              'networkConfigArray': networkConfigArray
            })
            return
          }
          setFieldsValue({
            'arr': [0],
            'networkConfigArray': [
              {
                key: 0,
                arr: [0]
              }
            ]
          })
        }
      },
      failed: {
        func: () => {
          setFieldsValue({
            'arr': [0],
            'networkConfigArray': [
              {
                key: 0,
                arr: [0]
              }
            ]
          })
        }
      }
    })
  },
  getSelectItem() {
    const { nodeList, cluster } = this.props
    const clusterID = cluster.clusterID
    if(!nodeList) {
      return <Option key="none"/>
    }
    if(nodeList[clusterID].isFetching) {
      return <Card id="Network" className='header'>
        <div className="h3">网络配置</div>
        <div className="loadingBox" style={{height:'100px'}}><Spin size="large"></Spin></div>
      </Card>
    }
    let nodes = []
    if(nodeList[clusterID].nodes && nodeList[clusterID].nodes.clusters && nodeList[clusterID].nodes.clusters.nodes && nodeList[clusterID].nodes.clusters.nodes.nodes){
      nodes = nodeList[clusterID].nodes.clusters.nodes.nodes
    }
    return nodes.map(node => {
      return <Option key={node.objectMeta.name} value={node.objectMeta.name}>{node.objectMeta.name}</Option>
    })
  },
  isExistRepeat(type, config, key) {
    const { form } = this.props
    const { getFieldsValue, getFieldValue } = form
    const itemKey = config.key
    const networkConfigArray = getFieldValue('networkConfigArray')
    const values = getFieldsValue()
    const nodeValue = getFieldValue(`nodeSelect-${itemKey}-${key}`)
    const IPValue = getFieldValue(`nodeIP-${itemKey}-${key}`)
    let nodeResult = false
    let IPResult = false
    networkConfigArray.forEach(item => {
      if(type == 'node'){
        item.arr.forEach(arrItem => {
          if(values[`nodeSelect-${item.key}-${arrItem}`] === nodeValue && `${item.key}-${arrItem}` !== `${config.key}-${key}`){
            nodeResult = true
          }
        })
      }
      if(type == 'IP'){
        item.arr.forEach(arrItem => {
          // Allow all IP to be 0.0.0.0
          if (values[`nodeIP-${item.key}-${arrItem}`] === '0.0.0.0') {
            return true
          }
          if(values[`nodeIP-${item.key}-${arrItem}`] === IPValue && `${item.key}-${arrItem}` !== `${config.key}-${key}`){
            IPResult = true
          }
        })
      }
    })
    return {
      nodeResult,
      IPResult,
    }
  },
  validAllField(type) {
    if(validing) {
      return
    }
    validing = true
    const { form } = this.props
    let networkConfigArray = form.getFieldValue('networkConfigArray')
    let validateFieldsArray = []
    if(type == 'node'){
      networkConfigArray.forEach(item => {
        item.arr.forEach(arrItem => {
          validateFieldsArray.push([`nodeSelect-${item.key}-${arrItem}`])
        })
      })
    } else if(type == 'IP'){
      networkConfigArray.forEach(item => {
        item.arr.forEach(arrItem => {
          validateFieldsArray.push([`nodeIP-${item.key}-${arrItem}`])
        })
      })
    } else {
      networkConfigArray.forEach(item => {
        item.arr.forEach(arrItem => {
          validateFieldsArray.push([`nodeSelect-${item.key}-${arrItem}`])
          validateFieldsArray.push([`nodeIP-${item.key}-${arrItem}`])
        })
      })
    }
    form.validateFields(validateFieldsArray, {force: true}, (err, callback) => {
      validing = false
    })
  },
  valiadAllGroupNameField(){
    if(validing) {
      return
    }
    validing = true
    const { form } = this.props
    let networkConfigArray = form.getFieldValue('networkConfigArray')
    let validateFieldsArray = []
    networkConfigArray.forEach(item => {
      validateFieldsArray.push(`name${item.key}`)
    })
    form.validateFields(validateFieldsArray, {force: true}, (err, callback) => {
      validing = false
    })
  },
  isNameRepeat(key){
    const { form } = this.props
    const { getFieldsValue, getFieldValue } = form
    let networkConfigArray = getFieldValue('networkConfigArray')
    let values = getFieldsValue()
    let nowName = getFieldValue([`name${key}`])
    return networkConfigArray.some(item => {
      if(values[`name${item.key}`] === nowName && item.key !== key){
        return true
      }
    })
  },
  handDelete(config, key) {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    let networkConfigArray = getFieldValue('networkConfigArray')
    networkConfigArray.forEach((item, index) => {
      if(item.key == config.key){
        item.arr = item.arr.filter(keys => {return keys !== key})
      }
    })
    setFieldsValue({
      networkConfigArray
    })
    setTimeout(() => {
      this.validAllField()
    },200)
  },
  updateCluster() {  // 保存 更改
    const { form, cluster, updateProxy, getProxy, changeClusterIPsAndDomains } = this.props
    const { getFieldValue } = form
    validing = true
    this.setState({
      saveBtnDisabled: true
    })
    form.validateFields({force: true}, (err, values) => {
      validing = false
      if(err) {
        this.setState({
          saveBtnDisabled: false
        })
        return
      }
      const notify = new NotificationHandler()
      const networkConfigArray = values.networkConfigArray
      networkConfigArray.forEach(item => {
        if(!item.arr || item.arr.length == 0) {
          this.setState({
            saveBtnDisabled: false
          })
          notify.error('请填入一组代理出口')
          return
        }
      })
      const body = []
      networkConfigArray.forEach(item => {
        let spacesArr = []
        let space = values[`spaces${item.key}`]
        if(space){
          space.forEach(val => {
            let spacesName = {'space_name':JSON.parse(val).spaceName}
            spacesArr.push(spacesName)
          })
        }
        let obj = {
          'id': values[`groupId${item.key}`],
          "name": values[`name${item.key}`],
          "type": values[`networkType${item.key}`],
          "address": values[`address${item.key}`],
          "domain": values[`domain${item.key}`],
          'is_default': values[`isDefaultGroupAttr${item.key}`]?1:0,
          'spaces': spacesArr
        }
        let nodes = []
        item.arr.forEach(arrItem => {
          let arrObj = {
            'host': values[`nodeSelect-${item.key}-${arrItem}`],
            'address': values[`nodeIP-${item.key}-${arrItem}`],
          }
          nodes.push(arrObj)
        })
        obj.nodes = nodes
        body.push(obj)
      })
      const entity = {
        bindingIPs: getFieldValue('bindingIPs'),
        bindingDomains: getFieldValue('bindingDomains'),
        nodeProxys: []
      }
      //const nodeProxys = entity.nodeProxys
      //arr.forEach(item => {
      //  nodeProxys.push({
      //    host: getFieldValue(`nodeSelect${item}`),
      //    address: getFieldValue(`nodeIP${item}`)
      //  })
      //})
      notify.spin('更新代理出口中')
      updateProxy(cluster.clusterID, body, {
        success: {
          func: () => {
            notify.close()
            notify.success('代理出口更新成功')
            setTimeout(() => changeClusterIPsAndDomains(entity.bindingIPs ? `["${entity.bindingIPs}"]` : '', entity.bindingDomains ? `["${entity.bindingDomains}"]` : ''),0)
            this.loadData(false)
            this.setState({
              saveBtnDisabled: false,
              editCluster: false
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notify.close()
            notify.error('代理出口更新失败，请重试')
            this.setState({
              saveBtnDisabled: false,
              editCluster: true
            })

          }
        }
      })
    })
  },
  cancleEdit() {
    this.setState({editCluster: false, saveBtnLoading: false, saveBtnDisabled: true})
    const { form, cluster, clusterProxy } = this.props
    const clusterID = camelize(cluster.clusterID)
    if(clusterProxy.result[clusterID] && clusterProxy.result[clusterID].data) {
      const data = clusterProxy.result[clusterID].data
      const networkConfigArray = []
      this.uuid.configKey = data.length -1
      data.forEach((item, index) => {
        let nodesArray = []
        let nodesItem = {
          key: index,
          nodesKey: item.nodes.length - 1
        }

        item.nodes.forEach((nodeItem, nodeIndex) => {
          nodesArray.push(nodeIndex)
        })

        let networkConfig = {
          key: index,
          arr: nodesArray,
        }
        this.uuid.nodes.push(nodesItem)
        networkConfigArray.push(networkConfig)
      })
      form.setFieldsValue({
        'networkConfigArray': networkConfigArray
      })
      return
    }
  },
  nodeChange(value, networkKey, key){
    const { nodeList, cluster, form } = this.props
    const clusterID = cluster.clusterID
    if(!nodeList || nodeList[clusterID].isFetching){
      return
    }
    let nodes = []
    if(nodeList[clusterID].nodes && nodeList[clusterID].nodes.clusters && nodeList[clusterID].nodes.clusters.nodes && nodeList[clusterID].nodes.clusters.nodes.nodes){
      nodes = nodeList[clusterID].nodes.clusters.nodes.nodes
    }
    let address = undefined
    for(let i=0; i < nodes.length; i++){
      if(nodes[i].objectMeta.name === value){
        address = nodes[i].address
        break
      }
    }
    form.setFieldsValue({
      [`nodeIP-${networkKey}-${key}`]: address
    })
    setTimeout(() => {
      this.validAllField('IP')
    }, 100)
  },
  getItems(config) {
    const { cluster, form, clusterProxy } = this.props
    const { getFieldProps, getFieldValue } = form;
    const { editCluster, saveBtnLoading } = this.state
    let {bindingIPs} = cluster
    if(clusterProxy.isEmptyObject || !clusterProxy.result) {
      return <div></div>
    }
    let proxy = clusterProxy.result[camelize(cluster.clusterID)].data
    //if(!proxy.length) {
    //  return <div></div>
    //}
    let arr = config.arr;
    if(!arr.length) {
      return <div></div>
    }
    let networkKey = config.key
    return arr.map(item => {
      let nodes = {}
      if(proxy && proxy[networkKey] && proxy[networkKey].nodes){
        nodes = proxy[networkKey].nodes
      }
      return <div key={item} id="error-s" style={{height: '57px'}}>
        <Row style={{width: '100%'}}>
          <Col xs={{span: 11}} style={{paddingRight: '10px'}}>
            <Form.Item>
              { editCluster ?
                <Select {...getFieldProps(`nodeSelect-${networkKey}-${item}`, {
                  initialValue: nodes && nodes[item] ? nodes[item].host : undefined,
                  rules: [{
                    validator: (rule, value, callback) => {
                      if(!value) {
                        return callback('请选择节点')
                      }
                      this.validAllField('node')
                      if(this.isExistRepeat('node', config, item).nodeResult) {
                        return callback('代理节点重复')
                      }
                      callback()
                    }
                  }],
                  onChange:(value) => this.nodeChange(value, networkKey, item)
                })}  placeholder="选择服务节点">
                  {this.getSelectItem()}
                </Select> :
                <span>{nodes && nodes[item] ? nodes[item].host : ''}</span>
              }
            </Form.Item>
          </Col>
          <Col xs={{span: 11}} style={{paddingRight:'10px'}}>
            <Form.Item>
              { editCluster ?
                <Input {...getFieldProps(`nodeIP-${config.key}-${item}`,{
                  initialValue: nodes && nodes[item] ? nodes[item].address : undefined,
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if(!value) {
                          return callback('请填写网卡 IP')
                        }
                        if (!IP_REGEX.test(value)) {
                          return callback([new Error('请填写正确的网卡 IP')])
                        }
                        this.validAllField('IP')
                        if(this.isExistRepeat('IP', config, item).IPResult) {
                          return callback('节点网卡重复')
                        }
                        callback()
                      }
                    }
                  ]
                })
                } placeholder="输入服务出口 IP" />
                :
                <span>{nodes && nodes[item] ? nodes[item].address : ''}</span>
              }
            </Form.Item>

          </Col>
          <Col xs={{span:2}}>
            {
              editCluster ?  <p className="delete-p"><Icon style={{paddingTop:'5px',cursor:'pointer'}}  type="delete" onClick={() => this.handDelete(config, item)}/></p> : <span></span>
            }
          </Col>
        </Row>
      </div>
    })
  },
  add (item){
    const {form} = this.props;
    validing = true
    let validateFieldsArray = []
    let itemKey = item.key
    item.arr.forEach(item => {
      validateFieldsArray.push(`nodeSelect-${itemKey}-${item}`)
      validateFieldsArray.push(`nodeIP-${itemKey}-${item}`)
    })
    form.validateFields(validateFieldsArray, (err, callback) => {
      validing = false
      if(err) {
        return
      }
      const { getFieldValue, setFieldsValue } = form;
      let arr = item.arr;
      let nodesLength = 0
      this.uuid.nodes.forEach((nodesItem, index) => {
        if(nodesItem.key == item.key){
          nodesLength = nodesItem.nodesKey + 1
          nodesItem.nodesKey = nodesLength
        }
      })
      arr.push(nodesLength);
      let newnetworkConfigArray = getFieldValue('networkConfigArray')
      for(let i = 0; i < newnetworkConfigArray.length; i++){
        if(newnetworkConfigArray[i].key == item.key){
          newnetworkConfigArray[i].arr = arr
        }
      }
      setFieldsValue({
        'networkConfigArray': newnetworkConfigArray
      });
    })
  },
  addPublic(){// 添加网络出口
    this.uuid.configKey++
    const { form } = this.props;
    const _this = this;
    // can use data-binding to get
    form.validateFields((err, values) => {
      if(!!err){
        return
      }
      let networkConfigArray = form.getFieldValue('networkConfigArray');
      let item = {
        key: this.uuid.configKey,
        arr: [0]
      }
      let nodesItem = {
        key: this.uuid.configKey,
        nodesKey: 0
      }
      this.uuid.nodes.push(nodesItem)
      networkConfigArray.push(item)
      //keys = keys.concat(uuid);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        networkConfigArray,
      });
      setTimeout(function(){
        document.getElementById(`name${_this.uuid.configKey}`).focus()        
      },200)
    })
  },
  deletePublic(item, record){
    const { form } = this.props
    let networkConfigArray = form.getFieldValue('networkConfigArray')
    let newnetworkConfigArray = []
    this.setState({
      currentGroup: record ? record.isDefault: false
    })
    if(record && record.isDefault){
      return this.setState({
        deleteDefaultGroup: true,
        currentItem: item,
        currentName: record.name,
      })
    }
    if(!record || record == 'confirm'){
      networkConfigArray.forEach(config => {
        if(item.key !== config.key){
          newnetworkConfigArray.push(config)
        }
      })
      form.setFieldsValue({
        'networkConfigArray': newnetworkConfigArray
      })
      this.setState({
        deleteDefaultGroup: false
      })
      return
    }
    return this.setState({
      deleteDefaultGroup: true,
      currentItem: item,
      currentName: record.name
    })
  },
  networkTypeText(type){
    if(type == "public"){
      return <span>公网</span>
    }
    if(type == 'private'){
      return <span>内网</span>
    }
    return <span></span>
  },
  typeIcon(type){
    if(type == "public"){
      return <span className='typeIcon typePublic'>公</span>
    }
    if(type == 'private'){
      return <span className='typeIcon typePrivate'>内</span>
    }
    return null
  },
  titleStar(type){
    if(type == "public" || type == 'private'){
      return <span style={{color: 'red'}}>*</span>
    }
    return null
  },
  selectOption(){
    const { clusterProxy, cluster } = this.props
    if(clusterProxy.isEmptyObject || !clusterProxy.result) {
      return <Option value="none" key="none">暂无出口</Option>
    }
    let proxy = clusterProxy.result[camelize(cluster.clusterID)]
    if(!proxy || !proxy.data || !proxy.data.length) {
      return <Option value="none" key="none">暂无出口</Option>
    }
    return proxy.data.map((item, index) => {
      return <Option value={item.id} key={'option' + index}>{item.name}</Option>
    })
  },
  selectSettingChange(value){
    this.setState({
      defaultGroup: value
    })
  },
  confirmSet(){
    const { defaultGroup } = this.state
    const { setDefaultGroup, cluster } = this.props
    let Noti = new NotificationHandler()
    this.setState({
      settingDefalutLoading: true
    })
    if(!defaultGroup){
      this.setState({
        settingDefalutLoading: false
      })
      return Noti.error('默认网络出口不能为空')
    }
    const clusterID = cluster.clusterID
    const groupID = defaultGroup
    setDefaultGroup(clusterID, groupID, {
      success: {
        func: () => {
          this.setState({
            settingDefalutLoading: false,
            settingDefalut: false,
          })
          this.props.form.resetFields(['defaultSetting'])
          Noti.success('设置默认网络出口成功')
          this.loadData()
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            settingDefalutLoading: false
          })
          Noti.error('设置默认网络出口失败')
        }
      }
    })
  },
  cancelSet(){
    const { form } = this.props
    this.setState({
      settingDefalut: false
    })
    form.resetFields(['defaultSetting'])
  },
  rendernetworkConfigList(clusterProxy){
    console.log(clusterProxy,'---------clusterProxy')
    const { cluster, form,teamspaces } = this.props
    const { getFieldProps, getFieldValue, setFieldsValue } = form
    const { editCluster } = this.state
    const teamspaceList = teamspaces.map((list, index) => { // 空间下拉菜单列表
      return (
        <Option key={JSON.stringify(list)}>{list.spaceName}</Option>
      )
    })
    if(clusterProxy.isEmptyObject) {
      return <div className="nodata"><Spin size="large"></Spin></div>
    }
    if(!clusterProxy.result) {
      return <div className="nodata">暂无配置，请添加</div>
    }
    let proxy = clusterProxy.result[camelize(cluster.clusterID)]
    if(!proxy) {
      return <div className="nodata">暂无配置，请添加</div>
    }
    let networkConfigArray = form.getFieldValue('networkConfigArray')
    if(!networkConfigArray) {
      return <div className="nodata">暂无配置，请添加</div>
    }
    let dataList = proxy.data
    let data = []
    if(dataList && dataList.length!=0){
      dataList.forEach((item, index) => {
        if(item.type !== "incluster"){
          data.push(item)
        }
      })
    }
    
    let networkConfigList = []
    console.log(networkConfigArray.length || dataList,'-------networkConfigArray')
    if(!networkConfigArray.length){
      networkConfigList = [
        <div className='nodata'>暂无配置，请添加</div>
      ]
    } else {
      networkConfigList = networkConfigArray.map((item,index) => {
        if(item == 0){
          return <div></div>
        }
        let originType = data[item.key] && data[item.key].type ? data[item.key].type : undefined
        let networkType = originType
        if(editCluster){
          networkType = getFieldValue(`networkType${item.key}`) || originType
        }
        let nameProps
        let addressProps
        let domainProps
        let groupidProps
        let isDefaultGroupAttr
        let spaceProps
        let initSpace = []     
        let spaceList = data[item.key]&&data[item.key].spaces?data[item.key].spaces:[]
        if(spaceList && spaceList.length != 0){
          teamspaces.map((list, index) => { // 空间下拉菜单列表
            spaceList.forEach((item, index) => {
              if(item.spaceName == list.spaceName){
                initSpace.push(JSON.stringify(list))
              }
            })
          })
        }
        const columns = [{
          title: '名称',
          dataIndex: 'spaceName',
        }];
        const data2 = spaceList;

        if(editCluster){
          groupidProps = getFieldProps(`groupId${item.key}`,{
            initialValue: data[item.key] && data[item.key].id ? data[item.key].id : '',
          })

          isDefaultGroupAttr = getFieldProps(`isDefaultGroupAttr${item.key}`,{
            initialValue: data[item.key] && data[item.key].isDefault ? data[item.key].isDefault : false,
          })

          nameProps = getFieldProps(`name${item.key}`,{
            initialValue: data[item.key] && data[item.key].name ? data[item.key].name : undefined,
            rules:[{
              validator: (rule, value, callback) => {
                if(!value) {
                  return callback('网络代理不能为空')
                }
                this.valiadAllGroupNameField()
                if(this.isNameRepeat(item.key)) {
                  return callback('网络代理重复')
                }
                callback()
              }
            }]
          })

          addressProps = getFieldProps(`address${item.key}`,{
            initialValue: data[item.key] && data[item.key].address ? data[item.key].address : '',
            rules:[{required: true, message: '服务出口不能为空'}]
          })

          domainProps = getFieldProps(`domain${item.key}`,{
            initialValue: data[item.key] && data[item.key].domain ? data[item.key].domain: '',
            rules: [{ required: false }]
          })
          spaceProps = getFieldProps(`spaces${item.key}`, {
            initialValue:initSpace,
            rules: [
              { required: false, message: '', type: 'array' },
            ],
          });
        }
        return  <Row className="clusterTable" key={`networkConfig-${item.key}`}>
          <Icon type="cross" className='crossIcon' onClick={() => this.deletePublic(item, data[item.key])} style={{display: editCluster ? 'inline-block' : 'none'}}/>
          {
            data[item.key] && data[item.key].isDefault
              ? <div className='dafaultGroup'>默认</div>
              : null
          }
          <Col xs={{span:10}}>{/* Yao.wei 代理节点 */}
            <div className="formItem inner-mesh">
              <Row className='innerItemTitle'>
                <Col xs={{span:11}}>代理节点</Col>
                <Col xs={{span:13}}>节点的网卡IP(多网卡时请确认)</Col>
              </Row>
              {this.getItems(item)}{/*  列表数据 */}
              {editCluster ?
                <Form.Item className="increase">
                  <span onClick={() => this.add(item)}><Icon type="plus-circle-o" /> 新增一条内网代理</span>
                </Form.Item>
                :
                null
              }
            </div>
          </Col>
          <Col style={{height:'100%'}} xs={{span:4}}>
            <div className="imgBox imgboxa">
              <img style={{width:'90%', maxWidth: '190px'}} src={mappingImg}/>
            </div>
          </Col>
          <Col xs={{span:10}}>
            <div className="formItem extranet">
              <Row className='publickItemTitle'>
                <Col span="11">
                  类型
                  <span style={{color: 'red'}}>*</span>
                  <Tooltip title='该类型决定该网络出口在创建服务时出现在哪种服务访问方式中'>
                    <Icon type="question-circle-o" className='qustionIcon'/>
                  </Tooltip>
                  { this.typeIcon(networkType)}
                </Col>
                <Col span="11">
                  名称
                  {this.titleStar(networkType)}
                  <Tooltip title='建议名称能体现出内网或公网，供创建服务时选择服务访问类型用'>
                    <Icon type="question-circle-o" className='qustionIcon'/>
                  </Tooltip>
                </Col>
              </Row>

              <Row>
                <Col span="11" className='publicItem'>
                  {
                    editCluster
                      ? <Form.Item>
                      <Select {...getFieldProps(`networkType${item.key}`,{
                        initialValue: data[item.key] && data[item.key].type ? data[item.key].type : undefined,
                        rules:[{required: true, message: '网络类型不能为空'}]
                      })}>
                        <Option value="public" key="public">公网</Option>
                        <Option value="private" key="private">内网</Option>
                        {/*<Option value="incluster" key="incluster">不填写</Option>*/}
                      </Select>
                    </Form.Item>
                      : <div className='value'>{ data[item.key] && data[item.key].type ? this.networkTypeText(data[item.key].type) : ''}</div>
                  }
                </Col>
                <Col span="11" className='publicItem'>
                  {
                    editCluster
                      ? <Form.Item>
                      <Input placeholder={ networkType == 'incluster' ? '无需填写' : '填写网络代理名称'} {...nameProps} disabled={networkType == 'incluster'}/>
                    </Form.Item>
                      : <div className='value'>{data[item.key] && data[item.key].name ? data[item.key].name : ''}</div>
                  }
                </Col>
              </Row>

              <Row className='publickItemTitle'>
                <Col span="11">
                  服务出口 IP
                  {this.titleStar(networkType)}
                </Col>
                <Col span="11">
                  服务域名配置（可选）
                </Col>
              </Row>

              <Row>
                <Col span="11" className='publicItem'>
                  {
                    editCluster
                      ? <Form.Item>
                      <Input placeholder={ networkType == 'incluster' ? '无需填写' : '可访问服务的内网IP'} {...addressProps} disabled={networkType == 'incluster'}
                      />
                    </Form.Item>
                      : <div className='value'>{data[item.key] && data[item.key].address ? data[item.key].address : ''}</div>
                  }
                </Col>
                <Col span="11" className='publicItem'>
                  {
                    editCluster
                      ? <Form.Item>
                      <Input placeholder={ networkType == 'incluster' ? '无需填写' : '服务访问地址的域名'} {...domainProps} disabled={networkType == 'incluster'}/>
                    </Form.Item>
                      : <div className='value'>{data[item.key] && data[item.key].domain ? data[item.key].domain : ''}</div>
                  }
                </Col>
              </Row>
              {data[item.key] && data[item.key].isDefault?'':
              <Row className='publickItemTitle'>
                <Col span="11">
                  关联空间
                </Col>
              </Row>}
              {data[item.key] && data[item.key].isDefault?"":
                <Row>
                <Col span="24" className='publicItem'>
                  {
                    editCluster
                      ? <Form.Item>
                          <Select {...spaceProps} multiple placeholder="请选择空间" style={{ width: '100%' }}>
                            {teamspaceList}
                          </Select>
                        </Form.Item>
                      : <Collapse style={{background:'#fff'}} >
                          <Panel header="关联的空间列表" key="1">
                            <Table columns={columns} dataSource={data2} style={{background:'#fff'}} pagination={false} size="small" />
                          </Panel>
                        </Collapse>
                  }
                </Col>
              </Row>}
            </div>
          </Col>
        </Row>
      })
    }
    return networkConfigList
  },
  render (){
    const { cluster, form, clusterProxy } = this.props
    const { editCluster, saveBtnLoading, sketchshow } = this.state
    const { getFieldProps, getFieldValue, setFieldsValue } = form
    
    return (
      <Card id="Network" >
        <div className="header">网络配置
          {/* Mr Yao -- 编辑配置 调用 setState 设置state editCluster: true, saveBtnDisabled: false */}
          {!editCluster?
           <Button type="ghost" style={{float:'right',marginTop:'6px'}} onClick={()=> this.setState({editCluster: true, saveBtnDisabled: false})}>
              编辑配置
              </Button>
            :
            <div style={{float:'right'}}>
              <Button
                onClick={()=> this.cancleEdit()}>
                取消
              </Button>
              <Button
                loading={saveBtnLoading}
                disabled={this.state.saveBtnDisabled}
                type="primary" style={{marginLeft:'8px'}}
                onClick={this.updateCluster}>
                保存
              </Button>
            </div>
          }
        </div>
        <Row className='title'>
          <Col span="14">
            服务内网代理
            <Tooltip title='服务内网IP显示在[应用管理-服务地址：内网IP]处，集群内任意节点作为服务的内网出口代理；'>
              <Icon type="question-circle-o" className='qustionIcon'/>
            </Tooltip>
          </Col>
          <Col span="10">
            服务出口
            <Tooltip title='服务出口 IP 显示在『应用管理→服务地址：外网IP』处，服务内网 IP 地址所映射的代理或网关等性质的产品，平台暂无法自动获取，需手动填写，如OpenStack 的浮动 IP、节点绑定的负载均衡器、平台出口高可用的虚拟 IP 等'>
              <Icon type="question-circle-o" className='qustionIcon'/>
            </Tooltip>
            <span className="sketchMap" onClick={()=> this.setState({visible:true})}>查看示意图</span>
            {
              editCluster
              ? <Tooltip title='设置默认网络'>
                <Button icon="setting" className='settingDefalut' onClick={() => this.setState({settingDefalut: true})}/>
              </Tooltip>
              : <Button icon="setting" className='settingDefalut' disabled/>
            }
            {/* 添加网络出口按钮  editCluster 用来设置 是否可点击  */}
            <Button type="primary" className='addPublick' disabled={!editCluster} onClick={this.addPublic}>添加网络出口</Button>
          </Col>
        </Row>

        <Form>
          { this.rendernetworkConfigList(clusterProxy)}
        </Form>



        <Modal wrapClassName="vertical-center-modal" width='75%' title="示意图" footer={<Button type="primary" onClick={()=> this.setState({visible:false})}>知道了</Button>} visible={this.state.visible} onCancel={()=> this.setState({visible:false})}>
          <div className="imgBox">
            <img style={{width:'100%',height:'100%'}} src={sketchImg}/>
          </div>
        </Modal>

         <Modal
           title="设置默认网络出口"
           visible={this.state.settingDefalut}
           closable={true}
           onOk={this.confirmSet}
           onCancel={this.cancelSet}
           width='570px'
           maskClosable={false}
           confirmLoading={this.settingDefalutLoading}
           wrapClassName="settingDefalut"
         >
           <div>
             <div className='alertRow'>设置一个默认的网络出口，当创建服务或数据库与缓存时，默认选择该网络出口作为服务访问方式</div>
           </div>
           <Form.Item
             label="默认网络出口"
             labelCol={{span: 5}}
             wrapperCol={{span: 19}}
           >
             <Select
               style={{width:'180px'}}
               placeholder='选择默认网络出口'
               {...getFieldProps('defaultSetting',{
                 initialValue: this.state.defaultGroup,
                 onChange: this.selectSettingChange
               })}
             >
               { this.selectOption() }
             </Select>
           </Form.Item>
         </Modal>


        <Modal
          title="删除网络出口"
          visible={this.state.deleteDefaultGroup}
          closable={true}
          onOk={() => this.deletePublic(this.state.currentItem, 'confirm')}
          onCancel={() => this.setState({deleteDefaultGroup: false})}
          width='570px'
          maskClosable={false}
          wrapClassName="deleteDefaultGroup"
        >
          <div className='tips'>
            <i className="fa fa-exclamation-triangle warningIcon" aria-hidden="true" style={{top: this.state.currentGroup ? '28px' : '14px' }}></i>
            <div>
            {
              this.state.currentGroup
              ? <span>1、</span>
              : null
            }
              删除该网络出口后，已使用此网络出口的服务将不能通过此网络出口被访问</div>
            {
              this.state.currentGroup
              ? <div>2、此网络出口为默认网络出口，删除后，创建服务或数据库与缓存集群时，将没有默认的网络出口，建议设置其他网络出口作为默认</div>
              : null
            }
          </div>

          <div className='message'>
            <Icon type="question-circle-o questionIcon" />
            是否确定删除 { this.state.currentName } 网络出口?
          </div>
        </Modal>
      </Card>
    )
  } 
})

function mapStateToProps(state, props) {
  const defaultNodeList = {isFetching: false, isEmptyObject: true}
  const defaultProxy = {isFetching: false, isEmptyObject: true}
  const { user } = state
  const { teamspaces } = user
  let allNode = state.cluster_nodes.getAllClusterNodes
  if(!allNode) {
    allNode = defaultNodeList
  }
  let clusterProxy = state.cluster.proxy
  if(!clusterProxy) {
    clusterProxy = defaultProxy
  }
  return {
    nodeList: allNode,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    clusterProxy
  }
}

export default connect(mapStateToProps, {
  getProxy,
  updateProxy,
  getClusterNodeAddr,
  getAllClusterNodes,
  changeClusterIPsAndDomains,
  loadUserTeamspaceList,
  setDefaultGroup
})(Form.create()(NetworkConfiguration))
