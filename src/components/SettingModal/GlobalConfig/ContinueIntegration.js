/**
 * Created by zhangchengzheng on 2017/4/17.
 */
/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Continue Intergration
 *
 * v0.1 - 2017/4/17
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'
import { Row, Col, Icon, Form, Button, Input, Spin, Checkbox, Table, Select, Modal } from 'antd'
import { getAvailableImage, addBaseImage, updateBaseImage, deleteBaseImage } from '../../../actions/cicd_flow'
import { BASE_IMAGE_TYPE } from '../../../constants'
import { ROLE_SYS_ADMIN } from '../../../../constants'
import NotificationHandler from '../../../common/notification_handler'
import './style/ContinueIntegration.less'

const FormItem = Form.Item
const Option = Select.Option

class ContinueIntegration extends Component {
  constructor(props){
    super(props)
    this.TemplateSelect = this.TemplateSelect.bind(this)
    this.TempoalteTable = this.TempoalteTable.bind(this)
    this.data = this.data.bind(this)
    this.handleAddUserDefinedimage = this.handleAddUserDefinedimage.bind(this)
    this.handledeletecolums = this.handledeletecolums.bind(this)
    this.handleEditcolums = this.handleEditcolums.bind(this)
    this.handleCheckcolums = this.handleCheckcolums.bind(this)
    this.handleCanclecolums = this.handleCanclecolums.bind(this)
    this.state = {
      disableArr:[],
      disable:false,
      dataArr:[],
    }
  }
  componentWillMount() {
    const { form } = this.props
    const self = this
    self.setState({
      images: {
        isFetching: false,
        imageList: []
      }
    })
    form.setFieldsValue({number: []})
    this.loadData()
  }
  loadData(needFetching) {
   const { getAvailableImage, form } = this.props
   const self = this
   if(needFetching == undefined) {
     needFetching = true
   }
    getAvailableImage(needFetching, {
      success: {
        func: (res) => {
          const data = self.data(res.data.results)
          const { form } = self.props
          self.setState({
            dataArr: data.arr,
            disableArr: data.disableArr
          })
          form.resetFields()
          if(data.arr.length == 0) {
             form.setFieldsValue({
              number: []
            })
          } else {
            form.setFieldsValue({
              number: data.arr.map((item, index) => index)
            })
          }
        }
      }
    })
  }

  TemplateSelect(){
    // let tempelteselect = arry.map((item,index)=>{
    //   return <Option value={item.categoryId} key={index}>{item.categoryName}</Option>
    // })
    // return tempelteselect
    return BASE_IMAGE_TYPE.map((item, index) => {
      return <Option value={index + 1} key={index}>{item}</Option>
    })
  }

