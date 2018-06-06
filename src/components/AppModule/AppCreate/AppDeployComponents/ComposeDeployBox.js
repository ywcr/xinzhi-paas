/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Radio, Icon, Spin, Tooltip, } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import findIndex from 'lodash/findIndex'
import filter from 'lodash/filter'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeDeployBox.less"
import { loadConfigGroup, configGroupName } from '../../../../actions/configs'
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group
let uuid = 1;

let MyComponent = React.createClass({
  getInitialState() {
    return {
      checkAll: [],
      checkedList: [],
      plainOptions: [],
      selectValue: [],
    };
  },
  componentWillReceiveProps(nextProps) {
    const serviceOpen = nextProps.serviceOpen
    if (serviceOpen === this.props.serviceOpen) {
      return
    }
    this.getList(nextProps, serviceOpen)
  },
  getList(nextProps, serviceOpen) {
    const { form } = this.props
    const { getFieldValue, setFieldsValue, getFieldProps } = form
    const volumes = getFieldValue('volumes')
    let volumeMounts = cloneDeep(getFieldValue('volumeMounts'))
    let newVolumeMounts = []
    if(volumeMounts && volumeMounts.length > 0){
      let configMaps = []
      volumes.map(volume => {
        if(volumeMounts.configMap) {
          configMaps = configMaps.concat(volume.configMap.items)
        }
      })
      newVolumeMounts = volumeMounts.map((vol, index) => {
        let _configMap = configMaps[index]
        if (_configMap) {
          _configMap = _configMap.key
        }
        vol.mountPath = vol.mountPath.replace(`/${vol.subPath || _configMap}`, '')
        return vol
      })
      let helpOb = {}
      newVolumeMounts.forEach(vol => {
        helpOb[vol.mountPath] = 1
      })
      volumeMounts = []
      let pro = Object.getOwnPropertyNames(helpOb)
      pro.forEach(item => {
        if(helpOb[item]) {
          volumeMounts.push(filter(newVolumeMounts, vol => {
            return vol.mountPath == item
          })[0])
        }
      })
    }
    if (!serviceOpen) {
      setFieldsValue({
        volKey: []
      })
      if (volumes && volumes.length > 0) {
        const checkedList = []
        const selectValue = []
        const checkAll = []
        const path = []
        let volIndex = 0
        volumes.forEach((volume) => {
          if (!volume.configMap) {
            return
          }
          checkedList.push({
            name: volume.configMap.name,
            items: volume.configMap.items
          })
          selectValue.push(volume.configMap.name)
          getFieldProps(`volPath${volIndex + 1}`, {})
          getFieldProps(`volName${volIndex + 1}`, {})
          volIndex++
        })
      }
    }
    const cluster = nextProps.cluster
    const self = this
    const nextConfigGroup = nextProps.configGroup[cluster]
    if(!nextConfigGroup) {
        this.props.loadConfigGroup(cluster, {
          success:{
            func: () => {
              self.getList(self.props, serviceOpen)
            },
            isAsync: true
          }
        })
        return
    }
    if (volumes && volumes.length > 0) {
      const checkedList = []
      const selectValue = []
      const checkAll = []
      const path = []
      let volIndex = 0
      volumes.forEach((volume) => {
        if (!volume.configMap) {
          return
        }
        let checkedConfig = {
          name: volume.configMap.name,
          items: volume.configMap.items
        }
        if (!checkedConfig.items) {
          nextConfigGroup.configGroup.map(config => {
            if (checkedConfig.name == config.name) {
              checkedConfig.items = config.configs.map(item => {
                return {
                  key: item.name,
                  path: item.name,
                }
              })
            }
          })
        }
        checkedList.push(checkedConfig)
        selectValue.push(volume.configMap.name)
        const mountPath = filter(volumeMounts, ['name', volume.name])[0].mountPath
        getFieldProps(`volPath${volIndex + 1}`, { initialValue: mountPath})
        getFieldProps(`volName${volIndex + 1}`, { initialValue: volume.configMap.name })
        let volCoverValue = 'cover'
        if (volumeMounts[volIndex].subPath) {
          volCoverValue = 'unCover'
        }
        getFieldProps(`volCover${volIndex + 1}`, { initialValue: volCoverValue })
        volIndex++
      })
      let index = 0
      const volKey = []
      volumes.forEach(volume => {
        if (volume.configMap) {
          volKey.push(++index)
        }
      })
      setFieldsValue({
        volKey
      })

      const configGroup = nextProps.configGroup[cluster].configGroup
      checkedList.forEach((item, index) => {
        setFieldsValue({
          [`vol${index + 1}`]: item
        })
        let itemConfig = filter(configGroup, ['name', item.name])[0]
        if (!item.items || itemConfig.configs.length === item.items.length) {
          checkAll[index] = true
        } else {
          checkAll[index] = false
        }
      })
      this.setState({
        checkedList,
        checkAll,
        selectValue,
        plainOptions: [],
      })
    }
  },
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    this.getList(this.props, true)
    this.props.loadConfigGroup(this.props.cluster)
  },
  remove(k) {
    const { form } = this.props.parentScope.props;
    // can use data-binding to get
    let volKey = form.getFieldValue('volKey');
    volKey = volKey.filter((key) => {
      return key !== k;
    });
    if (volKey.length <= 0) {
      form.setFieldsValue({
        config: false
      });
    }
    // can use data-binding to set
    form.setFieldsValue({
      volKey,
    });
  },
  add() {
    uuid++;
    const { form } = this.props.parentScope.props;
    // can use data-binding to get
    let volKey = form.getFieldValue('volKey');
    volKey = volKey.concat(uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      volKey,
      config: true
    });
  },
  getOptionsList() {
    const cluster = this.props.cluster
    const { isFetching } = this.props.configGroup[cluster]
    if (isFetching) {
      return <Option></Option>
    }
    const configGroup = this.props.configGroup[cluster].configGroup
    const plainOptions = this.state.plainOptions
    if (!configGroup || configGroup.length <= 0) {
      return <Option></Option>
    }
    return configGroup.map((item, index) => {
      plainOptions[index] = {}
      plainOptions[index].name = item.name
      plainOptions[index].path = []
      plainOptions[index].key = []
      item.configs.forEach(config => {
        plainOptions[index].key.push(config.rawName)
        plainOptions[index].path.push(config.name)
      })
      if (!item.configs || item.configs.length < 1) {
        item.disabled = true
        item.title = '未包含任何配置文件'
      }
      return (<Option value={item.name} title={item.title} disabled={item.disabled}>{item.name}</Option>)
    })
  },
  onChange(checkedList, index) {
    const { form } = this.props
    const { getFieldProps, setFieldsValue } = form
    const oldCheckedList = this.state.checkedList
    if (!checkedList || checkedList.length <= 0) {
      const checkAll = this.state.checkAll
      checkAll[index] = false
      oldCheckedList[index].items = []
      this.setState({
        checkedList: oldCheckedList,
        checkAll
      })
      setFieldsValue({
        [`vol${index + 1}`]: []
      })
      return
    }
    const configName = oldCheckedList[index].name
    const plainOptions = this.state.plainOptions
    let plIndex = findIndex(plainOptions, pl => {
      return pl.name === configName
    })
    const pl = plainOptions[plIndex]
    const nameArray = []
    const paths = pl.path
    const checkAll = this.state.checkAll
    if (checkedList.length === paths.length) {
      checkAll[index] = true
      this.setState({
        checkAll
      })
    } else {
      checkAll[index] = false
      this.setState({
        checkAll
      })
    }
    checkedList.forEach(item => {
      let index = findIndex(paths, key => {
        return key === item
      })
      nameArray.push(pl.key[index])
    })
    oldCheckedList[index] = {
      name: pl.name,
      items: checkedList.map((item, index) => {
        return {
          key: nameArray[index],
          path: checkedList[index]
        }
      })
    }
    setFieldsValue({
      [`vol${index + 1}`]: oldCheckedList[index]
    })
    this.setState({
      checkedList: oldCheckedList
    })
  },
  onCheckAllChange(e, k) {
    const cluster = this.props.cluster
    const checkAll = this.state.checkAll
    checkAll[k - 1] = e.target.checked
    this.setState({
      checkAll
    })
    const { form } = this.props
    const { getFieldProps, setFieldsValue } = form
    const configName = getFieldProps(`volName${k}`)
    let oldCheckedList = this.state.checkedList
    if (!e.target.checked) {
      setFieldsValue({
        [`vol${k}`]: []
      })
      oldCheckedList[k - 1].items = []
      this.setState({
        checkedList: oldCheckedList,
      })
      return
    }
    let configList = this.props.configGroup[cluster].configGroup
    let index = findIndex(configList, c => {
      return c.name === configName.value
    })
    const config = configList[index]
    if (!config) {
      return
    }
    let newConfig = {
      name: config.name,
      items: config.configs.map(item => {
        return {
          path: item.name,
          key: item.rawName
        }
      })
    }
    oldCheckedList[k - 1] = newConfig
    this.setState({
      checkedList: oldCheckedList,
    })
    setFieldsValue({
      [`vol${k}`]: newConfig
    })
  },
  selectChange(name, index) {
    const { form } = this.props
    const { setFieldsValue, getFieldValue } = form
    setFieldsValue({
      [`volName${index + 1}`]: name
    })
    const { checkAll, checkedList } = this.state
    const isCover = getFieldValue(`volCover${index + 1}`)
    checkedList[index] = {
      name: name,
      items: []
    }
    if (isCover === 'cover') {
      checkAll[index] = true
      this.onCheckAllChange({ target: { checked: true } }, index + 1)
    } else {
      checkAll[index] = false
    }
    const selectValue = this.state.selectValue
    selectValue[index] = name
    this.setState({
      selectValue,
      checkAll,
      checkedList,
    })
  },
  getPlainOptions(index) {
    const { form } = this.props
    const { getFieldValue} = form
    const { checkedList, plainOptions } = this.state
    const configName = checkedList[index].name
    let plIndex = findIndex(plainOptions, pl => {
      return pl.name === configName
    })
    let opts = plainOptions[plIndex].path
    const isCover = getFieldValue(`volCover${index + 1}`)
    if (isCover === 'cover') {
      opts = opts.map(opt => {
        return {
          label: opt,
          value: opt,
          disabled: true,
        }
      })
    }
    return opts
  },
  getInitValue(k) {
    const { form } = this.props
    const { getFieldProps, setFieldsValue } = form
    const configName = getFieldProps(`volName${k}`).value
    if (!configName) return ''
    let index = findIndex(this.state.checkedList, item => {
      return item.name === configName
    })
    if (index <= 0) return ''
    setFieldsValue({
      [`volitem${k}`]: this.state.checkedList[index].items
    })
  },
  getCheckboxValue(index) {
    const checkList = this.state.checkedList[index]
    if (!checkList.items) {
      return
    }
    return checkList.items.map(item => {
      return item.path
    })
  },
  inputChange(e, index) {
    const { form } = this.props
    const { getFieldProps, getFieldValue, setFieldsValue} = form
    setFieldsValue({[`volPath${index}`]: e.target.value})
  },
  onCoverChange(index, e) {
    const { form } = this.props
    const { setFieldsValue} = form
    const value = e.target.value
    setFieldsValue({[`volCover${index}`]: value})
    if (value === 'cover') {
      this.onCheckAllChange({ target: { checked: true } }, index)
    }
  },
  render() {
    const cluster = this.props.cluster
    if (!this.props.configGroup[cluster]) return <div></div>
    const isFetching = this.props.configGroup[cluster].isFetching
    if (isFetching) {
      return (<div className='loadingBox'>
        <Spin size='large' />
      </div>)
    }
    const { form } = this.props
    const { getFieldProps, getFieldValue, } = form
    const volKey = getFieldProps('volKey').value
    if (!volKey) {
      getFieldProps('volKey', {
        initialValue: [1],
      });
    }
    const formItems = getFieldValue('volKey').map((k) => {
      const inputValue = getFieldProps(`volPath${k}`).value
      let coverValue = getFieldProps(`volCover${k}`).value
      if (!coverValue) {
        getFieldProps(`volCover${k}`, {
          initialValue: 'cover',
        });
      }
      if (!coverValue) {
        coverValue = 'unCover'
      }
      return (
        <div key={`vol${k}`} id={`vol${k}`}>
          <FormItem >
            <li className="composeDetail">
              <div className="input">
                <Input className="portUrl" size="large" placeholder="挂载目录，例如：/App" type="text" value={inputValue} onChange={(e) => this.inputChange(e, k)}/>
              </div>
              <div className="inputCover">
                <RadioGroup onChange={this.onCoverChange.bind(this, k)} value={coverValue}>
                  <Radio key="unCover" value="unCover">
                    挂载若干配置文件&nbsp;
                    <Tooltip width="200px" title="镜像内该目录『同名文件』会给覆盖，修改配置文件需『重启容器』来生效">
                      <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                    </Tooltip>
                  </Radio>
                  <Radio key="cover" value="cover">
                    挂载整个配置组&nbsp;
                    <Tooltip width="200px" title="镜像内该目录『所有文件』会被覆盖，支持『不重启容器』5 min 左右生效（含增、删、改配置文件）。">
                      <Icon type="question-circle-o" style={{ cursor: 'pointer' }}/>
                    </Tooltip>
                  </Radio>
                </RadioGroup>
              </div>
              <div className="protocol select">
                <div className="portGroupForm">
                  <Select
                    placeholder="请选择配置组"
                    value={this.state.selectValue[k - 1]}
                    className="composeGroup" size="large" onChange={(value) => this.selectChange(value, k - 1)}>
                    {this.getOptionsList()}
                  </Select>
                </div>
              </div>
              <div className="check">
                {
                  getFieldProps(`volName${k}`).value
                  ? (
                    <span>
                      <Checkbox
                        disabled={coverValue === 'cover'}
                        checked={this.state.checkAll[k - 1]}
                        onChange={(e) => this.onCheckAllChange(e, k)}
                      >
                        全选
                      </Checkbox>
                      <br />
                      <CheckboxGroup
                        options={this.getPlainOptions(k - 1)}
                        onChange={(list) => this.onChange(list, k - 1)}
                        value={this.getCheckboxValue(k - 1)}
                      />
                    </span>
                   )
                  : <span>请先选择配置组</span>
                }
              </div>
              <div className="opera">
                <i className="fa fa-trash-o" onClick={() => this.remove(k)} />
              </div>
              <div style={{ clear: "both" }}></div>
            </li>
          </FormItem>
        </div>
      )
    });
    return (
      <div>
        <ul>
          {formItems}
        </ul>
        <div className="addBtn" onClick={this.add}>
          <Icon type="plus-circle-o" />
          <span>添加</span>
        </div>
      </div>
    );
  }
});

function mapStateToProp(state) {
  const { cluster } = state.entities.current
  return {
    cluster: cluster.clusterID,
    configGroup: state.configReducers.configGroupList
  }
}

MyComponent = connect(mapStateToProp, {
  loadConfigGroup
})(MyComponent)

let ComposeDeployBox = React.createClass({
  render: function () {
    const { form } = this.props
    const parentScope = this.props.scope;
    return (
      <div id="ComposeDeployBox">
        <div className="composeBox">
          <span className="title">配置目录</span>
          <br/>
          <div className="composeList">
            <div className="composeTitle">
              <div className="composeCommonTitle">
                <span>挂载目录</span>
              </div>
              <div className="composeCommonTitle">
                <span>覆盖方式</span>
              </div>
              <div className="composeCommonTitle">
                <span>配置组</span>
              </div>
              <div className="composeCommonTitle">
                <span>配置文件</span>
              </div>
              <div className="composeCommonTitle">
                <span>操作</span>
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent parentScope={parentScope} form={form} serviceOpen={this.props.serviceOpen} />
          </div>
        </div>
      </div>
    )
  }
})

export default ComposeDeployBox


