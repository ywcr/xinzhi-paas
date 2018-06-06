import React,{Component} from 'react'
import { Modal } from 'antd'
import MemberTransfer from '../../MemberTransfer'
import { connect } from 'react-redux'
import { ROLE_TEAM_ADMIN, ROLE_SYS_ADMIN } from '../../../../../constants'
import NotificationHandler from '../../../../common/notification_handler'
import { loadTeamUserList,addTeamusers,getSpaceList,setSpaceList,deleteSpaceList,loadTeamAllUserList } from '../../../../actions/team'

class UserControl extends Component{
    constructor(props){
        super(props)
        this.handleNewMemberCancel = this.handleNewMemberCancel.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleNewMemberOk = this.handleNewMemberOk.bind(this)
        this.state={
            teamUserList:[],
            addKeys:[],
            deleteKeys:[],
            sortUser: "a,userName"
        }
    }
    componentWillMount(){
        const { loadTeamUserList,teamID,getSpaceList,spaceID,loadTeamAllUserList } = this.props;
        if(spaceID){
            getSpaceList(teamID,spaceID,{
                success:{
                    func:(data)=>{
                        const userList = [];
                        if(data.data.users.length>0){
                            data.data.users.forEach((item)=>{
                                if(item.role != ROLE_SYS_ADMIN){
                                    userList.push(item.userID)
                                }
                            })
                            this.setState({
                                teamUserList:userList
                            })
                        }
                    }
                }
            })
        }
    }
    handleNewMemberOk() {
        const { setSpaceList,addTeamusers, teamID, loadTeamUserList,scope,getSpaceList,spaceID,deleteSpaceList,loadTeamAllUserList } = this.props
        let nofity = new NotificationHandler()
        const { addKeys,deleteKeys, sortUser } = this.state
        const _this = this;
        const newtargetKeys = addKeys.map(item => {
            return {
                userID: item
            }
        })
        const deleteList = deleteKeys.map(item => {
            return {
                userID: item
            }
        })
        const success = ()=>{
            scope.setState({
                addMember: false,
                spaceID2:''
            })
            _this.setState({
                addKeys: [],
                deleteKeys:[]
            })
        }
        if(spaceID){
            if(deleteList.length>0){
                deleteSpaceList(teamID,spaceID,{ "users": deleteList },{
                    success: {
                        func: (data) => {
                            success();
                        },
                        isAsync: true
                    },
                    failed: {
                        func: (err) => {
                        
                        }
                    }
                })
            }
            if(newtargetKeys.length>0){
                setSpaceList(teamID,spaceID,{ "users": newtargetKeys },{
                    success: {
                        func: (data) => {
                            success();
                        },
                        isAsync: true
                    },
                    failed: {
                        func: (err) => {
                        }
                    }
                })
            }
            new NotificationHandler().success("用户修改成功")
        }else{
            addTeamusers(teamID,
                { "users": newtargetKeys }
            , {
                success: {
                func: () => {
                    new NotificationHandler().success("添加用户成功")
                    loadTeamUserList(teamID, {
                        sort: sortUser,
                    })
                    loadTeamAllUserList(teamID, { sort: 'a,userName', size: 1000, page: 1 })
                    success();
                },
                isAsync: true
                },
                failed: {
                func: (err) => {
                }
                }
            })
        }
    }
    handleNewMemberCancel(e) {
        this.props.scope.setState({
            addMember: false,
            spaceID2:'',
        })
        this.setState({
            teamUserList: this.props.spaceID?this.props.teamUserIDList:[]
        })
    }
    handleChange(targetKeys, direction, moveKeys) {
        if(direction == 'left'){
            let addKeys = this.state.addKeys.filter((item)=>{ // 修改添加用户列表
                if(!moveKeys.includes(item)){
                    return item
                }
            })
            let teamUserList = this.state.teamUserList.filter((item)=>{ // 用户展示列表
                if(!moveKeys.includes(item)){
                    return item
                }
            })
            this.setState({ deleteKeys:this.state.deleteKeys.concat(moveKeys),addKeys,teamUserList})
        }else{
            let deleteKeys = this.state.deleteKeys.filter((item)=>{ // 修改删除用户列表
                if(!moveKeys.includes(item)){
                    return item
                }
            })
            this.setState({ addKeys:this.state.addKeys.concat(moveKeys),deleteKeys,teamUserList:this.state.teamUserList.concat(moveKeys)})
        }
    }
    render(){
        const { scope,addMember,userList,spaceID,teamAllUserList,teamAllUserIDList } = this.props
        return (<Modal className="className" title="成员管理"
            visible={addMember}
            onOk={this.handleNewMemberOk}
            onCancel={this.handleNewMemberCancel}
            width="660px"
            wrapClassName="newMemberModal"
        >
            <MemberTransfer onChange={this.handleChange}
            userList={userList}
            spaceID={spaceID}
            teamAllUserList={teamAllUserList}
            teamAllUserIDList={teamAllUserIDList}
            UserIDList={this.state.teamUserList} />
        </Modal>)
    }
}

function mapStateToProp(state,props){
    const team = state.team;
    let teamUserIDList = []
    if(team.spaceUserList){
        const list = team.spaceUserList.list.users
        if(list.length>0){
            list.map((item, index) => {
                if(item.role != ROLE_SYS_ADMIN){
                    teamUserIDList.push(item.userID)
                }
            })
        }
    }
    return {
        teamUserIDList,
    }
}
export default connect(mapStateToProp,{
    loadTeamUserList,
    addTeamusers,
    getSpaceList,
    setSpaceList,
    deleteSpaceList,
    loadTeamAllUserList
})(UserControl)
