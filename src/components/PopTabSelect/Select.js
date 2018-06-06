/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Tab select
 *
 * v0.1 - 2017-04-18
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Input, Button, Popover, Menu, Tabs, Spin, Row, Col, Tooltip } from 'antd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { genRandomString } from '../../common/tools'
import { loadProjectMembers } from '../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../constants'
import NotificationHandler from '../../common/notification_handler'


import './style/Select.less'

const ButtonGroup = Button.Group
const MenuItem = Menu.Item
const MenuGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane
let notification = new NotificationHandler()

class PopTabSelect extends Component {
    static propTypes = {
        targetElement: PropTypes.element,
        value: PropTypes.string,
        placeholder: PropTypes.string,
        options: PropTypes.node,
        onChange: PropTypes.func,
        getTooltipContainer: PropTypes.func,
        notFoundContent: PropTypes.string,
        loading: PropTypes.bool,
        isShowBuildBtn: PropTypes.bool,
        placement: PropTypes.string,
    }

    static defaultProps = {
        notFoundContent: '无记录',
        isShowBuildBtn: false,
        placement: 'top',
    }

    constructor(props) {
        super()
        this.popSelectId = `popTabSelect-${genRandomString(6)}`
        this.searchInputId = `popTabSearch-${genRandomString(6)}`
        this.handleVisibleChange = this.handleVisibleChange.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
        this.filterOption = this.filterOption.bind(this)
        this.handleSelect = this.handleSelect.bind(this)
        this.renderOptions = this.renderOptions.bind(this)
        this.renderOptionsFromChildren = this.renderOptionsFromChildren.bind(this)
        this.handleBuild = this.handleBuild.bind(this)
        this.state = {
            visible: false,
            inputValue: '',
            selectValue: '',
            projectName: [],
            project_delete: []
        }
    }

    focusInput(id) {
        const _input = document.getElementById(id)
        _input && _input.focus()
    }

    handleVisibleChange(visible) {
        const self = this;
        self.setState({ visible }, () => {
            if (visible) {
                self.focusInput(self.searchInputId)
            }
        })
    }

    handleSearch(e) {
        this.setState({
            inputValue: e.target.value,
        })
    }

    filterOption(value) {
        if (!value) {
            return false
        }
        return value.indexOf(this.state.inputValue) > -1
    }

    getLableFromChild(child) {
        const props = child.props
        if (typeof props.children === 'string') {
            return props.children
        }
        return props.label
    }

    handleSelect(obj, tabKey) {
        const { onChange } = this.props
        const { key, item } = obj
        let label = this.getLableFromChild(item)
        let groupKey = item.props.groupKey
        if (!label) {
            label = key
        }
        if (this.state.selectValue === label) {
            this.setState({
                visible: false,
            })
            return
        }
        onChange && onChange.apply(onChange, [key, tabKey, groupKey])
        this.setState({
            selectValue: label,
            visible: false,
        })
    }

    renderOptions() {
        return this.renderOptionsFromChildren(this.props.children, true)
    }

    renderOptionsFromChildren(children, showNotFound, groupKey) {
        const _options = []
        if (!children) {
            return _options
        }
        React.Children.forEach(children, (child) => {
            if (child.type.isTab) {
                this.isTab = true
                const innerMenus = this.renderOptionsFromChildren(child.props.children, true)
                let title = child.props.title
                let key = child.key
                if (!key && typeof title === 'string') {
                    key = title
                } else if (!title && key) {
                    title = key
                }
                _options.push(
                    <TabPane key={key} tab={title}>
                        <Menu onClick={(obj) => this.handleSelect(obj, key)}>{innerMenus}</Menu>
                    </TabPane>
                )
                return
            }
            if (child.type.isSelectOptionGroup) {
                this.isSelectOptionGroup = true
                let label = child.props.label
                let key = child.key
                if (!key && typeof label === 'string') {
                    key = label
                } else if (!label && key) {
                    label = key
                }
                const innerItems = this.renderOptionsFromChildren(child.props.children, true, key)
                if (innerItems.length) {
                    _options.push(
                        <MenuGroup key={key} title={label}>
                            {innerItems}
                        </MenuGroup>
                    )
                }
                return
            }
            let childValue = child.props.value || child.key
            let childLabel = child.props.label
            if (typeof child.props.children === 'string') {
                childLabel = child.props.children
            }

            if (this.filterOption(childValue)) {
                _options.push(
                    <Menu.Item key={childValue || childLabel} groupKey={groupKey} {...child.props}>
                        {childLabel || childValue}
                    </Menu.Item>
                )
            }

        })
        if (!_options.length && showNotFound) {
            return (
                <Menu.Item key="NOT_FOUND" value="NOT_FOUND" disabled={true}>
                    {this.props.notFoundContent}
                </Menu.Item>
            )
        }
        return _options
    }

