/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TerminalModal component
 *
 * v0.1 - 2016-10-19
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Icon, Tabs, Modal, Button } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../constants'
import $ from 'jquery'
import './style/TerminalModal.less'

const TabPane = Tabs.TabPane;
const TERM_TIPS_DISABLED = 'term_tips_disabled'

class TerminalModal extends Component {
  constructor(props) {
    super(props);
    this.minWindow = this.minWindow.bind(this);
    this.closeWindow = this.closeWindow.bind(this);
    this.onChangeTabs = this.onChangeTabs.bind(this);
    this.closeTerminal = this.closeTerminal.bind(this);
    this.getTermTipsStatus = this.getTermTipsStatus.bind(this);
    this.disabledTermTips = this.disabledTermTips.bind(this);
    this.closeTip = this.closeTip.bind(this);
    this.state = {
      currentShow: null,
      currentTab: null,
      terminalList: [],
      terminalType: 'normal',
      tipsVisible: true,
    }
  }

  componentWillMount() {
    //set first tab
    let { config } = this.props;
    const scope = this;
    let currentTab = config[0].metadata.name;
    config.map((item) => {
      item.terminalStatus = 'connect'
    })
    this.setState({
      currentTab,
      terminalList: config
    });
    window.webTerminalCallBack = function(name, status){
      let { terminalList } = scope.state;
      terminalList.map((item) => {
        if(item.metadata.name == name) {
          item.terminalStatus = status;
        }
      });
      scope.setState({
        terminalList: terminalList
      });
    }
  }

  componentDidMount() {
    //bind change modal height event
    let doc = $(document);
    let box = $('#TerminalModal .titleBox');
    let bodyHeight = $(document.body)[0].clientHeight;
    let scope = this;
    box.mousedown(function(ee){
      if(ee.currentTarget.className != 'titleBox') {
        return;
      }
      $('#TerminalModal .cover').css('display','block');
      $(document).mousemove(function(e){
        let newHeight = bodyHeight - e.clientY;
        if(newHeight >= bodyHeight) {
          newHeight = bodyHeight
        }
        if(newHeight <= 35) {
          newHeight = 35;
          this.setState({
            terminalType: 'min'
          });
        }
        $('.TerminalLayoutModal').css('cssText','height:' + newHeight + 'px !important;transition:all !important;');
      })
    })
    doc.mouseup(function(){
      $('#TerminalModal .cover').css('display','none');
      doc.unbind('mousemove')
    });
    //change css
    $('.TerminalLayoutModal').parent().parent().find('.ant-modal-mask').css('display', 'none');
    $('.TerminalLayoutModal').parent().css('box-shadow', ' 0 -1px 4px rgba(0,0,0,0.2)');
    $('.TerminalLayoutModal').parent().css('top','auto');
    $('.TerminalLayoutModal').parent().css('right','initial');
    $('.TerminalLayoutModal').parent().css('height','auto');
  }

  minWindow(){
    //this function for minx the modal
    const { terminalType } = this.state;
    if(terminalType == 'normal') {
      $('.TerminalLayoutModal').css('cssText','height:35px !important;transition:all 0.3s !important;');
      this.setState({
        terminalType: 'min'
      })
    } else {
      $('.TerminalLayoutModal').css('cssText','height:550px !important;transition:all 0.3s !important;');
      this.setState({
        terminalType: 'normal'
      })
    }
  }

  closeWindow(e){
    //this function for close the modal
    e.stopPropagation();
    this.setState({closeModal: true})
  }
  closeWindowAction() {
    const _this = this;
    const { scope, config } = _this.props;
    config.map((item, index) => {
      let frameKey = item.metadata.name;
      let frame = window.frames[frameKey]
      if (!frame) {
        return
      }
      if(item.terminalStatus == 'success') {
        if(!!frame.contentWindow) {
          frame.contentWindow.closeTerminal();
        } else {
          frame.closeTerminal()
        }
      }
    })
    _this.setState({
      closeModal:false,
      terminalList: [],
      tipsVisible: true,
    })
    scope.setState({
      TerminalLayoutModal: false,
      currentContainer: []
    });
  }

  componentWillReceiveProps(nextProps) {
    const { config } = nextProps;
    const { terminalList } = this.state;
    let newList = []
    config.map((item) => {
      let existFlag = false;
      terminalList.map((oldItem) => {
        if(item.metadata.name == oldItem.metadata.name) {
          item.terminalStatus = oldItem.terminalStatus;
          newList.push(item);
          existFlag = true;
        }
      });
      if(!existFlag) {
        item.terminalStatus = 'connect';
        newList.push(item);
      }
    })
    this.setState({
      terminalList: newList,
    })
    if(config.length > 0) {
      let currentTab = config[config.length -1].metadata.name;
      this.setState({
        currentTab: currentTab
      });
    }
    //when the modal is min(35px height), user open an new one the modal will be error
    //so we change the modal height to show the terminal
    let terminal = document.getElementsByClassName('TerminalLayoutModal')[0];
    if(terminal.offsetHeight == 35) {
      terminal.style.height = '550px'
      this.setState({
        terminalType: 'normal'
      })
    }
  }

  onChangeTabs(e) {
    //this function for user change the tab and the iframe focus will be change
    this.setState({
      currentTab: e
    });
    let frame = window.frames[e]
    if (!frame) {
      return
    }
    if(!!frame.contentWindow) {
      frame.contentWindow.focusTerminal();
    } else {
      frame.focusTerminal();
    }
  }

