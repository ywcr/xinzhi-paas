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
  getComponent: (location, cb) => {
    require.ensure([], (require) => {
      cb(null, require('../components/AppModule/AppDetail').default)
    })
  },
}, {
  path: 'app_create',
  getComponent: (location, cb) => {
    require.ensure([], (require) => {
      cb(null, require('../components/AppModule/AppCreate').default)
    })
  },
  indexRoute: {
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/AppModule/AppCreate/CreateModel').default)
      })
    },
  },
  childRoutes: [{
    path: 'fast_create',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/AppModule/AppCreate/ServiceList').default)
      })
    },
  }, {
    path: 'app_store',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/AppModule/AppCreate/AppStore').default)
      })
    },
  }, {
    path: 'compose_file',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/AppModule/AppCreate/ComposeFile').default)
      })
    },
  }]
}, {
  path: 'service',
  indexRoute: {
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/AppModule/AllServiceList').default)
      })
    },
  },
}, {
  path: 'container',
  indexRoute: {
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/ContainerModule/ContainerList').default)
      })
    },
  },
  childRoutes: [{
    path: ':container_name',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/ContainerModule/ContainerDetail').default)
      })
    },
  }]
}, {
  path: 'storage',
  indexRoute: {
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/StorageModule/Storage').default)
      })
    },
  },
  childRoutes: [{
    path: ':pool/:cluster/:storage_name',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/StorageModule/StorageDetail').default)
      })
    },
  }]
}, {
  path: 'configs',
  indexRoute: {
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../components/ServiceConfig/Service').default)
      })
    },
  },
}]

export default appManageRoutes