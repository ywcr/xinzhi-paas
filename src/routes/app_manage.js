/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * App manage routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const appManageRoutes = [{
  path: 'detail/:app_name',
  component: require('../components/AppModule/AppDetail').default,
}, {
  path: 'app_create',
  component: require('../components/AppModule/AppCreate').default,
  indexRoute: {
    component: require('../components/AppModule/AppCreate/CreateModel').default,
  },
  childRoutes: [{
    path: 'app_store',
    component: require('../components/AppModule/AppCreate/AppStore').default,
  }, {
    path: 'compose_file',
    component: require('../components/AppModule/AppCreate/ComposeFile').default,
  }]
},{
  path: 'app_create/quick_create',
  component: require('../components/AppModule/QuickCreateApp').default,
}, {
  path: 'service',
  indexRoute: {
    component: require('../components/AppModule/AllServiceList').default,
  },
}, {
  path: 'container',
  indexRoute: {
    component: require('../components/ContainerModule/ContainerList').default,
  },
  childRoutes: [{
    path: ':container_name',
    component: require('../components/ContainerModule/ContainerDetail').default,
  }]
}, {
  path: 'storage',
  indexRoute: {
    component: require('../components/StorageModule/Storage').default,
  },
  childRoutes: [{
    path: ':pool/:cluster/:storage_name',
    component: require('../components/StorageModule/StorageDetail').default,
  }]
}, {
  path: 'configs',
  indexRoute: {
    component: require('../components/ServiceConfig/Service').default,
  },
}, {
  path: 'snapshot',
  indexRoute: {
    component: require('../components/AppModule/AppSnapshot').default,
  },
}, {
  path: 'network_isolation',
  indexRoute: {
    component: require('../components/AppModule/NetworkIsolation').default,
  },
}]

export default appManageRoutes