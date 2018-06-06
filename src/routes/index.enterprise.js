/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Root routes - enterprise
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const rootRoutes = {
  childRoutes: [
    {
    path: '/password',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Activation/Password').default)
      })
    }
  },
  {
    path: '/activation',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Activation').default)
      })
    }
  },
  {
    path: '/login',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Login/Enterprise').default)
      })
    },
  },{
    path: '/signup',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Register').default)
      })
    },
  },{
    path: '/rpw',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/ResetPassWord').default)
      })
    },
  },{
    path: '/teams/invite',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/Invite').default)
      })
    },
  },{
    path: '/notfound',
    component: require('../containers/ErrorPage').default,
  },{
      path:'/alerts/invitations/join',
      component: require('../containers/Template').default
  },{
    path: '/',
    component: require('../containers/App/Enterprise').default,
    indexRoute: {
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/IndexPage/Enterprise').default)
        })
      },
    },
    childRoutes: [{
      path: 'quickentry',
      component: require('../components/QuickEntry').default,
    },{
      path: 'app_manage',
      component: require('../containers/Application').default,
      indexRoute: {
        component: require('../components/AppModule/AppList').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./app_manage').default)
        })
      },
    }, {
      path: 'app_center',
      component: require('../containers/AppCenter').default,
      indexRoute: {
        component: require('../components/AppCenter/Item').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./app_center').default)
        })
      },
    }, {
      path: 'database_cache',
      component: require('../containers/Database').default,
      indexRoute: {
        component: require('../components/DatabaseCache/Rdbs/RdbsCluster').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./database_cache').default)
        })
      },
    }, {
      path: 'ci_cd',
      component: require('../containers/CICD').default,
      indexRoute: {
        component: require('../components/CICDModule/CodeStore').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./ci_cd').default)
        })
      },
    }, {
      path: 'account',
      component: require('../containers/Account').default,
      indexRoute: {
        component: require('../components/AccountModal/UserInfo').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./account').default)
        })
      },
    }, {
      path: 'setting',
      component: require('../containers/Setting').default,
      indexRoute: {
        component: require('../components/SettingModal/Version').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./setting').default)
        })
      },
    }, {
      path: 'manange_monitor',
      component: require('../containers/ManageMonitor').default,
      indexRoute: {
        component: require('../components/ManageMonitor/OperationalAudit').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./manange_monitor').default)
        })
      },
    }, {
      path: 'integration',
      component: require('../containers/Integration').default,
      indexRoute: {
        component: require('../components/IntegrationModule').default,
      }
    }, {
      path: 'cluster',
      component: require('../containers/Cluster').default,
      indexRoute: {
        component: require('../components/ClusterModule').default,
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./cluster').default)
        })
      },
    }, {
      path: '*',
      component: require('../containers/ErrorPage').default,
    }],
  }]
}

export default rootRoutes