/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster Label Manage component
 *
 * v0.1 - 2017-5-3
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Button, Icon, Input, Table, Modal, Form,Tooltip } from 'antd'
import './style/clusterLabelManege.less'
import { getClusterLabel, addLabels, editLabels,searchLabels } from '../../actions/cluster_node'
import { connect } from 'react-redux'
import { calcuDate } from '../../common/tools'
import { KubernetesValidator } from '../../common/naming_validation'
import cloneDeep from 'lodash/cloneDeep'
import NotificationHandler from '../../common/notification_handler'

const FormItem = Form.Item
let uuid = 0

function range(begin, end) {
  const count = end - begin
  return Array.apply(null, Array(count)).map((_, index) => index + begin)
}

class ClusterLabelManage extends Component{
  constructor(props){
    super(props)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.handleEditCancelModal = this.handleEditCancelModal.bind(this)
    this.handleEditOkModal = this.handleEditOkModal.bind(this)
    this.handleEditButton = this.handleEditButton.bind(this)
    this.handleDeleteButton = this.handleDeleteButton.bind(this)
    this.handleDelteOkModal = this.handleDelteOkModal.bind(this)
    this.handleDelteCancelModal = this.handleDelteCancelModal.bind(this)
    this.checkValue = this.checkValue.bind(this)
    this.state = {
      editVisible : false,
      deleteVisible : false,
      targets:{}
    }
  }
  loadData(that) {
    const { clusterID } = that.props
    that.props.getClusterLabel(clusterID)
  }
  // componentWillMount(){
  //   this.loadData(this)
  // }
  handleSearchInput(){
    const { clusterID } = this.props
    const searchItem = this.refs.titleInput.refs.input.value
    this.props.searchLabels(searchItem,clusterID)
  }

  handleEditCancelModal(){
    this.setState({
      editVisible : false,
      targets:{}
    })
    setTimeout(()=> {
      this.props.form.resetFields()
      uuid = 0
    },500)
  }

  handleEditButton(row){
    this.setState({
      editVisible: true,
      create: false,
      targets: row
    })
  }

  handleDeleteButton(id){
    this.setState({
      deleteVisible : true,
      deleteLabelNum : id
    })
  }

  handleDelteCancelModal(){
    this.setState({
      deleteVisible : false,
      deleteLabelNum : '',
    })
  }

