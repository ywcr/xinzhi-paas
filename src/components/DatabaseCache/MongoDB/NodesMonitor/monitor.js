/*
*Author:Dujingya
*Create time：2017-09-04 15:14
*Description:
*/

import React, { Component } from 'react';
import {Switch} from 'antd'
import Line from './Line'
import './monitor.less'

const getDataList=(arr,position)=> {

    if(arr.length==0){
        return 0
    }
    // toLocaleTimeString()
    return arr.map((item) => {
        return item[position]
    })
}

export default class Monitor extends Component {
    constructor(props){
        super(props)
        this.state={
            checkedChildren:'开',
            unCheckedChildren:'关',
            checked:false
        }
    }

    getSeries = (arr) => {
        let arrList=arr.data||arr.dataSet;
        const unitName=arr.meterId
        let nameField=arr.field;

        let arrData=[],listArr=[]

        if(arrList&&arrList.length>0){
             arrData=arrList.map(item => {
                let [item1, ...restItems] = item
                if(unitName=='disk-us-volume'){
                    let arrItem3=[]
                    let [item2,item3,...diskItems]=restItems
                    arrItem3.push(item3)
                    restItems=arrItem3
                }

                const data=restItems.map((restItem)=>{
                    return restItem
                })
                return data
            })
            for(let i=0;i<arrData[0].length;i++){
                let itemValue=getDataList(arrData,i)

                listArr.push(itemValue)
            }

            const charts=listArr.map((value,index)=> {
                let name = ''
                if (unitName == 'memory') {
                    name = '内存'
                } else if (unitName == 'cpu') {
                    name = 'cpu'
                }else if(unitName=='traffic'){
                    if(index==0){
                        name='进'
                    }else{
                        name='出'
                    }
                } else if(unitName=='disk-us-volume'){
                    if(index==0){
                        name='硬盘使用率'
                    }
                }else if(unitName=='disk-iops-volume'||unitName=='disk-volume'){
                    if(index==0){
                        name='读'
                    }else{
                        name='写'
                    }
                }
                if(unitName=='stats') {
                    return null
                }else{
                    if(nameField&&nameField.length>0){
                        return {
                            name:nameField[index],
                            type: 'line',
                            showSymbol: false,
                            data:value
                        }
                    }

                    return {
                        name:name,
                        type: 'line',
                        showSymbol: false,
                        data:value
                    }
                }
            })
            return charts
        }

        }

    userTime(uTime){
        var myDate = new Date(uTime*1000);
        var hours = myDate.getHours();
        var minutes = myDate.getMinutes();
        return hours + ':' + minutes;
    }



    render() {
       const _this=this;
        const propsData=_this.props.data.data||_this.props.data.dataSet;
          let timeStr=[]
        if(propsData&&propsData.length>0){
             timeStr=getDataList(propsData,0).map((item)=>{
                 return _this.userTime(item)
            })
        }


        const unit=this.props.data.meterId
        let titleName='',diskValue='';
       if(unit=='memory'){
             titleName='内存'
         }else if(unit=='traffic'){
             titleName='带宽'
         } else if(unit=='cpu'){
             titleName='cpu'
         }else if(unit=='disk-us-volume'){
             titleName='硬盘使用率'
             diskValue='%'
         }else if(unit=='disk-iops-volume'){
             titleName='硬盘IOPS'
         }else if(unit=='disk-volume'){
             titleName='硬盘使用率'
         }else if(unit=='conns'){
            titleName='总连接数'
         }else if(unit=='operations'){
            titleName='操作数'
         }else if(unit=='reoperations'){
             titleName='复制操作数'
         }else if(unit=='queries'){
           titleName='query请求'
         }else if(unit=='transions'){
           titleName='事务'
         }else if(unit=='innodbs'){
           titleName='innodb缓冲池可用空间'
         }else if(unit=='hits'){
           titleName='命中数'
         }else if(unit=='hitspercent'){
           titleName='命中率'
         }else if(unit=='threads'){
           titleName='线程链接'
         }else if(unit=='scans'){
           titleName='全表扫描次数'
         }else if(unit=='slowquerys'){
           titleName='慢查询'
       }else if(unit=='currentconns'){
            titleName='当前连接数'
         }else if(unit=='hitscpercent'){
           titleName='当前连接数'
       }else if(unit=='keys'){
           titleName='当前连接数'
       }else if(unit=='readconns'){
           titleName="读连接数"
       }else if(unit=='writeconns'){
           titleName="写连接数"
       }

        const lineOption={
            title: {
                text:titleName,
                left:10
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '10%',
                containLabel:true
            },
            legend: {
                type:'plain',
                show:true,
                data:['111','222','333','']
            },
            xAxis:  {
                type: 'category',
                boundaryGap: false,
                data:timeStr
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter:'{value}'+diskValue
                }
            },
            series:_this.getSeries(_this.props.data)
        }

        return (
            <div className="echartsList">
                {/*<Switch className="toggle" onChange={this.monitorTurnOn}    checkedChildren={this.state.checkedChildren} unCheckedChildren={this.state.unCheckedChildren} />*/}
                <Line  option={lineOption} />
                <hr/>
            </div>
        );
    }
}