  data(data){
    let arr = []
    let disableArr = []
    data.forEach((item, index) => {
      let itemdisable = {disable : true}
      disableArr.push(itemdisable)
      arr.push(item)
    })
    return {arr, disableArr}
  }
  showDeleteModal(key, index, name) {
    this.setState({
      baseImageModal: true,
      key,
      index,
      currentName: name
    })
  }
  handledeletecolums(key, index){
    if(!key) {
      key = this.state.key
    }
    if(!index) {
      index = this.state.index
    }
    const { form, deleteBaseImage } = this.props
    const { getFieldValue } = form
    const id = getFieldValue(`id${index}`)
    if(!id) return
    const imageName = getFieldValue(`name${index}`)
    const noti = new NotificationHandler()
    const self = this
    noti.spin('删除基础镜像中')
    let successMessage = '删除基础镜像成功'
    let failMessage = '删除基础镜像失败'
    const callback = {
      success: {
        func: () => {
          noti.close()
          noti.success(successMessage)
          self.loadData(false)
          self.setState({
            baseImageModal: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          noti.close()
          self.setState({
            baseImageModal: false
          })
          noti.error(failMessage)
        }
      }
    }
    deleteBaseImage(id, imageName, callback)
  }

  handleEditcolums(key){
    let index = key.substring(0,key.indexOf('.'))
    let disableArr = this.state.disableArr
    disableArr[index].disable = false
    this.setState({
      disableArr
    })
  }

  handleCheckcolums(key, index){
    const { form, addBaseImage, updateBaseImage } = this.props
    const { getFieldValue } = form
    form.validateFields((err, value) => {
      if(err) return
      const name = getFieldValue(`name${index}`)
      const url = getFieldValue(`url${index}`)
      const categoryId = getFieldValue(`categoryId${index}`)
      const id = getFieldValue(`id${index}`)
      const body = {
        "image_name": name,
        "image_url": url,
        "category_id": categoryId,
      }
      const noti = new NotificationHandler()
      const self = this
      let successMessage = ''
      let failMessage = ''
      const callback = {
        success: {
          func: () => {
            noti.close()
            noti.success(successMessage)
            self.loadData(false)
            if(id) {
              form.setFieldsValue({
                [`name${key}`]: name,
                [`url${key}`]: url,
                [`categoryId${key}`]: categoryId,
              })
            }
          },
          isAsync: true
        },
        failed: {
          func: () => {
            noti.close()
            noti.error(failMessage)
          }
        }
      }
      if(id) {
        noti.spin('更新基础镜像中')
        successMessage = '更新基础镜像成功'
        failMessage = '更新基础镜像失败'
        updateBaseImage(id, body, callback)
      } else {
        successMessage = '添加基础镜像成功'
        failMessage = '添加基础镜像失败'
        noti.spin('添加基础镜像中')
        addBaseImage(body, callback)
      }

    })
  }

  handleCanclecolums(key, value, formIndex){
    let index = key.substring(0,key.indexOf('.'))
    const { form } = this.props
    const number = form.getFieldValue('number')
    if(value.isEmpty) {
      if(number.indexOf(formIndex) > 0) {
        number.splice(number.indexOf(formIndex), 1)
        form.setFieldsValue({
          number
        })
      }
      return
    }
    let disableArr = cloneDeep(this.state.disableArr)
    disableArr[index].disable = true
    this.setState({
      disableArr
    })

    number.forEach(key => {
      form.resetFields([`name${key}`, `url${key}`, `categoryId${key}`])
    })
  }

  handleAddUserDefinedimage() {
    let disableArr = cloneDeep(this.state.disableArr)
    disableArr.push({ disable: false })
    this.setState({
      disableArr
    })
    const { form } = this.props
    const number = form.getFieldValue('number')
    if (number.length == 0) {
      form.setFieldsValue({
        number: [0]
      })
    } else {
      number.push(number[number.length - 1] + 1)
      form.setFieldsValue({
        number
      })
    }
  }

  TempoalteTable(data, disable) {
    const { form, user } = this.props
    const number = form.getFieldValue('number')
    if(!number || number.length == 0) {
      return [<div className='nodata'>暂无镜像</div>]
    }
    let tableItem = []
    const { getFieldProps } = form
    number.forEach((index, key) => {
      let value = data[index]
      if (!value) value = {
        isEmpty: true
      }
      if(user.info.role != ROLE_SYS_ADMIN) {
        if(value.isSystem == 1) return
      }
      if(!disable[key]) return
      if (value.categoryId == 101) return
      tableItem.push(<ul key={index} className='tablecolum'>
        <li className='tablecell imageClass'>
          {this.state.disable ?
            [<span>
              <Select
                defaultValue={value.categoryId}
                style={{ width: '100%' }}
                size="large"
                disabled={disable[key].disable}
              >
                {this.TemplateSelect()}
              </Select>
            </span>] :
            [<FormItem className='formitem' key={index + ".1"}>
              <Select {...getFieldProps(`categoryId${index}`, {
                rules: [{
                  required: true, message: "请选择镜像类别"
                }],
                initialValue: value.categoryId
              }) }
                style={{ width: '100%' }}
                size="large"
                disabled={disable[key].disable}
              >
                {this.TemplateSelect()}
              </Select>
            </FormItem>]
          }
        </li>
        <li className='tablecell UserDefinedName'>
          {this.state.disable ?
            <span>
              <Input placeholder={value.imageName} size='large' disabled={disable[key].disable} />
            </span>
            :
            [<FormItem className='formitem' key={index + ".2"}>
              <Input  {...getFieldProps(`name${index}`, {
                rules: [{
                  whitespace: true
                }, {
                  required: true, message: "请填写镜像名称"
                }],
                initialValue: value.imageName
              }) } placeholder={value.imageName} size='large' disabled={disable[key].disable} />
            </FormItem>]
          }
        </li>
        <li className='tablecell UserDefinedAddress'>
          {
            this.state.disable ?
              [<span>
                <Input placeholder={value.imageUrl} size='large' disabled={disable[key].disable} />
              </span>] :
              [<FormItem className='formitem' key={index + ".3"}>
                <Input  {...getFieldProps(`url${index}`, {
                  rules: [{
                    whitespace: true
                  }, {
                    required: true, message: "请填写镜像地址"
                  }],
                  initialValue: value.imageUrl
                }) } placeholder={'仓库组名/镜像名称:tag'} size='large' disabled={disable[key].disable} />
              </FormItem>]
          }
        </li>
        <li className='tablecell handle' key={index + ".4"}>
          {disable[key].disable ?
            <div>
              <Button icon="edit" className='buttonleft edit' type="dashed" onClick={() => this.handleEditcolums((key + ".4.1"))}></Button>
              <Button icon="delete" disabled={value.isAllowDeletion == 1} type="ghost" onClick={() => this.showDeleteModal(key + ".4.2", index, value.imageName)}></Button>
            </div> :
            <div>
              <Button icon="check" className='buttonleft check' type="primary" onClick={() => this.handleCheckcolums(index + ".4.1", index)}></Button>
              <Button icon="cross" type="ghost" onClick={() => this.handleCanclecolums(key + ".4.2", value, index)}></Button>
            </div>
          }
        </li>
        <li className='tablecell handle' key={index + ".5"}>
        <FormItem>
          <Input type="hidden" {...getFieldProps(`id${index}`, {
            initialValue: value.id
          }) } />
        </FormItem>
        </li>
      </ul>)
    })
    return tableItem
  }

  render() {
    const { dataArr } = this.state
    const { images } = this.props
    if(images.isFetching) {
      return <div className='tablefooter'>
                <div onClick={() => this.handleAddUserDefinedimage()} className='handlefooter'><Icon type="plus-circle-o" className='footeradd'/><span className='footerspan'>添加一个自定义镜像</span></div>
              </div>
    }
    return (
      <div id="ContinueIntegration">
        <div className='table'>
          <div className='tableHeader'>
            <div className='tableHeadertd imageClass'>镜像分类</div>
            <div className='tableHeadertd UserDefinedName'>自定义名称</div>
            <div className='tableHeadertd UserDefinedAddress'>自定义镜像地址</div>
            <div className='tableHeadertd handle'>操作</div>
          </div>
          <div className='tablebody'>
            <Form>
              {this.TempoalteTable(this.state.dataArr, this.state.disableArr)}
            </Form>
          </div>
        </div>
        <div className='clearfloat'></div>
        <div className='tablefooter'>
          <div onClick={() => this.handleAddUserDefinedimage()} className='handlefooter'><Icon type="plus-circle-o" className='footeradd'/><span className='footerspan'>添加一个自定义镜像</span></div>
        </div>
        <Modal title="删除基础镜像" visible={this.state.baseImageModal} width={580} okText="确定" cancelText="取消"
            className="alarmModal"
            onCancel={()=> this.setState({baseImageModal:false})}
            maskClosable={false}
            onOk={() => this.handledeletecolums()}
          >
          确认要删除 {this.state.currentName} 基础镜像吗?
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  let images = state.cicd_flow.availableImage
  const user = state.entities.loginUser
  const defaultImages = {
    isFetching: false
  }
  if(!images) {
    images = defaultImages
  }
  return {
    images,
    user
  }
}
export default Form.create()(connect(mapStateToProps, {
  getAvailableImage,
  addBaseImage,
  updateBaseImage,
  deleteBaseImage,
})(ContinueIntegration))