  handleDelteOkModal(){
    const { deleteLabelNum } = this.state
    const notificat = new NotificationHandler()
    const _this = this
    const body = {
      id:deleteLabelNum,
      cluster:this.props.clusterID
    }
    this.props.editLabels(body,'DELETE',{
      success:{
        func: () => {
          notificat.success('删除标签成功！')
        }
      },
      failed: {
        func: (ret) => {
          notificat.error('删除标签失败！',ret.message.message || ret.message)
        }
      }
    })
    this.setState({
      deleteVisible : false,
    })
  }
  removeRow(k) {
  const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('keys');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      keys,
    });
  }
  addRow() {
    const { form } = this.props;
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      ++uuid
      let keys = form.getFieldValue('keys')
      keys = keys.concat(uuid)
      form.setFieldsValue({
        keys
      });
      setTimeout(()=> {
        document.getElementById(`key${uuid}`).focus()
      },200)
    });
  }
  checkKey(rule, value, callback) {
    if (!Boolean(value)){
      callback(new Error('请输入标签键'))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 64) {
      callback(new Error('标签键长度为3~64位'))
      return
    }
    if (Kubernetes.IsQualifiedName(value).length >0) {
      callback(new Error('以字母或数字开头和结尾中间可使用_或者-'))
      return
    }
    callback()
  }
  checkValue(rule, value, callback) {
    if (!Boolean(value)){
      callback(new Error('请输入标签值'))
      return
    }
    const Kubernetes = new KubernetesValidator()
    if (value.length < 3 || value.length > 64) {
      callback(new Error('标签键长度为3~64位'))
      return
    }
    if (Kubernetes.IsValidLabelValue(value).length >0) {
      callback(new Error('以字母或数字开头和结尾中间可使用_或者-'))
      return
    }
    const { form, result } = this.props
    const key = form.getFieldValue(`key${uuid}`)
    if (range(0, uuid).filter(
      id => form.getFieldValue(`key${id}`) === key
        && form.getFieldValue(`value${id}`) === value).length > 0) {
      callback(new Error('标签已重复添加'))
    }
    if (result.filter(label =>  label.key === key && label.value === value).length > 0) {
      callback(new Error('标签已经存在'))
      return
    }
    callback()
  }
  handleEditOkModal(){
    //  e.preventDefault();
    const { addLabels, editLabels, clusterID, form } = this.props
    const _this = this
    const notificat = new NotificationHandler()
    if (this.state.create) {
      form.validateFields((errors, values) => {
        if (errors) {
          return
        }
        const labels =[]
        this.handleEditCancelModal()
        values.keys.map((item)=> {
          labels.push({
            key:values[`key${item}`],
            value:values[`value${item}`],
            target:'node',
            clusterID
          })
        })
        notificat.spin('添加中...')
        addLabels(labels,clusterID,{
          success: {
            func:(ret)=> {
              notificat.close()
              notificat.success('添加成功！')
              this.loadData(this)
            },
            isAsync:true
          },
          failed:{
            func:(ret)=> {
              notificat.close()
              notificat.error('添加失败！')
            }
          }
        })
      })

    } else {
      const { targets } = this.state
      form.validateFields((errors, values) => {
        if (errors) {
          return
        }
        const labels = {
          key: values.key0,
          value: values.value0
        }
        if (targets.key == labels.key && targets.value == labels.value) {
          notificat.info('未作更改，无需更新！')
          uuid = 0
          return
        }
        const body = {
          id: targets.id,
          labels,
          cluster:clusterID
        }
        this.handleEditCancelModal()
        notificat.spin('修改中...')
        editLabels(body,'PUT',{
          success: {
            func: ()=> {
              notificat.close()
              _this.loadData(_this)
              notificat.success('修改成功！')
            },
            isAsync: true
          },
          failed: {
            func:()=> {
              notificat.close()
              notificat.error('修改失败！')
            }
          },
          finally: {
            func:()=> uuid = 0
          }
        })
      });

    }
  }
  createModal() {
    this.setState({editVisible: true,create: true})
    setTimeout(()=> {
      document.getElementById('key0').focus()
    },300)
  }
  handHost(key) {
    this.props.callbackActiveKey('host',[key])
  }
  render(){
    const { form, isFetching, result } = this.props
    const { getFieldProps, getFieldValue } = form
    const { targets } = this.state
    const labelcolumns = [
      {
        title:'标签键',
        key:'keys',
        dataIndex:'key',
        width:'15%',
        sorter: (a, b) => a.key.localeCompare(b.key)
      },{
        title:'属性',
        key:'2',
        dataIndex:'attribute',
        width:'16%',
        render : (text,row) => {
          if (row.createAt) {
            return (
              <div>自定义</div>
            )
          }
          return (
            <div>系统创建</div>
          )
        }
      },{
        title:'标签值',
        key:'value',
        dataIndex:'value',
        width:'15%',
        sorter: (a, b) => a.value.localeCompare(b.value)
      },{
        title:'绑定实例',
        key:'targets',
        dataIndex:'targets',
        width:'15%',
        sorter: (a, b) => a.targets.length - b.targets.length,
        render : (text,row) => {
          if (text.length >0) {
            return (
            <div className='binditem cursor' onClick={()=> this.handHost(row)}>
              {text.length}
              <Tooltip title={text.join('，')}><span> 个</span></Tooltip>
            </div>
            )
          }
          return(
           <div className='binditem cursor' onClick={()=> this.handHost(row)}>0 个</div>
          )
        }
      },{
        title:'创建时间',
        key:'createAt',
        dataIndex:'createAt',
        width:'18%',
        sorter: (a, b) => {
          const getDate = l => l.hasOwnProperty('createAt') ? new Date(l.createAt) : new Date(0)
          const at = getDate(a)
          const bt = getDate(b)
          return at - bt
        },
        render : (text)=>{
          if (text) {
            return (
              <div>{calcuDate(text)}</div>
            )
          }
          return '--'
        }
      },{
        title:'操作',
        key:'actions',
        dataIndex:'handle',
        width:'132px',
        className:'handle',
        render : (text,row) => {
          if (row.createAt && row.targets.length ==0) {
            return (<div>
              <Button type="primary"　className='editbutton' onClick={() => this.handleEditButton(row)}>修改</Button>
              <Button className='deletebutton' onClick={() => this.handleDeleteButton(row.id)}>删除</Button>
            </div>)
          }
          if (row.createAt && row.targets.length > 0) {
            return (<div>解绑后可操作</div>)
          }
          return (
            <span className='systemmessage'>
              <Icon type="info-circle-o" className='handleicon'/>
              系统创建，不可操作
            </span>
          )
        }

      }
    ]
    getFieldProps('keys', {
      initialValue: [0],
    });
    const formItems = getFieldValue('keys').map((k) => {
        return (
          <div className="formRow" key={`create-${k}`}>
            <div className="formlabelkey">
              <FormItem key={k}>
                <Input {...getFieldProps(`key${k}`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkKey
                  }],
                  initialValue: targets.key ? targets.key : undefined
                })} placeholder="请填写标签键"
                />
              </FormItem>
            </div>
            <div className="formlabelvalue">
              <FormItem key={k}>
                <Input {...getFieldProps(`value${k}`, {
                  rules: [{
                    whitespace: true,
                  },{
                    validator: this.checkValue
                  }],
                  initialValue: targets.value ? targets.value : undefined
                })} placeholder="请填写标签值"
                />
              </FormItem>
            </div>
            <Button icon="delete" className="foredelteicon" size="large" onClick={() => this.removeRow(k)}></Button>
          </div>
        );
    });

    return <div id="cluster__labelmanage">
      <div className='labelmanage__title'>
        <Button type="primary" onClick={()=> this.createModal()} size="large" className='titlebutton'>
          <i className="fa fa-plus" style={{marginRight:'5px'}}/>创建标签
        </Button>
        <Button type="ghost" size="large" onClick={()=> this.loadData(this)} className='titlebutton'><i className='fa fa-refresh' /> 刷 新</Button>
        <span className='titlesearch'>
          <Input
            placeholder="请输入标签键或标签值搜索"
            size="large"
            ref='titleInput'
            id='titleInput'
            onPressEnter={this.handleSearchInput}
          />
          <Icon type="search" className='titleicon' onClick={this.handleSearchInput}/>
        </span>
        <span className='titlenum'>共计 <span>{result ? result.length:0}</span> 条</span>
      </div>
      <Table
        rowKey={record => 'row-'+ record.key + record.value}
        className="labelmanage__content"
        columns={labelcolumns}
        dataSource={ result }
        pagination={{simple:true}}
        loading={isFetching}
      />
      <Modal
        title={this.state.create ? '创建标签':'修改标签'}
        visible={this.state.editVisible}
        onOk={this.handleEditOkModal}
        onCancel={this.handleEditCancelModal}
        wrapClassName="labelManageModal"
        width="560px"
      >
        <Form className='labelManageForm'>
          <div className="formlabelkey">
            <div className='top'>标签键</div>
          </div>
          <div className="formlabelvalue">
            <div className='top'>标签值</div>
          </div>
          <div style={{clear:'both'}}></div>
          {/* create form  item or edit form item view */}
          {formItems}
        </Form>
        { this.state.create ?
          <div style={{clear:'both'}}>
            <span className="cursor" onClick={()=> this.addRow()}><Icon type="plus-circle-o" /> 添加一组标签</span>
          </div>
          :
          <div style={{clear:'both'}}></div>
        }
      </Modal>

      <Modal
        title="删除标签"
        visible={this.state.deleteVisible}
        onOk={this.handleDelteOkModal}
        onCancel={this.handleDelteCancelModal}
        wrapClassName="labelManageModal"
        width="560px"
      >
        <div className="confirmText">
          <Icon type="info-circle-o" style={{marginRight:'3px'}}/>
          确定要删除当前标签吗？
        </div>
      </Modal>
    </div>
  }
}

ClusterLabelManage = Form.create()(ClusterLabelManage)

function mapStateToProps(state,props) {
  const { clusterLabel } = state.cluster_nodes || {}
  const cluster = props.clusterID
  if (!clusterLabel[cluster]) {
    return props
  }
  let { isFetching, result } = clusterLabel[cluster]
  if (!isFetching) {
    isFetching = false
  }
  if (!result) {
    result = {summary:[]}
  }
  return {
    isFetching,
    result:result.summary
  }
}

export default connect(mapStateToProps, {
  getClusterLabel,
  addLabels,
  editLabels,
  searchLabels
})(ClusterLabelManage)