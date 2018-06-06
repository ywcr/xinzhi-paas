/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Resource select
 *
 * v0.1 - 2017-05-08
 * @author Zhangpc
 */

import React, { PropTypes, Component } from 'react'
import { Input, Button, Icon, InputNumber, Form  } from 'antd'
import {
  RESOURCES_MEMORY_MAX,
  RESOURCES_MEMORY_MIN,
  RESOURCES_MEMORY_STEP,
  RESOURCES_CPU_MAX,
  RESOURCES_CPU_STEP,
  RESOURCES_CPU_MIN,
  RESOURCES_CPU_DEFAULT,
  RESOURCES_DIY,
} from '../../constants'
import './style/index.less'

const FormItem = Form.Item

export default class ResourceSelect extends Component {
  static propTypes = {
    standardFlag: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super()
    this.selectResourceType = this.selectResourceType.bind(this)
    const { resourceType, DIYMemory, DIYCPU } = props
    this.state = {
      resourceType: resourceType || 512,
      DIYMemory: DIYMemory || RESOURCES_MEMORY_MIN,
      DIYCPU: DIYCPU || RESOURCES_CPU_DEFAULT,
    }
  }

  componentWillMount() {
    const { onChange } = this.props
    onChange(this.state)
  }

  componentWillReceiveProps(nextProps) {
    const { resourceType } = nextProps
    if (resourceType === this.props.resourceType) {
      return
    }
    this.setState({
      resourceType: resourceType || 512,
    })
  }

  selectResourceType(type) {
    this.setState({
      resourceType: type
    })
    const { DIYMemory, DIYCPU } = this.state
    this.props.onChange({
      resourceType: type,
    })
  }

  render() {
    const { standardFlag } = this.props
    const { resourceType, DIYMemory, DIYCPU } = this.state
    return (
      <div className="resourceSelect">
        <ul className="resourceList">
          {/*<li className="resourceDetail">
            <Button type={resourceType == 256 ? "primary" : "ghost"}
              onClick={() => this.selectResourceType(256)}>
              <div className="topBox">
                1X
              </div>
              <div className="bottomBox">
                <span>256M&nbsp;内存</span><br />
                <span>1CPU&nbsp;(共享)</span>
              </div>
            </Button>
          </li>*/}
          <li className="resourceDetail">
            <Button type={resourceType == 512 ? "primary" : "ghost"}
              onClick={() => this.selectResourceType(512)}>
              <div className="topBox">
                2X
              </div>
              <div className="bottomBox">
                <span>512M&nbsp;内存</span><br />
                <span>1CPU&nbsp;(共享)</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          <li className="resourceDetail">
            <Button type={resourceType == 1024 ? "primary" : "ghost"}
              onClick={() => this.selectResourceType(1024)}>
              <div className="topBox">
                4X
              </div>
              <div className="bottomBox">
                <span>1GB&nbsp;内存</span><br />
                <span>1CPU&nbsp;(共享)</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          <li className="resourceDetail">
            <Button type={resourceType == 2048 ? "primary" : "ghost"}
              onClick={() => this.selectResourceType(2048)}>
              <div className="topBox">
                8X
              </div>
              <div className="bottomBox">
                <span>2GB&nbsp;内存</span><br />
                <span>1CPU&nbsp;(共享)</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          <li className="resourceDetail">
            <Button type={resourceType == 4096 ? "primary" : "ghost"}
              onClick={() => this.selectResourceType(4096)}>
              <div className="topBox">
                16X
              </div>
              <div className="bottomBox">
                <span>4GB&nbsp;内存</span><br />
                <span>1CPU</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          <li className="resourceDetail">
            <Button type={resourceType == 8192 ? "primary" : "ghost"}
              onClick={() => this.selectResourceType(8192)}>
              <div className="topBox">
                32X
              </div>
              <div className="bottomBox">
                <span>8GB&nbsp;内存</span><br />
                <span>2CPU</span>
                <div className="triangle"></div>
                <Icon type="check" />
              </div>
            </Button>
          </li>
          {
            !standardFlag &&
            <li className="resourceDetail DIY">
              <div
                className={
                  resourceType == RESOURCES_DIY
                  ? "btn ant-btn-primary"
                  : "btn ant-btn-ghost"
                }
                onClick={()=> this.selectResourceType(RESOURCES_DIY)}>
                <div className="topBox">
                  自定义
              </div>
                <div className="bottomBox">
                  <div className="DIYKey">
                    <FormItem>
                      <InputNumber
                        {...this.props.DIYMemoryProps}
                        step={RESOURCES_MEMORY_STEP}
                        min={RESOURCES_MEMORY_MIN}
                        max={RESOURCES_MEMORY_MAX}
                        size="default"
                      />
                      MB&nbsp;内存
                    </FormItem>
                  </div>
                  <div className="DIYKey">
                    <FormItem>
                      <InputNumber
                        {...this.props.DIYCPUProps}
                        step={RESOURCES_CPU_STEP}
                        min={RESOURCES_CPU_MIN}
                        max={RESOURCES_CPU_MAX}
                        size="default"
                      />
                      核 CPU
                    </FormItem>
                  </div>
                  <div className="triangle"></div>
                  <Icon type="check" />
                </div>
              </div>
            </li>
          }
        </ul>
      </div>
    )
  }
}
