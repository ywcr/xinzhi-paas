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
import { browserHistory,Link } from 'react-router'
import { connect } from 'react-redux'
import moment from 'moment'
import ReactEcharts from 'echarts-for-react'
import QueueAnim from 'rc-queue-anim'
import { getAllClusterLine } from '../../../actions/services'
import "./style/PortDetail.less"
import NotificationHandler from '../../../common/notification_handler.js'
function formatGrid(count) {
    //this fucntion for format grid css
    //due to the memory counts > 6, this grid would be display wrong
    let initHeight = 300 + ((count - 4)/2)*25;
    return initHeight + 'px';
  }
let Lifecycle = React.createClass({
  getInitialState() {
    const { currentCluster, loginUser } = this.props
    return {
    }
  },
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    const { getAllClusterLine,cluster,serviceName } = this.props;
    getAllClusterLine(cluster,serviceName)
  },
  componentWillUnmount() {
  },
  componentWillReceiveProps(nextProps) {
    let { isCurrentTab }= nextProps
    if (!this.props.isCurrentTab && isCurrentTab) {
        const { getAllClusterLine,cluster,serviceName } = this.props;
        getAllClusterLine(cluster,serviceName)
    }
  },
  handCancel(i) {
    
  },
  render: function () {
    const { lifeCycle,showList } = this.props;
    const { conuts,names } = lifeCycle
    let option = {
        title: {
            text: '容器生命周期'
        },
        tooltip : {
            trigger: 'axis',
            formatter: function (params) {
                var res='<div><p>时间：'+params[0].name+'</p></div>' 
                for(var i=0;i<params.length;i++){
                    res+='<p>'+params[i].seriesName+':'+params[i].data+'</p>'
                }
                res+='<p>点击查看列表</p>'
                // for(var j=0;j<names[params[0].dataIndex].length;j++){
                //     res+=`<p>${names[params[0].dataIndex][j]}</p>`
                // }
                return res;
            },
        },
        legend: {
            data:['运行中']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                splitLine: {show:false},
                data :  function (){
                    var list = [];
                    for (var i = 6; i >= 0; i--) {
                        var date = moment().subtract(i, 'days').format('YYYY/MM/DD')
                        list.push(date);
                    }
                    return list;
                }()
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'运行中',
                type:'line',
                stack: '生命周期',
                data:conuts,
                symbolSize:10,
                itemStyle: {
                    normal: {
                        fontSize:24
                    }
                }
            }
        ]
    };
    let onEvents = {
        'click': showList,
        'legendselectchanged': ''//应该是有改变的时候调用的
    }
    return <ReactEcharts
            style={{ height: formatGrid(7) }}
            option={option}
            onEvents={onEvents}
            showLoading={false}/>
  }
});

function mapSateToProp(state) {
  const { loginUser } = state.entities
  const { lifeCycle } = state.services
  return {
    loginUser: loginUser,
    lifeCycle:lifeCycle.result||{count:[],names:[]}
  }
}

Lifecycle = connect(mapSateToProp, {
    getAllClusterLine
})(Lifecycle)

Lifecycle.propTypes = {

}

export default Lifecycle
