import React from 'react'

export default class OptionGroup extends React.Component {
  static propTypes = {
    label: React.PropTypes.string,
  }

  static isSelectOptionGroup = true
}
