/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Docker file modal editor
 * v0.1 - 2017-07-03
 * @author Zhangpc
 */

import React from 'react'
import { connect } from 'react-redux'
import { Modal, Form, Button, Radio, Select, Input, Alert, Row, Col, Icon } from 'antd'
import classNames from 'classnames'
import { parse } from 'docker-file-parser'
import DockerFileEditor from '../../Editor/DockerFile'
import { URL_REG_EXP } from '../../../constants'
import FROM from './FROM'
import './style/index.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option
const ButtonGroup = Button.Group
const FORM_ITEM_LAYOUT = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
}
let uid = 0
const DOCKERFILE_GRAMMAR_BTNS = {
  ADD: {
    label: '添加文件(ADD)',
    key: 'ADD',
  },
  RUN: {
    label: '运行指令(RUN)',
    key: 'RUN',
  },
  CMD: {
    label: '启动命令(CMD)',
    key: 'CMD',
  }
}
const BTN = 'BTN'
const ADD = 'ADD'
const RUN = 'RUN'
const CMD = 'CMD'

let DockerfileModal = React.createClass({
  getInitialState() {
    this.addFileTypes = [{
      label: '上一步共享目录',
      placeholder: '输入上一步产生文件名',
      key: 'lastShareDir',
    }, {
      label: '远程 HTTP 地址',
      key: 'httpAddress',
      placeholder: '输入远程文件获取地址',
    }, {
      label: '选择部署包',
      placeholder: '请选择部署包',
      key: 'wrap',
      disabled: true,
    }]
    this.uuid = {
      [ADD]: {},
      [RUN]: {},
    }
    this.initialize = false
    return {
      editMode: 'visualEditing',
      addKeys: {},
      runKeys: {},
      grammarModules: [ BTN ],
      FROMData: {},
      dockerfile: '',
      server:'',
    }
  },

  componentWillMount() {
    //
  },

  componentWillReceiveProps(nextProps) {
    const { defaultValue, id } = nextProps
    const _id = this.props.id
    if (id && _id && id !== _id) {
      this.initialize = false
    }
    if (!this.initialize && defaultValue) {
      this.init(nextProps)
    }
  },

  init(nextProps) {
    const { defaultValue, form, loginUser } = nextProps || this.props
    if (!defaultValue || typeof defaultValue !== 'string') {
      return
    }
    let dkfArray = parse(defaultValue)
    if (dkfArray.length === 0) {
      return
    }
    const regServer = loginUser.registryConfig.server || ''
    this.uuid = {
      [ADD]: {},
      [RUN]: {},
    }
    const { FROMData } = this.state
    const { setFieldsValue } = form
    // set FROM
    const FROMObj = dkfArray[0]
    let from = FROMObj.args
    const FROMArgs = from.split(':')
    const tag = FROMArgs[FROMArgs.length - 1]
    from = from.replace(`:${tag}`, '')
    const fromArray = from.split('/')
    let harborProject = fromArray[fromArray.length - 2]
    const image = fromArray[fromArray.length - 1]
    const server = FROMObj.args.replace(`/${harborProject}/${image}:${tag}`, '')
    let imageUrl
    if (regServer.indexOf(server) < 0) {
      imageUrl = FROMObj.args
      harborProject = 'imageUrl'
    }
    this.setState({
      FROMData: Object.assign({}, FormData, { server }),
    })
    const configs = {
      harborProject,
    }
    if (imageUrl) {
      configs.imageUrl = imageUrl
    } else {
      configs.image = image
      configs.tag = tag
    }
    setFieldsValue(configs)
    this.initialize = true
    // set ADD RUN
    const visualArray = []
    let beforeName
    let typeIndex = 0
    dkfArray.map(({ name, args }) => {
      if (name === 'FROM') {
        return
      }
      if (!beforeName || name !== beforeName) {
        visualArray.length > 0 && typeIndex++
        visualArray[typeIndex] = [ { name, args } ]
        beforeName = name
        return
      }
      visualArray[typeIndex].push({ name, args })
      beforeName = name
    })
    let currentAddModuleIndex = 0
    let currentRunModuleIndex = 0
    let btnsArray = []
    const addKeys = {}
    const runKeys = {}
    const grammarModules = [ BTN ]
    visualArray.map(modules => {
      if (modules[0].name === ADD) {
        btnsArray = btnsArray.concat([ ADD, BTN ])
        currentAddModuleIndex ++
        addKeys[currentAddModuleIndex] = []
        this.uuid[ADD][currentAddModuleIndex] = 0
        modules.map((_module, _index) => {
          addKeys[currentAddModuleIndex].push(_index)
          this.uuid[ADD][currentAddModuleIndex]++
          const addFileType = /^(http|https):/.test(_module.args[0])
                              ? 'httpAddress'
                              : 'lastShareDir'
          const addFields = {
            [`addFileType-${currentAddModuleIndex}`]: addFileType,
            [`target-${currentAddModuleIndex}-${_index}`]: _module.args[1],
          }
          if (addFileType === 'httpAddress') {
            addFields[`src-http-${currentAddModuleIndex}-${_index}`] = _module.args[0]
          } else {
            addFields[`src-${currentAddModuleIndex}-${_index}`] = _module.args[0]
          }
          setFieldsValue(addFields)
        })
      } else if (modules[0].name === RUN) {
        btnsArray = btnsArray.concat([ RUN, BTN ])
        currentRunModuleIndex ++
        runKeys[currentRunModuleIndex] = []
        this.uuid[RUN][currentRunModuleIndex] = 0
        modules.map((_module, _index) => {
          runKeys[currentRunModuleIndex].push(_index)
          this.uuid[RUN][currentRunModuleIndex]++
          setFieldsValue({
            [`run-${currentRunModuleIndex}-${_index}`]: _module.args,
          })
        })
      } else if (modules[0].name === CMD) {
        btnsArray = btnsArray.concat([ CMD, BTN ])
        setFieldsValue({
          cmd: modules[0].args,
        })
      }
      this.setState({ addKeys, runKeys }, () => {
        this.setState({
          grammarModules: grammarModules.concat(btnsArray),
          addKeys,
          runKeys,
        })
      })
    })
  },

  renderGrammarModule(type, index) {
    const { grammarModules } = this.state
    let currentModuleIndex = 0
    grammarModules.every((_module, _index) => {
      if (_module === type) {
        currentModuleIndex ++
      }
      if (index === _index) {
        return false
      }
      return true
    })
    switch (type) {
      case BTN:
        return this.renderGrammarBtnsModule(index, currentModuleIndex)
      case ADD:
        return this.renderGrammarAddModule(index, currentModuleIndex)
      case RUN:
        return this.renderGrammarRunModule(index, currentModuleIndex)
      case CMD:
        return this.renderGrammarCmdModule(index, currentModuleIndex)
      default:
        return
    }
  },

  addGrammarModule(index, btnKey) {
    const { form } = this.props
    const { getFieldValue, setFieldsValue, resetFields } = form
    const { grammarModules, addKeys, runKeys } = this.state
    index ++
    grammarModules.splice(index, 0, btnKey, BTN)
    let currentAddModuleIndex = 0
    let currentRunModuleIndex = 0
    grammarModules.map((_module, _index) => {
      if (_module === ADD) {
        currentAddModuleIndex ++
        const currentAddKeys = addKeys[currentAddModuleIndex]
        if (_index > index && btnKey === ADD) {
          addKeys[currentAddModuleIndex] = addKeys[currentAddModuleIndex - 1]
          this.uuid[ADD][currentAddModuleIndex] = this.uuid[ADD][currentAddModuleIndex - 1]
          addKeys[currentAddModuleIndex - 1] = [ 0 ]
          this.uuid[ADD][currentAddModuleIndex - 1] = 0
        } else if (!addKeys[currentAddModuleIndex]) {
          addKeys[currentAddModuleIndex] = [ 0 ]
          this.uuid[ADD][currentAddModuleIndex] = 0
        }
      }
      if (_module === RUN) {
        currentRunModuleIndex ++
        if (_index > index && btnKey === RUN) {
          runKeys[currentRunModuleIndex] = runKeys[currentRunModuleIndex - 1]
          this.uuid[RUN][currentRunModuleIndex] = this.uuid[RUN][currentRunModuleIndex - 1]
          runKeys[currentRunModuleIndex - 1] = [ 0 ]
          this.uuid[RUN][currentRunModuleIndex - 1] = 0
          runKeys[currentRunModuleIndex].map(key => {
            let run = getFieldValue(`run-${currentRunModuleIndex - 1}-${key}`)
            setFieldsValue({
              [`run-${currentRunModuleIndex}-${key}`]: run,
            })
            resetFields([ `run-${currentRunModuleIndex - 1}-${key}` ])
          })
        } else if (!runKeys[currentRunModuleIndex]) {
          runKeys[currentRunModuleIndex] = [ 0 ]
          this.uuid[RUN][currentRunModuleIndex] = 0
        }
      }
    })
    this.setState({ addKeys, runKeys }, () => {
      this.setState({
        grammarModules,
      })
    })
  },

  getBtns(index) {
    const { grammarModules } = this.state
    const before = grammarModules[index - 1]
    const after = grammarModules[index + 1]
    const isHaveADD = grammarModules.indexOf(ADD) > -1
    if (!before && !after) {
      return [ ADD, RUN, CMD ]
    }
    if (!before) {
      if (after === ADD) {
        return [ RUN ]
      }
      if (after === RUN) {
        if (isHaveADD) {
          return []
        }
        return [ ADD ]
      }
      if (after === CMD) {
        return [ ADD, RUN ]
      }
      return []
    }
    if (!after) {
      if (before === ADD) {
        return [ RUN, CMD ]
      }
      if (before === CMD) {
        return []
      }
      return [ CMD ]
    }
    if ((before === ADD && after === RUN) || (before === RUN && after === ADD)) {
      return []
    }
    if (before === ADD && after === CMD) {
      return [ RUN ]
    }
    if (before === RUN && after === CMD) {
      if (isHaveADD) {
        return []
      }
      return [ ADD ]
    }
    return []
  },

  renderGrammarBtnsModule(index) {
    const { grammarModules } = this.state
    let btnsArray = this.getBtns(index)
    if (btnsArray.length === 0) {
      return <hr className="module-hr"/>
    }
    return (
      <div className="dockerfileGrammar" key={`grammar-btns-module-${index}`}>
        <ButtonGroup style={{width: '100%'}}>
          {
            btnsArray.map(btn => (
              <Button
                icon="plus"
                type="ghost"
                onClick={this.addGrammarModule.bind(this, index, btn)}
                style={{width: `${Math.floor(1 / btnsArray.length * 10000) / 100}%`}}
              >
                {DOCKERFILE_GRAMMAR_BTNS[btn].label}
              </Button>
            ))
          }
        </ButtonGroup>
      </div>
    )
  },

  renderGrammarAddModule(index, currentModuleIndex) {
    const { addKeys } = this.state
    const { form } = this.props
    const addFileTypeProps = form.getFieldProps(`addFileType-${currentModuleIndex}`, {
      initialValue: 'lastShareDir',
    })
    return (
      <div key={`grammar-add-${currentModuleIndex}`}>
        <FormItem
          {...FORM_ITEM_LAYOUT}
          label="添加文件(ADD)"
        >
          <RadioGroup {...addFileTypeProps}>
            {
              this.addFileTypes.map(type => (
                <Radio value={type.key} disabled={type.disabled}>{type.label}</Radio>
              ))
            }
          </RadioGroup>
        </FormItem>
        {addKeys[currentModuleIndex].map(this.renderAddKey.bind(this, index, currentModuleIndex))}
        <Row className="addKeyBtn">
          <Col span={FORM_ITEM_LAYOUT.labelCol.span}></Col>
          <Col span={FORM_ITEM_LAYOUT.wrapperCol.span}>
            <a href="javascript:void(0)" onClick={this.addAddKeys.bind(this, index, currentModuleIndex)}>
              <Icon type="plus-circle-o" /> 继续添加文件
            </a>
          </Col>
        </Row>
      </div>
    )
  },

  renderGrammarRunModule(index, currentModuleIndex) {
    const { runKeys } = this.state
    return (
      <Row key={`grammar-run-${currentModuleIndex}`}>
        <Col span={FORM_ITEM_LAYOUT.labelCol.span}>运行指令(RUN)</Col>
        <Col span={FORM_ITEM_LAYOUT.wrapperCol.span}>
          {runKeys[currentModuleIndex].map(this.renderRunKey.bind(this, index, currentModuleIndex))}
          <div className="addKeyBtn">
            <a href="javascript:void(0)" onClick={this.addRunKeys.bind(this, index, currentModuleIndex)}>
              <Icon type="plus-circle-o" /> 继续添加运行指令
            </a>
          </div>
        </Col>
      </Row>
    )
  },

  renderGrammarCmdModule(key) {
    const { form } = this.props
    const { getFieldProps } = form
    const cmdProps = getFieldProps('cmd')
    return (
      <FormItem
        {...FORM_ITEM_LAYOUT}
        label="启动命令(CMD)"
      >
        <Input {...cmdProps} placeholder="请填写启动命令(CMD)" />
      </FormItem>
    )
  },

  renderRunKey(moduleIndex, currentModuleIndex, key) {
    const { form } = this.props
    const { getFieldProps } = form
    const runProps = getFieldProps(`run-${currentModuleIndex}-${key}`)
    return (
      <Row gutter={16} key={`run-row-${key}`}>
        <Col span={16}>
          <FormItem>
            <Input {...runProps} type="textarea" autosize placeholder="请填写运行指令(RUN)" />
          </FormItem>
        </Col>
        <Col span={2} className="deleteKeyBtn">
          <Button
            type="dashed"
            size="small"
            onClick={this.removeRunKeys.bind(this, currentModuleIndex, key)}
          >
            <Icon type="delete" />
          </Button>
        </Col>
      </Row>
    )
  },

  addRunKeys(moduleIndex, currentModuleIndex) {
    const { runKeys } = this.state
    this.uuid[RUN][currentModuleIndex] ++
    runKeys[currentModuleIndex] = runKeys[currentModuleIndex].concat([ this.uuid[RUN][currentModuleIndex] ])
    this.setState({
      runKeys,
    })
  },

  removeRunKeys(currentModuleIndex, key) {
    const { runKeys } = this.state
    runKeys[currentModuleIndex] = runKeys[currentModuleIndex].filter(_key => _key !== key)
    this.setState({
      runKeys,
    })
  },

   checkHttpAddress(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    if (!URL_REG_EXP.test(value)) {
      return callback('请输入合法的远程文件获取地址')
    }
    callback()
  },

  renderAddKey(moduleIndex, currentModuleIndex, key) {
    const { form } = this.props
    const { FROMData } = this.state
    const mountPath = FROMData.mountPath || []
    const { getFieldProps, getFieldValue } = form
    const addFileType = getFieldValue(`addFileType-${currentModuleIndex}`)
    const srcKey = `src-${currentModuleIndex}-${key}`
    const srcHttpKey = `src-http-${currentModuleIndex}-${key}`
    let srcProps
    let srcHttpProps
    if (addFileType === 'httpAddress') {
      srcHttpProps = getFieldProps(srcHttpKey, {
        rules: [
          { validator: this.checkHttpAddress },
        ],
      })
    } else {
      srcProps = getFieldProps(srcKey)
    }
    const targetProps = getFieldProps(`target-${currentModuleIndex}-${key}`)
    let srcPlaceholder
    this.addFileTypes.every(addType => {
      if (addType.key === addFileType) {
        srcPlaceholder = addType.placeholder
        return false
      }
      return true
    })
    return (
      <Row gutter={16} key={`add-row-${key}`}>
        <Col span={FORM_ITEM_LAYOUT.labelCol.span}></Col>
        <Col span={9}>
        {
          srcProps && (
            <FormItem>
              <Input {...srcProps} placeholder={srcPlaceholder} />
            </FormItem>
          )
        }
        {
          srcHttpProps && (
            <FormItem>
              <Input {...srcHttpProps} placeholder={srcPlaceholder} />
            </FormItem>
          )
        }
        </Col>
        <Col span={7}>
          <FormItem>
            <Select
              {...targetProps}
              combobox
              dropdownMatchSelectWidth={false}
              placeholder="请选择或填写目标目录"
            >
            {
              mountPath.map(path => (
                <Option key={path}>{path}</Option>
              ))
            }
            </Select>
          </FormItem>
        </Col>
        <Col span={2} className="deleteKeyBtn">
          <Button
            type="dashed"
            size="small"
            onClick={this.removeAddKeys.bind(this, currentModuleIndex, key)}
          >
            <Icon type="delete" />
          </Button>
        </Col>
      </Row>
    )
  },

  addAddKeys(moduleIndex, currentModuleIndex) {
    const { addKeys } = this.state
    this.uuid[ADD][currentModuleIndex] ++
    addKeys[currentModuleIndex] = addKeys[currentModuleIndex].concat([ this.uuid[ADD][currentModuleIndex] ])
    this.setState({
      addKeys,
    })
  },

  removeAddKeys(currentModuleIndex, key) {
    const { addKeys } = this.state
    addKeys[currentModuleIndex] = addKeys[currentModuleIndex].filter(_key => _key !== key)
    this.setState({
      addKeys,
    })
  },

  json2Dockerfile(isSaveBtn) {
    const { form, onChange } = this.props
    const { grammarModules, addKeys, runKeys, FROMData } = this.state
    const { getFieldValue, getFieldsValue } = form
    const dkfArray = []
    const { harborProject, image, tag, imageUrl } = getFieldsValue([ 'harborProject', 'image', 'tag', 'imageUrl' ])
    dkfArray.push({
      name: 'FROM',
      args: harborProject === 'imageUrl'
            ? imageUrl
            : `${FROMData.server}/${harborProject}/${image}:${tag}`// @Todo need harbor host
    })
    let currentAddModuleIndex = 0
    let currentRunModuleIndex = 0
    grammarModules.map((_module, index) => {
      if (_module === BTN) {
        return
      } else if (_module === ADD) {
        currentAddModuleIndex ++
        const keys = addKeys[currentAddModuleIndex]
        keys.map(key => {
          const addFileTypeKey = `addFileType-${currentAddModuleIndex}`
          const srcKey = `src-${currentAddModuleIndex}-${key}`
          const srcHttpKey = `src-http-${currentAddModuleIndex}-${key}`
          const targetKey = `target-${currentAddModuleIndex}-${key}`
          const src = getFieldValue(addFileTypeKey) === 'httpAddress'
                      ? getFieldValue(srcHttpKey)
                      : getFieldValue(srcKey)
          const target = getFieldValue(targetKey)
          if (src && target) {
            dkfArray.push({
              name: ADD,
              args: [ src, target ],
            })
          }
        })
      } else if (_module === RUN) {
        currentRunModuleIndex ++
        const keys = runKeys[currentRunModuleIndex]
        keys.map(key => {
          const runKey = `run-${currentRunModuleIndex}-${key}`
          const run = getFieldValue(runKey)
          run && dkfArray.push({
            name: RUN,
            args: run,
          })
        })
      } else if (_module === CMD) {
        const cmd = getFieldValue('cmd')
        cmd && dkfArray.push({
          name: CMD,
          args: cmd,
        })
      }
    })
    let dockerfile = dkfArray.map(({ name, args }) => `${name} ${typeof args === 'string' ? args : args.join(' ')}`)
    dockerfile = dockerfile.join('\n')
    this.setState({ dockerfile })
    onChange(dockerfile, isSaveBtn)
  },

  changeEditMode() {
    const { editMode } = this.state
    if (editMode === 'textEditing') {
      this.setState({
        editMode: 'visualEditing',
      })
      return
    }
    const { form } = this.props
    const { validateFieldsAndScroll } = form
    validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return
      }
      this.json2Dockerfile()
      this.setState({
        editMode: 'textEditing',
      })
    })
  },

  getFROMData(data) {
    const { FROMData } = this.state
    this.setState({
      FROMData: Object.assign({}, FROMData, data),
    })
  },

  onSaveClick() {
    const { onCancel, form } = this.props
    const { dockerfile } = this.state
    form.validateFieldsAndScroll((errors, values) => {
      if (!!errors) {
        return
      }
      this.json2Dockerfile(true)
    })
  },

  render() {
    const { form } = this.props
    const { editMode, grammarModules, dockerfile } = this.state
    const visualEditing = classNames({
      hide: editMode !== 'visualEditing',
    })
    const textEditing = classNames({
      hide: editMode !== 'textEditing',
    })
    return (
      <Modal
        className='cloudDockerFileModal'
        title="云端 Dockerfile"
        {...this.props}
        maskClosable={false}
        okText="保存并使用"
        footer={[
          (
            editMode === 'visualEditing'
            ? <Button className="floatLeftBtn" key="goToDockerfile" type="ghost" size="large" onClick={this.changeEditMode}>查看 Dockerfile</Button>
            : <Button className="floatLeftBtn" key="goBack" type="ghost" size="large" onClick={this.changeEditMode}>返 回</Button>
          ),
          <Button key="back" type="ghost" size="large" onClick={this.props.onCancel}>取 消</Button>,
          <Button key="submit" type="primary" size="large"  onClick={this.onSaveClick}>
            保存并使用
          </Button>,
        ]}
      >
        <Form horizontal>
          <div className={visualEditing}>
            <FROM
              form={form}
              formItemLayout={FORM_ITEM_LAYOUT}
              callback={this.getFROMData}
            />
            {
              grammarModules.map(this.renderGrammarModule)
            }
          </div>
          <div className={textEditing}>
            <DockerFileEditor value={dockerfile || ''}/>
          </div>
        </Form>
      </Modal>
    )
  }
})

DockerfileModal = Form.create()(DockerfileModal)

function mapStateToProps(state) {
  return {
    loginUser: state.entities.loginUser.info,
  }
}

export default connect(mapStateToProps, {
  //
})(DockerfileModal)