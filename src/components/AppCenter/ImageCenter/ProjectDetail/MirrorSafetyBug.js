/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * MirrorSafetyBug component
 *
 * v0.1 - 2017-3-22
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Card, Spin, Icon, Select, Tabs, Button, Steps, Checkbox, Input, Table, Tooltip } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ReactEcharts from 'echarts-for-react'
import './style/MirrorSafetyBug.less'
import { loadMirrorSafetyScan, loadMirrorSafetyChairinfo } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { connect } from 'react-redux'
import NotificationHandler from '../../../../common/notification_handler'
import safetyBugImg from '../../../../assets/img/appCenter/mirrorSafety/safetybug.png'

const TabPane = Tabs.TabPane
const Step = Steps.Step
const Option = Select.Option

class TableTemplate extends Component{
  constructor(props){
    super(props)
    this.tableDatasource = this.tableDatasource.bind(this)
    this.tableSeverityColor = this.tableSeverityColor.bind(this)
    this.tableSubNo = this.tableSubNo.bind(this)
    this.tableSubNo = this.tableSubNo.bind(this)
    this.state = {
      Unknown: 0,
      Negligible: 0,
      Low: 0,
      Medium: 0,
      High: 0,
      Total: 0,
      PatchTotal: 0,
      echarts : true,
    }
  }

  componentDidMount() {
    const EchartsDate = this.tableDatasource().EchartsDate
    if(EchartsDate){
      this.setState({
        Unknown: EchartsDate.EchartsUnknownNum ,
        Negligible: EchartsDate.EchartsNegligibleNum,
        Low: EchartsDate.EchartsLowNum,
        Medium: EchartsDate.EchartsMediumNum,
        High: EchartsDate.EchartsHighNum,
        Total : (EchartsDate.EchartsUnknownNum + EchartsDate.EchartsNegligibleNum + EchartsDate.EchartsLowNum + EchartsDate.EchartsMediumNum + EchartsDate.EchartsHighNum),
        PatchTotal:　EchartsDate.EchartsFixedIn
      })
    }
  }

