/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Create app: select image
 *
 * v0.1 - 2017-05-03
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Radio, Input, Tabs, Button, Table } from 'antd'
import {searchPublicImages, searchFavoriteImages, searchPrivateImages, publicFilterServer} from '../../../actions/app_center'
import { loadAllProject,loadRepositoriesTags, searchHarborPublicImages, searchHarborPrivateImages } from '../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../constants'
import '../../AppModule/QuickCreateApp/style/SelectImage.less'
const standard = require('../../../../configs/constants').STANDARD_MODE
const mode = require('../../../../configs/model').mode
const standardFlag = mode === standard
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
class SelectImage extends Component {

    constructor(props) {
        super(props)
        this.state={
            mirrorType:'publicImages',
            currentPage: 1,
            searchInputValue:'',

        }
        this.imageTypeChange=this.imageTypeChange.bind(this)
        this.selectButton=this.selectButton.bind(this)
    }

    componentWillMount(){
        const {loadAllProject}=this.props

        loadAllProject('publicImages')
    }

/*============获取镜像列表===========*/
    imageTypeChange=(e)=>{
        const mirrorType = e.target.value
        const {loadAllProject}=this.props

        this.setState({
            mirrorType:mirrorType
        })
        loadAllProject(mirrorType)
    }

/*========搜索镜像==========*/
    searchImages=()=>{
        const { searchInputValue} = this.state
        const {loadAllProject}=this.props

        if(searchInputValue) {
             loadAllProject(this.state.mirrorType,{'q':searchInputValue})
        }else{
            loadAllProject(this.state.mirrorType)
        }

    }

    /*=====选择按钮=======*/
    selectButton(server,name){
        const {scope,loadRepositoriesTags,form}=this.props
        scope.setState({
        })

        loadRepositoriesTags(this.state.mirrorType,name.repositoryName,{
            success: {
                func: (res) => {
                    if(res&&res.data&&res.data.length>0){
                         scope.setState({
                             mirrorRelease:res.data,
                             mirrorListModal:false,
                         })
                        form.resetFields(['mirrorVsersion'])

                        scope.props.form.setFieldsValue({'mirroring':server+'/'+name.repositoryName})
                    }
                }
            }
        })



    }


    render() {

        const {images} = this.props
        const dataSource=images[this.state.mirrorType]

        let mirrorList=[],isFetching=false,server=''
        if(dataSource&&dataSource[this.state.mirrorType]){
            mirrorList=dataSource[this.state.mirrorType]
            isFetching=dataSource.isFetching
            server=dataSource.server;

        }
        const paginationOpts = {
            simple: true,
            current: this.state.currentPage,
            onChange: current => this.setState({ currentPage: current }),
            pageSize: 10
        }

        const columns = [
                    {
                        title: '镜像名称',
                        dataIndex: 'repositoryName',
                        key: 'repositoryName',
                        render(text,record) {
                            return (
                                <div>
                                    <svg className='imgUrl'>
                                        <use xlinkHref='#appcenterlogo' />
                                    </svg>
                                    <div className="infoBox">
                                        <span className="name">{text}</span> <br />
                                        <span className="desc">{record.description}</span>
                                    </div>
                                </div>
                            )
                        }
                     },
                     {
                        title: '选择',
                        dataIndex: 'deploy',
                        key: 'deploy',
                        width: '10%',
                        render: (text, record)=> {
                            return (
                                <div className="deployBox">
                                    <Button className="deployBtn" onClick={()=>this.selectButton(server,record)} type="primary" size="large">
                                        选择&nbsp;
                                        <i className="fa fa-arrow-circle-o-right" />
                                    </Button>
                                </div>
                            )
                        }
                    }
            ]

        return(
            <div id="quickCreateAppSelectImage">
                <div className="selectImage">
                    <span className="imageType">
                        <RadioGroup onChange={this.imageTypeChange}  size="large" value={this.state.mirrorType} >
                          <RadioButton value='publicImages'>公有</RadioButton>
                          <RadioButton value="privateImages">私有</RadioButton>
                        </RadioGroup>
                    </span>
                    <span className="searchInputBox">
                       <Input
                           value={this.state.searchInputValue}
                           size="large"
                           placeholder="按镜像名称搜索"
                           id="searchImages"
                           onPressEnter={this.searchImages}
                           onChange={e => {
                               this.setState({
                                   searchInputValue: e.target.value
                               })
                           }}
                       />
                        <i className="fa fa-search cursor" onClick={this.searchImages} ></i>
                    </span>
                </div>
                <div className="content">
                    <Table
                        showHeader={false}
                        className="imageList"
                        dataSource={mirrorList}
                        columns={columns}
                        loading={isFetching}
                        pagination={paginationOpts}
                    />
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { cluster, unit } =  state.entities.current
    const oemInfo = state.entities.loginUser.info.oemInfo || {}
    const { productName } = oemInfo.company || {}
    return {
        images: state.harbor.allProject,
        cluster: cluster.clusterID,
        unit,
        productName
    }
}

export default connect(mapStateToProps, {
    searchPublicImages,
    searchFavoriteImages,
    searchPrivateImages,
    publicFilterServer,
    loadAllProject,
    loadRepositoriesTags
})(SelectImage)