  closeTerminal() {
    //this function for user close the current terminal
    //and we will ask user make sure to close the terminal or not
    const _this = this;
    const config = this.state.item
    const { scope } = _this.props;
    const { currentContainer } = scope.state;
    let newList = [];
    currentContainer.map((item) => {
      if(item.metadata.name != config.metadata.name) {
        newList.push(item);
      }
    });
    scope.setState({
      currentContainer: newList
    });
    _this.setState({
      terminalList: newList,
      onlyModal: false,
    })
    let frameKey = config.metadata.name;
    let frame = window.frames[frameKey]
    if(config.terminalStatus == 'success') {
      if (frame) {
        if(!!frame.contentWindow) {
          frame.contentWindow.closeTerminal();
        } else {
          frame.closeTerminal()
        }
      }
    }
    if(newList.length == 0) {
      scope.setState({
        TerminalLayoutModal: false
      });
    }
  }

  getTermTipsStatus() {
    if (!window.localStorage) {
      return false
    }
    const { loginUser } = this.props
    const disabledTermTipsNames = window.localStorage.getItem(TERM_TIPS_DISABLED)
    if (disabledTermTipsNames.indexOf(loginUser.userName)) {
      return true
    }
    return false
  }

  disabledTermTips() {
    this.setState({
      tipsVisible: false,
    })
    if (!window.localStorage) {
      return false
    }
    const { loginUser } = this.props
    let disabledTermTipsNames = window.localStorage.getItem(TERM_TIPS_DISABLED)
    if (disabledTermTipsNames) {
      disabledTermTipsNames = disabledTermTipsNames.split(',')
    } else {
      disabledTermTipsNames = []
    }
    disabledTermTipsNames.push(loginUser.userName)
    window.localStorage.setItem(TERM_TIPS_DISABLED, disabledTermTipsNames.join(','))
  }

  closeTip() {
    this.setState({
      tipsVisible: false
    })
  }

  render() {
    const { scope } = this.props;
    let config = this.state.terminalList;
    const _this = this;
    const operaBox = (
      <div className='operaBox'>
        <svg onClick={this.minWindow} >
          <use xlinkHref={this.state.terminalType == 'normal' ? '#minwindow' : '#maxwindow'} />
        </svg>
        <Icon type='cross' onClick={this.closeWindow} />
      </div>
    )
    let tabsShow = (
      <Tabs
        tabBarExtraContent={operaBox}
        onChange={this.onChangeTabs}
        activeKey={this.state.currentTab}
        size='small'>
        {
          config.map((item, index) => {
            const titleTab = (
              <div>
                <span>{item.metadata.name}</span>
                <Icon type='cross' onClick={()=> this.setState({onlyModal: true, item: item, terminalIndex: index})}/>
              </div>
            )
            return (
              <TabPane tab={titleTab} key={item.metadata.name}>
                <div>
                  {
                    (item.terminalStatus === 'success' && this.state.tipsVisible) &&
                    <div className="tips">
                      <Icon type="info-circle-o" /> 由于容器本身无状态且不可变的特性，以防容器销毁后，对容器内部做的改动无法保留，
                      <span className="important">建议不要直接修改容器中内容（有状态容器中存储映射出来的目录除外）</span>
                      <div className="btns">
                        <Button key="back" type="primary" onClick={this.closeTip}>知道了</Button>
                        <Button key="submit" onClick={this.disabledTermTips}>
                          不再提醒
                        </Button>
                      </div>
                    </div>
                  }
                  {
                    item.terminalStatus == 'connect' ? [
                      <div className='webLoadingBox' key={'webLoadingBox' + index}>
                        <span className='terIcon'></span>
                        <span className='terIcon'></span>
                        <span className='terIcon'></span>
                        <span>终端链接中...</span>
                      </div>
                    ] : null
                  }
                  <iframe id={item.metadata.name} key={'iframe' + index}
                    src={`/js/container_terminal.html?namespace=${item.metadata.namespace}&pod=${item.metadata.name}&cluster=${this.props.cluster}&_=20170509`} />
                  {
                    item.terminalStatus == 'timeout' ? [
                      <div className='webLoadingBox' key={'webLoadingBox' + index}>
                        <span>连接超时了</span>
                      </div>
                    ] : null
                  }
                </div>
              </TabPane>
            )
          })
        }
      </Tabs>
    )
    return (
      <div id='TerminalModal'>
        <div className='titleBox'></div>
        <div className='cover'></div>
        {tabsShow}
        {/* close all modal */}
        <Modal title="关闭终端链接操作" visible={this.state.closeModal}
          onOk={()=> this.closeWindowAction()} onCancel={()=> this.setState({closeModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要关闭所有终端链接么?</div>
        </Modal>
        {/* close only modal */}
        <Modal title="关闭终端链接操作" visible={this.state.onlyModal}
          onOk={()=> this.closeTerminal()} onCancel={()=> this.setState({onlyModal: false})}
          >
          <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要关闭此终端链接?</div>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { current, loginUser } = state.entities

  return {
    cluster: current.cluster.clusterID,
    loginUser: loginUser.info,
  }
}

TerminalModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(TerminalModal, {
  withRef: true,
}));