  componentWillReceiveProps(nextProps){
    const mirrorsafetyClair = nextProps.mirrorsafetyClair
    const imageName = nextProps.imageName
    const tag = nextProps.tag
    if(tag == this.props.tag || nextProps.inherwidth !== 1){
      this.setState({
        echarts : true
      })
    }
    if(tag !== this.props.tag || nextProps.inherwidth !== 1){
      this.setState({
        echarts : false
      })
    }
    if(tag !== this.props.tag || nextProps.inherwidth == 1){
      setTimeout(()=> {
        this.setState({
          echarts : true
        })
      })
    }
    if(tag !== this.props.tag && nextProps.inherwidth == 1){
      setTimeout(() => {
        this.setState({
          echarts : false
        })
      },100)
    }
    if(imageName !== this.props.imageName || mirrorsafetyClair !== this.props.mirrorsafetyClair || !nextProps.mirrorLayeredinfo[imageName]){
      if(!mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag] || !mirrorsafetyClair[imageName][tag].result || Object.keys(mirrorsafetyClair[imageName][tag].result.report).length == 0){
        return
      }
      const result = mirrorsafetyClair[imageName][tag].result.report
      const clairVulnerabilities = result.vulnerabilities
      const clairFeatures = result.features
      const clairFixedIn = result.fixedIn
      // Echarts 数据
      let EchartsUnknownNum = 0
      let EchartsNegligibleNum = 0
      let EchartsLowNum = 0
      let EchartsMediumNum = 0
      let EchartsHighNum = 0
      let EchartsNoneNum = 0
      let EchartsFixedIn = 0
      if(!clairVulnerabilities || Object.keys(clairVulnerabilities).length == 0){
        return
      }
      for(let keyVulner in clairVulnerabilities){
        let software = clairVulnerabilities[keyVulner].features
        if(software.length > 1){
          for(let keyFix in clairFixedIn){
            let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
            if(RVersionStr == keyFix){
              EchartsFixedIn++
              break
            }
          }
          switch(clairVulnerabilities[keyVulner].severity){
            case "High" :
              EchartsHighNum++;
              break;
            case "Medium" :
              EchartsMediumNum++;
              break;
            case "Low" :
              EchartsLowNum++;
              break;
            case "Negligible" :
              EchartsNegligibleNum++;
              break;
            case "Unknown" :
            default :
              EchartsUnknownNum++;
              break;
          }
        }else{
          for(let keyFix in clairFixedIn){
            let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
            if(RVersionStr == keyFix){
              EchartsFixedIn++
              break
            }
          }

          switch(clairVulnerabilities[keyVulner].severity){
            case "High" :
              EchartsHighNum++;
              break;
            case "Medium" :
              EchartsMediumNum++;
              break;
            case "Low" :
              EchartsLowNum++;
              break;
            case "Negligible" :
              EchartsNegligibleNum++;
              break;
            case "Unknown" :
            default :
              EchartsUnknownNum++;
              break;
          }
        }
      }

      this.setState({
        Unknown: EchartsUnknownNum ,
        Negligible: EchartsNegligibleNum,
        Low: EchartsLowNum,
        Medium: EchartsMediumNum,
        High: EchartsHighNum,
        Total : (EchartsUnknownNum + EchartsNegligibleNum + EchartsLowNum + EchartsMediumNum + EchartsHighNum),
        PatchTotal: EchartsFixedIn})
    }
  }

  tableDatasource(){
    const { mirrorsafetyClair, mirrorLayeredinfo, imageName, tag } = this.props
    let tabledatasource = []
    if(!mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag] || !mirrorsafetyClair[imageName][tag].result || Object.keys(mirrorsafetyClair[imageName][tag].result.report).length == 0 || !mirrorLayeredinfo[imageName][tag].result){
      return tabledatasource = []
    }
    const result =  mirrorsafetyClair[imageName][tag].result.report
    const clairVulnerabilities =result.vulnerabilities
    const clairFeatures = result.features
    const clairFixedIn = result.fixedIn
    const layerInfo = mirrorLayeredinfo[imageName][tag].result
    let index = 1
    // Echarts 数据
    let EchartsUnknownNum = 0
    let EchartsNegligibleNum = 0
    let EchartsLowNum = 0
    let EchartsMediumNum = 0
    let EchartsHighNum = 0
    let EchartsNoneNum = 0
    let EchartsFixedIn = 0

    if(!clairVulnerabilities || Object.keys(clairVulnerabilities).length == 0){
      return tabledatasource = []
    }else{
      for(let keyVulner in clairVulnerabilities){
        let CVEobj = {}
        let CVersion = ''
        let RVersion = ''
        let softwareID = ''
        let software = ''
        let Command = {}
        let data = {}
        software = clairVulnerabilities[keyVulner].features
        if(software.length > 1){
          // CVE
          CVEobj = {
            name:clairVulnerabilities[keyVulner].name,
            link:clairVulnerabilities[keyVulner].link
          }
          // 当前版本
          for(let keyFea in clairFeatures){
            if(clairVulnerabilities[keyVulner].features[0] == clairFeatures[keyFea].name){
              CVersion = clairFeatures[keyFea].version
              softwareID = clairFeatures[keyFea].layerID
              break
            }
          }

          // 修正版
          if(!clairFixedIn){
            RVersion = '暂无修正版'
          }else{
            for(let keyFix in clairFixedIn){
              let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
              if(RVersionStr == keyFix){
                RVersion = clairFixedIn[keyFix]
                EchartsFixedIn++
                break
              }
              if(RVersion == '' ){
                RVersion = '暂无修正版'
              }
            }
          }

          // 位于镜像
          for(let i = 0; i < layerInfo.length; i++){
            if(softwareID == layerInfo[i].iD){
              Command = layerInfo[i].command
              break
            }
          }

           //漏洞数量统计
          switch(clairVulnerabilities[keyVulner].severity){
            case "High" :
              EchartsHighNum++;
              break;
            case "Medium" :
              EchartsMediumNum++;
              break;
            case "Low" :
              EchartsLowNum++;
              break;
            case "Negligible" :
              EchartsNegligibleNum++;
              break;
            case "Unknown" :
            default :
              EchartsUnknownNum++;
              break;
          }
          for(let i = 0; i < software.length; i++){
            data = {
              key: index,
              CVE: CVEobj,
              severity: clairVulnerabilities[keyVulner].severity,
              software: software[i],
              currentVersion: CVersion,
              reversion: RVersion,
              layerInfo: Command,
              description: this.tableSub()
            }
            tabledatasource.push(data)
            index++
            data = {}
          }
        }else{
          // CVE
          CVEobj = {
            name:clairVulnerabilities[keyVulner].name,
            link:clairVulnerabilities[keyVulner].link
          }
          // 当前版本
          for(let keyFea in clairFeatures){
            if(clairVulnerabilities[keyVulner].features[0] == clairFeatures[keyFea].name){
              CVersion = clairFeatures[keyFea].version
              softwareID = clairFeatures[keyFea].layerID
              break
            }
          }

          // 修正版
          if(!clairFixedIn){
            RVersion = '暂无修正版'
          }else{
            for(let keyFix in clairFixedIn){
              let RVersionStr = keyVulner + software[0].substring(0,1).toUpperCase()+software[0].replace(/-/g, '').substring(1,software[0].length)
              if(RVersionStr == keyFix){
                RVersion = clairFixedIn[keyFix]
                EchartsFixedIn++
                break
              }
              if(RVersion == '' ){
                RVersion = '暂无修正版'
              }
            }
          }

          // 位于镜像
          for(let i = 0; i < layerInfo.length; i++){
            if(softwareID == layerInfo[i].iD){
              Command = layerInfo[i].command
              break
            }
          }

          // 漏洞数量统计
          switch(clairVulnerabilities[keyVulner].severity){
            case "High" :
              EchartsHighNum++;
              break;
            case "Medium" :
              EchartsMediumNum++;
              break;
            case "Low" :
              EchartsLowNum++;
              break;
            case "Negligible" :
              EchartsNegligibleNum++;
              break;
            case "Unknown" :
            default :
              EchartsUnknownNum++;
              break;
          }
          if(clairVulnerabilities[keyVulner].cVSSv2 && Object.keys(clairVulnerabilities[keyVulner].cVSSv2).length !== 0){
            clairVulnerabilities[keyVulner].cVSSv2.des = clairVulnerabilities[keyVulner].description
            data = {
              key: index,
              CVE: CVEobj,
              severity: clairVulnerabilities[keyVulner].severity,
              software: software[0],
              currentVersion: CVersion,
              reversion: RVersion,
              layerInfo: Command,
              description: this.tableSub(clairVulnerabilities[keyVulner].cVSSv2)
            }
          }else{
            let des = clairVulnerabilities[keyVulner].description
            data = {
              key: index,
              CVE: CVEobj,
              severity: clairVulnerabilities[keyVulner].severity,
              software: software[0],
              currentVersion: CVersion,
              reversion: RVersion,
              layerInfo: Command,
              description: this.tableSubNo(des)
            }
          }
          tabledatasource.push(data)
          index++
        }
      }
      return {
        tabledatasource,
        EchartsDate: {
          EchartsUnknownNum,
          EchartsNegligibleNum,
          EchartsLowNum,
          EchartsMediumNum,
          EchartsHighNum,
          EchartsFixedIn
        }
      }
    }
  }

  tableSeverityColor(severity){
    if(!severity){
      return
    }
    switch(severity){
      case 'High':
        return 'severityHigh'
      case 'Medium':
        return 'severityMedium'
      case 'Low':
        return 'severityLow'
      case 'Negligible':
        return 'severityNegligible'
      case 'Unknown':
      default:
        return 'severityUnknown'
    }
  }

  tableSubNo(str){
    return(
      <div className='tableSUBnNo'>
        {str}
      </div>
    )
  }

  tableSub(object){
    const data = object || {}

    const accessVectorArr = ['','网络','相邻网络','本地']
    function accessVectorFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = accessVectorArr[data.accessVector]
        if( value == '网络' && value == text){
          return 'red'
        }
        if(value == '相邻网络' && value == text){
          return 'orange'
        }
        if(value == '本地' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const accessComplexityArr = ['','低','中','高']
    function accessComplexityFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = accessComplexityArr[data.accessComplexity]
        if( value == '低' && value == text){
          return 'red'
        }
        if(value == '中' && value == text){
          return 'orange'
        }
        if(value == '高' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const authenticationArr = ['','没有','单','多']
    function authenticationFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = authenticationArr[data.authentication]
        if( value == '没有' && value == text){
          return 'red'
        }
        if(value == '单' && value == text){
          return 'orange'
        }
        if(value == '多' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const confidentialityImpactArr = ['','完成','局部','没有']
    function confidentialityImpactFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = confidentialityImpactArr[data.confidentialityImpact]
        if( value == '完成' && value == text){
          return 'red'
        }
        if(value == '局部' && value == text){
          return 'orange'
        }
        if(value == '没有' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }

    const integrityImpactArr = ['','完成','局部','没有']
    function integrityImpactFun(data,text){
      if(Object.keys(data).length !== 0){
        const value = integrityImpactArr[data.integrityImpact]
        if( value == '完成' && value == text){
          return 'red'
        }
        if(value == '局部' && value == text){
          return 'orange'
        }
        if(value == '没有' && value == text){
          return 'green'
        }else{
          return 'grey'
        }
      }
    }
    const columns1 = [{
      title: '访问向量',
      dataIndex: 'name',
      key: 'name',
      width: '18%',
      render: text => (<span style={{color:accessVectorFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span >{text}</span></span>)
    }, {
      title: '访问的复杂性',
      dataIndex: 'age',
      width: '18%',
      key: 'age',
      render: text => (<span style={{color: accessComplexityFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span >{text}</span></span>)
    }, {
      title: '认证',
      dataIndex: 'address',
      width: '15%',
      key: 'address',
      render: text => (<span style={{color:authenticationFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span>{text}</span></span>)
    }, {
      title: '保密性的影响',
      dataIndex: 'address1',
      width: '21%',
      key: 'address1',
      render: text => (<span style={{color:confidentialityImpactFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span>{text}</span></span>)
    }, {
      title: '完整性的影响',
      dataIndex: 'address2',
      key: 'address2',
      width: '21%',
      render: text => (<span style={{color:integrityImpactFun(data,text)}}><i className="fa fa-circle" aria-hidden="true" style={{marginRight: '6px'}}></i><span >{text}</span></span>)
    }]

    // 表格数据
    const dataSource1 = [{
      key: '1',
      name: '网络',
      age: '低',
      address: '没有',
      address1: '完成',
      address2: '完成',
    }, {
      key: '2',
      name: '相邻网络',
      age: '中',
      address: '单',
      address1: '局部',
      address2: '局部',
    }, {
      key: '3',
      name: '本地',
      age: '高',
      address: '多',
      address1: '没有',
      address2: '没有',
    }]

    return (
      <div className='tablesub'>
        <div className='tablesubtitle'>矢量<span style={{marginLeft:'8px',fontSize:'12px'}}>当前分数{data.score}</span></div>
        <div className='tablesubbody'>
          <Table
            columns={columns1}
            dataSource={dataSource1}
            pagination={false}
            size="small"
          >
          </Table>
        </div>
        <div className='tablesubtitlefooter'>描述</div>
        <div className='tablesubtitlefooteritem'>
          {data.des}
        </div>
      </div>
    )
  }

  handleGetBackLayer(text){
    const { callback } = this.props
    let getBackInfo = {
      ActiveKey:2,
      LayerCommandParameters:text
    }
    callback(getBackInfo)
  }

  render(){
    const { Unknown, Negligible, Low, Medium, High, echarts }=this.state
    const { mirrorsafetyClair, imageName, tag } = this.props
    function EchartsGapTemplate(num){
      let str = num.toString()
      switch(str.length){
        case 1:
        default:
          return '   ' + '        ' + num + '  封装' + '      '
        case 2:
          return '   ' + '      ' + num + '  封装' + '      '
        case 3:
          return '   ' + '    ' + num + '  封装' + '      '
        case 4:
          return '   ' + '  ' + num + '  封装' + '      '
        case 5:
          return '   ' + num + '  封装' + '      '
      }
    }

    let safetybugOption = {
      title: {
        text: '镜像安全扫描检测到 ' + this.state.Total + ' 个漏洞，补丁为 '+this.state.PatchTotal+' 个漏洞',
        textStyle: {
          fontWeight: 'normal'
        },
        left: '45%',
        top: '12%',
      },
      legend: {
        show: true,
        orient: 'vertical',
        height: 'auto',
        left: '45%',
        top: '30%',
          data: ['高级别安全漏洞', '中级别安全漏洞', '低级别安全漏洞', '可忽略级别的漏洞', '未知的漏洞'],
          formatter: function (name) {
            if (name == '高级别安全漏洞') {
              return EchartsGapTemplate(High) + name
            }
            if (name == '中级别安全漏洞') {
              return EchartsGapTemplate(Medium) + name
            }
            if (name == '低级别安全漏洞') {
              return EchartsGapTemplate(Low) + name
            }
            if (name == '可忽略级别的漏洞') {
              return EchartsGapTemplate(Negligible) + name
            }
            if (name == '未知的漏洞') {
              return EchartsGapTemplate(Unknown) + name
            }
        },
        textStyle: {
          fontSize: 14,
          color: '#666'
        },
      },
      tooltip: {
        formatter: '{b} : {c}'
      },
      series: [{
        type: 'pie',
        selectedMode: 'single',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        selectedOffset: 5,
        radius: ['50', '70'],
        center: ['25%', '50%'],
        minAngle:'5',
        data: [
          {value: this.state.High, name: '高级别安全漏洞', selected: true},
          {value: this.state.Medium, name: '中级别安全漏洞'},
          {value: this.state.Low, name: '低级别安全漏洞'},
          {value: this.state.Negligible, name: '可忽略级别的漏洞'},
          {value: this.state.Unknown, name: '未知的漏洞' }
        ],
        label: {
          normal: {
            position: 'center',
            show: false
          },
          emphasis: {
            show: true,
            position: 'center',
            formatter: '{b} : {c}',
            textStyle: {
              fontSize: '13',
              color: '#666',
              fontWeight: 'normal'
            }
          }
        },
        itemStyle: {
          normal: {
            color: function(params){
              const colorList = ['#fa4f55', '#f7a45e', '#fbc82f', '#c7eafe', '#2abd83'];
              return colorList[params.dataIndex]
            },
            borderWidth: 2,
            borderColor: '#ffffff'
          },
           emphasis: {
             borderWidth: 0,
             shadowBlur: 7,
             shadowOffsetX: 0,
             shadowColor: 'rgba(0, 0, 0, 0.5)'
           }
        }
      }]
    }

    const severityLevel = {
      "High": 100,
      "Medium": 99,
      "Low": 98,
      "Negligible":97,
      "Unknown":96
    }

    function severitySort(s){
      if (!(s in severityLevel)) {
        return -100
      }
      return severityLevel[s]
    }

    function softwareSort(a,b){
      return a.localeCompare(b)
    }

    const columns = [{
      title: 'CVE',
      width: '15%',
      dataIndex: 'CVE',
      key: 'CVE',
      render: text => (
        <span className='CVE'><span className='CVEspan'>{text.name}</span><a href={text.link} target="_blank"><i className="fa fa-link CVEi" aria-hidden="true"></i></a></span>)
    }, {
      title: '严重',
      width: '13%',
      dataIndex: 'severity',
      key: 'severity',
      render: text => (<span className={this.tableSeverityColor(text)}><i className="fa fa-exclamation-triangle severityi" aria-hidden="true"></i><span>{text}</span></span>),
      sorter: (a, b) => severitySort(a.severity) - severitySort(b.severity),
    }, {
      title: '软件包',
      width: '11%',
      dataIndex: 'software',
      key: 'software',
      sorter:(a, b) => softwareSort(a.software, b.software)
    }, {
      title: '当前版本',
      width: '15%',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
    }, {
      title: '修正版',
      width: '15%',
      dataIndex: 'reversion',
      key: 'reversion',
      render: text => (<span className='reversion' style={{color: text == '暂无修正版' ? 'red' : '#5bcea3' }}><i className="fa fa-arrow-circle-right reversioni" aria-hidden="true"></i>{text}</span>),
    }, {
      title: '位于镜像层',
      width: '27%',
      dataIndex: 'layerInfo',
      key: 'layerInfo',
      render: text => (<div className='layerInfo'><span className='safetybugtablepoint'>{text.action}</span><Tooltip title={text.parameters}><span className='textoverflow layerInfospan'>{text.parameters}</span></Tooltip><i className="fa fa-database softwarepicturelright" aria-hidden="true" onClick={this.handleGetBackLayer.bind(this,text.parameters)}></i></div>),
    }]

    const softwarePagination = {
      total: this.tableDatasource().length,
      showSizeChanger: true,
    }

    if(Object.keys(mirrorsafetyClair[imageName][tag].result.report).length == 0 || !mirrorsafetyClair[imageName][tag].result.report.vulnerabilities){
      return <div className='message'>
        <img src={safetyBugImg}/>
        <div>暂未扫描出任何漏洞</div>
      </div>
    }

    return (
      <div>
        <div className='safetybugEcharts'>
          <div style={{width: '100%',height:'220px'}}>
            {
              echarts
              ? <ReactEcharts
                  option={safetybugOption}
                  style={{height: '220px'}}
                />
              : <div style={{textAlign:'center',paddingTop:'100px'}}><Spin /></div>
            }
          </div>
        </div>
        <div className='safetybugmirror'>
          <div className='safetybugmirrortitle'>
            <div className='safetybugmirrortitleleft'>镜像漏洞</div>
          </div>
          <div className="safetybugtable">
            <Table
              columns={columns}
              dataSource={this.tableDatasource().tabledatasource}
              pagination={softwarePagination}
              expandedRowRender={record => <span>{record.description}</span>}
            >
            </Table>
          </div>
        </div>
      </div>
    )
  }
}

class MirrorSafetyBug extends Component {
  constructor(props){
    super(props)
    this.NodataTemplateSafetyBug = this.NodataTemplateSafetyBug.bind(this)
    this.handleclairStatus = this.handleclairStatus.bind(this)
    this.APIGetclairInfo = this.APIGetclairInfo.bind(this)
    this.APIFailedThenScan = this.APIFailedThenScan.bind(this)
    this.sendObjectToTop = this.sendObjectToTop.bind(this)
    this.handlemirrorScanstatusSatus = this.handlemirrorScanstatusSatus.bind(this)
    this.state = {
      Unknown: 0,
      Negligible: 0,
      Low: 0,
      Medium: 0,
      High: 0,
      Total: 0,
      PatchTotal: 0,
      loading:false,
      clairFailed: false
    }
  }

  NodataTemplateSafetyBug(){
    const { mirrorScanstatus, imageName, tag } = this.props
    return (
      <div className='message'>{mirrorScanstatus[imageName][tag].result.message}</div>
    )
  }

  APIGetclairInfo(){
    const { loadMirrorSafetyChairinfo, mirrorScanstatus, imageName, tag } = this.props
    const scanstatus = mirrorScanstatus[imageName][tag]
    const blob_sum = scanstatus.result.blobSum || ''
    const full_name = scanstatus.result.fullName
    this.setState({loading:true})
    loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag},{
      success:{
        func:() => {
          this.setState({loading:false})
        },
        isAsync: true
      },
      failed : {
        func : () => {
          this.setState({loading:false})
        },
        isAsync : true
      }
    })
  }

  APIFailedThenScan(){
    const { loadMirrorSafetyScan, loadMirrorSafetyChairinfo, cluster_id, imageName, tag, mirrorScanUrl, mirrorSafetyScan, mirrorScanstatus, scanFailed, formatErrorMessage } = this.props
    const registry = mirrorScanUrl
    const scanstatus = mirrorScanstatus[imageName][tag]
    const blob_sum = scanstatus.result.blobSum || ''
    const full_name = scanstatus.result.fullName
    const config = {
      cluster_id,
      imageName,
      tag,
      registry,
      full_name
    }
    this.setState({clairFailed : true})
    if(mirrorSafetyScan[imageName] && mirrorSafetyScan[imageName][tag]){
      return loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag},{
        success: {
          func: () => {
            this.setState({clairFailed : false})
          },
          isAsync : true
        },
        failed:{
          func: () => {
            this.setState({clairFailed : false})
          },
          isAsync: true
        }
      })
    }
    return loadMirrorSafetyScan({...config}, {
      success: {
        func: () =>{
          loadMirrorSafetyChairinfo({imageName, blob_sum, full_name, tag},{
            success: {
              func: () => {
                this.setState({clairFailed : false})
              },
              isAsync : true
            },
            failed:{
              func: () => {
                this.setState({clairFailed : false})
              },
              isAsync: true
            }
          })
        },
        isAsync : true
      },
      failed:{
        func: (res) => {
          this.setState({clairFailed : false})
          new NotificationHandler().error('[ '+imageName+ ' ] ' +'镜像的'+ ' [ ' + tag + ' ] ' + formatErrorMessage(res))
          //scanFailed('failed')
        },
        isAsync: true
      }
    })
  }

  sendObjectToTop(obj){
    const { callback } = this.props
    callback(obj)
  }

  handleclairStatus(){
    const { mirrorsafetyClair, imageName, mirrorLayeredinfo, tag, inherwidth } = this.props
    if(!mirrorsafetyClair || !mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag] || !mirrorsafetyClair[imageName][tag].result){
      return
    }
    const result = mirrorsafetyClair[imageName][tag].result
    const statusCode = result.statusCode
    const status = result.status
    const message = result.message
    if(statusCode && statusCode == 500){
      return <div>{message}</div>
    }
    if (statusCode && statusCode == 200) {
      switch (status) {
        case 'running':
          return <div className='BaseScanRunning' data-status="running">
            <div className="top">正在扫描尚未结束</div>
            <Spin/>
            <div className='bottom'><Button onClick={this.APIGetclairInfo} loading={this.state.loading}>点击重新获取</Button></div>
          </div>
        case 'finished':
          return <TableTemplate mirrorsafetyClair={mirrorsafetyClair} imageName={imageName} mirrorLayeredinfo={mirrorLayeredinfo} callback={this.sendObjectToTop} tag={tag} inherwidth={inherwidth}/>
        case 'failed':
          return <div className="BaseScanFailed" data-status="clair">
            <div className='top'>扫描失败，请重新扫描</div>
            <Button onClick={this.APIFailedThenScan} loading={this.state.clairFailed}>点击重新获取</Button>
          </div>
        case 'nojob':
        default:
          return <div className="BaseScanFailed" data-status="nojob">
            <div className="top">镜像没有被扫描过</div>
            <Button onClick={this.APIFailedThenScan} loading={this.state.clairFailed}>点击扫描</Button>
          </div>
      }
    }
  }

  handlemirrorScanstatusSatus(status){
    switch(status){
      case 'noresult':
        return <span>镜像没有被扫描过，请点击扫描</span>
      case 'different':
        return <span>镜像扫描结果与上次扫描结果不同</span>
      case 'failed':
        return <span>扫描失败,请重新扫描</span>
      default:
        return <span></span>
    }
  }

  render(){
    const { imageName, tag, mirrorScanstatus, mirrorsafetyClair} = this.props
    let statusCode = 200
    let status = ''
    if(!mirrorScanstatus[imageName] || !mirrorScanstatus[imageName][tag] || !mirrorScanstatus[imageName][tag].result){
      return <div style={{textAlign:'center',paddingTop:'50px'}}><Spin /></div>
    }
    if(mirrorScanstatus[imageName][tag].result.status){
      status = mirrorScanstatus[imageName][tag].result.status
    }
    if(mirrorScanstatus[imageName][tag].result.statusCode == 500){
      statusCode == 500
    }
    if(status == 'different' || status == 'failed'){
      if(!mirrorsafetyClair[imageName] || !mirrorsafetyClair[imageName][tag]){
        return (
          <div className='BaseScanFailed' data-status="scanstatus">
            <div className='top'>{this.handlemirrorScanstatusSatus(status)}</div>
            <Button onClick={this.APIFailedThenScan} loading={this.state.clairFailed}>重新扫描</Button>
          </div>
        )
      }else{
        return (
          <div id="MirrorSafetyBug">
            {statusCode == 500 ? this.NodataTemplateSafetyBug() : this.handleclairStatus()}
          </div>
        )
      }
    }
    return (
      <div id="MirrorSafetyBug">
        {statusCode == 500 ? this.NodataTemplateSafetyBug() : this.handleclairStatus()}
      </div>
    )
  }
}
function mapStateToProps(state,props){
  const { images, entities } = state
  const { imageType } = props
  let mirrorScanUrl = ''
  if (images[imageType][DEFAULT_REGISTRY] && images[imageType][DEFAULT_REGISTRY].server) {
    mirrorScanUrl = images[imageType][DEFAULT_REGISTRY].server
  }
  let mirrorsafetyClair = images.mirrorSafetyClairinfo
  let mirrorLayeredinfo = images.mirrorSafetyLayerinfo
  let mirrorScanstatus = images.mirrorSafetyScanStatus
  let mirrorSafetyScan = images.mirrorSafetyScan
  let cluster_id = entities.current.cluster.clusterID
  return {
    cluster_id,
    mirrorsafetyClair,
    mirrorSafetyScan,
    mirrorScanUrl,
    mirrorLayeredinfo,
    mirrorScanstatus,
  }
}

export default connect(mapStateToProps, {
  loadMirrorSafetyScan,
  loadMirrorSafetyChairinfo
})(MirrorSafetyBug)

//    {/*/!*<div className="safetybugmirrortitleright">*!/*/}
//    {/*/!*<Checkbox style={{float: 'left', width: '120px', marginTop: '6px'}}>只显示可修复</Checkbox>*!/*/}
//    {/*/!*<Input.Group style={{float: 'left', width: '200px'}}>*!/*/}
//    {/*/!*<Select*!/*/}
//    {/*/!*combobox*!/*/}
//    {/*/!*notFoundContent=""*!/*/}
//    {/*/!*filterOption={false}*!/*/}
//    {/*/!*placeholder='Filter Vulnerabilities'*!/*/}
//    {/*/!*style={{width: '180px', height: '30px', borderRadius: '3px 0 0 3px'}}*!/*/}
//    {/*/!*>*!/*/}
//    {/*/!*<Option value="0">请选择1</Option>*!/*/}
//    {/*/!*<Option value="1">请选择1</Option>*!/*/}
//    {/*/!*<Option value="2">请选择2</Option>*!/*/}
//    {/*/!*</Select>*!/*/}
//    {/*/!*<div className="ant-input-group-wrap"*!/*/}
//    {/*/!*style={{display: 'inline-block', verticalAlign: 'top', marginLeft: '5px'}}>*!/*/}
//    {/*/!*<Button>*!/*/}
//    {/*/!*<Icon type="search"/>*!/*/}
//    {/*/!*</Button>*!/*/}
//    {/*/!*</div>*!/*/}
//    {/*/!*</Input.Group>*!/*/}
//    {/*/!*</div>*!/*/}
//  {/*</div>*/}