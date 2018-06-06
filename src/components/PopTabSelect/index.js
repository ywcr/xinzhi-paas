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

import Select from './Select'
import Option from './Option'
import OptionGroup from './OptionGroup'
import Tab from './Tab'
Select.Option = Option
Select.OptionGroup = OptionGroup
Select.Tab = Tab
export { Option, OptionGroup, Tab }
export default Select