    renderContent() {
        const { options, loading } = this.props
        const _options = this.renderOptions() || options
        if (loading) {
            return (
                <div className='popTabSelectLoading'>
                    <Spin />
                </div>
            )
        }
        if (this.isTab) {
            return (
                <Tabs>{_options}</Tabs>
            )
        }
        return (
            <Menu onClick={this.handleSelect}>{_options}</Menu>
        )
    }

    handleBuild() {
        const { inputValue } = this.state
        if (!inputValue) {
            this.focusInput(this.searchInputId)
            return
        }
        const { onChange } = this.props
        onChange && onChange.apply(onChange, [inputValue, 'inputBuild'])
    }

    render() {
        const {
            targetElement,
            value,
            placeholder,
            isShowBuildBtn,
            placement,
        } = this.props
        let {
            getTooltipContainer,
        } = this.props
        const {
            visible,
            selectValue,
        } = this.state
        const classArrow = classNames({
            'ant-cascader-picker-arrow': true,
            'ant-cascader-picker-arrow-expand': visible,
            'anticon': true,
            'anticon-down': true,
        })
        let colSpan = {
            input: 20,
            btn: 4
        }
        if (isShowBuildBtn) {
            colSpan = {
                input: 16,
                btn: 8
            }
        }
        const content = (
            <div className="popTabSelectContent">
                <div className="search">
                    <Row>
                        <Col span={colSpan.input}>
                            <Input
                                id={this.searchInputId}
                                onPressEnter={this.handleSearch}
                                placeholder={placeholder}
                                onChange={this.handleSearch} />
                        </Col>
                        <Col span={colSpan.btn} className="btns">
                            <ButtonGroup>
                                <Tooltip title="搜索">
                                    <Button icon="search" />
                                </Tooltip>
                                {
                                    isShowBuildBtn && (
                                        <Tooltip title="立即构建">
                                            <Button icon="check" onClick={this.handleBuild} />
                                        </Tooltip>
                                    )
                                }
                            </ButtonGroup>
                        </Col>
                    </Row>
                </div>
                <div className="options">
                    {this.renderContent()}
                </div>
            </div>
        )
        if (!getTooltipContainer) {
            getTooltipContainer = () => document.getElementById(this.popSelectId)
        }
        return (
            <div className="popTabSelect" id={this.popSelectId}>
                <Popover
                    content={content}
                    trigger="click"
                    overlayClassName="popTabSelectCard"
                    getTooltipContainer={getTooltipContainer}
                    visible={visible}
                    onVisibleChange={this.handleVisibleChange}
                    placement={placement}
                >
                    {
                        targetElement || (
                            <span className="ant-cascader-picker">
                                <span className="ant-input-wrapper">
                                    <input type="text" className="ant-input ant-cascader-input"
                                        readonly
                                        style={{ marginTop: '0px' }}
                                    />
                                </span>
                                {/*<span className="ant-cascader-picker-label">{value || selectValue}</span>*/}
                                <span className="ant-cascader-picker-label">{selectValue || value}</span>
                                <i className={classArrow}></i>
                            </span>
                        )
                    }
                </Popover>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { harbor, entities } = state
    return {
        projectDetail: harbor.detail.data || {},
        projectMembers: harbor.members || {},
        loginUser: entities.loginUser.info,
        registry: DEFAULT_REGISTRY
    }
}

export default connect(mapStateToProps, {
    loadProjectMembers
})(PopTabSelect)