import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Breadcrumb } from 'antd'
import "./style/IndexPage.less"
import { setCurrent, loadLoginUserDetail } from '../../../actions/entities'
import Admin from '../../../components/Home/Standard/Admin'
import Ordinary from '../../../components/Home/Standard/Ordinary'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../constants'
import Footer from '../../../components/Home/Footer'
import Title from '../../../components/Title'

class IndexPage extends Component {
  constructor(props) {
    super(props)

  }
  componentDidMount(){
    const {
      loadTeamClustersList,
      setCurrent,
      loadLoginUserDetail,
      loginUser,
    } = this.props
    if (!loginUser.info.userName) {
      loadLoginUserDetail()
    }
  }
  render() {
    const { loginUser,current } = this.props
    if(current.space.spaceName){
      if((loginUser.info.role === ROLE_TEAM_ADMIN || loginUser.info.role === ROLE_SYS_ADMIN) && current.space.namespace !== 'default'){
        return (
          <div id="IndexPage">
            <Title title="总览" />
            <Admin spaceName={current.space.spaceName}/>
            <Ordinary spaceName={current.space.spaceName} clusterName={current.cluster.clusterName}/>
            <Footer />
          </div>
        )
      }
    }
    return (
      <div id="IndexPage">
        <Title title="总览" />
        <Ordinary spaceName={current.space.spaceName} clusterName={current.cluster.clusterName}/>
        <Footer />
      </div>
    )
  }
}

IndexPage.propTypes = {

}

function mapStateToProps(state,props) {
  const { current, loginUser } = state.entities
  return {
    current,
    loginUser,
  }
}
export default connect (mapStateToProps,{
  setCurrent,
  loadLoginUserDetail,
})(IndexPage)
/*function mapStateToProps(state, props) {
  const { login, name } = props.params
  const {
    pagination: { stargazersByRepo },
    entities: { users, repos }
  } = state

  const fullName = `${login}/${name}`
  const stargazersPagination = stargazersByRepo[fullName] || { ids: [] }
  const stargazers = stargazersPagination.ids.map(id => users[id])

  return {
    fullName,
    name,
    stargazers,
    stargazersPagination,
    repo: repos[fullName],
    owner: users[login]
  }
}

export default connect(mapStateToProps, {
  loadRepo,
  loadStargazers
})(IndexPage)*/
