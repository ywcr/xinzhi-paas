/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App routes
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import React from 'react'
import Login from './containers/Login'
import { Route, IndexRoute } from 'react-router'
import App from './containers/App'
import IndexPage from './containers/IndexPage'
import ErrorPage from './containers/ErrorPage'
/*-------------------App_manage Module Start-----------------------*/
/*-------------------Appliaction Start-----------------------------*/
import Application from './containers/Application'
import AppList from './components/AppModule/AppList'
import AppDetail from './components/AppModule/AppDetail'
import AppCreate from './components/AppModule/AppCreate'
import Storage from './components/StorageModule/Storage'
import StorageDetail from './components/StorageModule/StorageDetail'
import Service from './components/ServiceConfig/Service'
/*---------AppCreate Start---------*/
import AppCreateSelectModel from './components/AppModule/AppCreate/CreateModel'
import AppCreateAppStore from './components/AppModule/AppCreate/AppStore'
import AppCreateServiceList from './components/AppModule/AppCreate/ServiceList'
import AppCreateComposeFile from './components/AppModule/AppCreate/ComposeFile'
/*---------AppCreate Stop---------*/
/*-------------------Application stop------------------------------*/
/*-------------------Container start-------------------------------*/
import ContainerList from './components/ContainerModule/ContainerList'
import ContainerDetail from './components/ContainerModule/ContainerDetail'
/*-------------------Container stop--------------------------------*/
/*-----------Service start---------------*/
import ServiceList from './components/AppModule/AllServiceList.js'
/*-----------Service end-----------------*/
/*-------------------App_manage Module Stop------------------------*/
/*-------------------App_center Module Start-----------------------*/
import AppCenter from './containers/AppCenter'
import ImageCenter from './components/AppCenter'
import ImageStore from './components/AppCenter/ImageStore'
import Stack from './components/AppCenter/Stack'
/*-------------------App_center Module Stop------------------------*/
/*-------------------database & cache Module Start------------------------*/
import Database from './containers/Database'
import MysqlCluster from './components/DatabaseCache/MysqlCluster'
import RdbsCluster from './components/DatabaseCache/MongoDB/MongoDBCluster'
import RedisCluster from './components/DatabaseCache/RedisCluster'
import DatabaseStorage from './components/DatabaseCache/DatabaseStorage'
/*-------------------database & cache Module Stop------------------------*/
/*-------------------CI/CD Module Start----------------------------------*/
import CICD from './containers/CICD'
import CodeStore from './components/CICDModule/CodeStore'
import CodeRepo from './components/CICDModule/CodeStore/CodeRepo'
import DockerFile from './components/CICDModule/DockerFile'
import TenxFlow from './components/CICDModule/TenxFlow'
import TenxFlowBuild from './components/CICDModule/TenxFlow/TenxFlowDetail'
/*-------------------CI/CD Module Stop-----------------------------------*/
/*-------------------Setting Module Start----------------------------------*/
import Setting from './containers/Setting'
import UserInfo from './components/SettingModal/UserInfo'
import MemberManage from './components/SettingModal/MemberManage'
import TeamManage from './components/SettingModal/TeamManage'
import TeamDetail from './components/SettingModal/TeamDetail'
import API from './components/SettingModal/API'
import License from './components/SettingModal/License'
import Version from './components/SettingModal/Version'
/*-------------------Setting Module Stop-----------------------------------*/
/*-------------------Manage & Monitor Module Start--------------------------------*/
import ManageMonitor from './containers/ManageMonitor'
import OperationalAudit from './components/ManageMonitor/OperationalAudit'
import QueryLog from './components/ManageMonitor/QueryLog'
import MonitorModule from './components/ManageMonitor/MonitorModule'
/*-------------------Manage & Monitor Module Stop---------------------------------*/
/*-------------------Integration Module Start---------------------------------*/
import Integration from './containers/Integration'
import IntegrationList from './components/IntegrationModule'
/*-------------------Integration Module Stop-----------*----------------------*/

export default (
  <Route>
    <Route path="/login" component={Login} />
    <Route path="/" component={App}>
      <IndexRoute component={IndexPage} />
      <Route path="app_manage" component={Application}>
        <IndexRoute component={AppList} />
        <Route path="detail/:app_name" component={AppDetail} />
        <Route path="app_create" component={AppCreate}>
          <IndexRoute component={AppCreateSelectModel} />
          <Route path="fast_create" component={AppCreateServiceList} />
          <Route path="app_store" component={AppCreateAppStore} />
          <Route path="compose_file" component={AppCreateComposeFile} />
        </Route>
        <Route path="service">
          <IndexRoute component={ServiceList} />
        </Route>
        <Route path="container">
          <IndexRoute component={ContainerList} />
          <Route path=":container_name" component={ContainerDetail} />
        </Route>
        <Route path="storage">
          <IndexRoute component={Storage} />
          <Route path=":pool/:cluster/:storage_name" component={StorageDetail} />
        </Route>
        <Route path="configs">
          <IndexRoute component={Service} />
        </Route>
      </Route>
      <Route path="app_center" component={AppCenter}>
        <IndexRoute component={ImageCenter} />
        <Route path="image_store" component={ImageStore} />
        <Route path="stack_center" component={Stack} />
      </Route>
      <Route path="database_cache" component={Database}>
        <IndexRoute component={MysqlCluster} />
        <Route path="mongo_cluster" component={MongoCluster} />
        <Route path="rdbs_cluster" component={RdbsCluster} />
        <Route path="redis_cluster" component={RedisCluster} />
        <Route path="database_storage" component={DatabaseStorage} />
      </Route>
      <Route path="ci_cd" component={CICD}>
        <IndexRoute component={CodeStore} />
        <Route path="coderepo" component={CodeRepo} />
        <Route path="enn_flow" >
          <IndexRoute component={TenxFlow} />
          <Route path="enn_flow_build" component={TenxFlowBuild} />
        </Route>
        <Route path="docker_file" component={DockerFile} />
      </Route>
      <Route path="setting" component={Setting}>
        <IndexRoute component={UserInfo} />
        <Route path="member" component={MemberManage} />
        <Route path="team" component={TeamManage} />
        <Route path="team/:team_name/:team_id" component={TeamDetail} />
        <Route path="API" component={API} />
        <Route path="license" component={License} />
        <Route path="version" component={Version} />
        <Route path="user/:user_id" component={UserInfo} />
      </Route>
      <Route path="manange_monitor" component={ManageMonitor}>
        <IndexRoute component={OperationalAudit} />
        <Route path="query_log" component={QueryLog} />
        <Route path="monitor" component={MonitorModule} />
      </Route>
      <Route path="integration" component={Integration}>
        <IndexRoute component={IntegrationList} />
      </Route>
      <Route path="*" component={ErrorPage} />
    </Route>
  </Route>
)
