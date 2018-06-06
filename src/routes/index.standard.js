/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Root routes - standard
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const standard = require('../../configs/constants').STANDARD_MODE
const mode = require('../../configs/model').mode
const rootRoutes = {
  childRoutes: [{
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/App/NoAuthApp').default)
      })
    },
    childRoutes: [{
      path: '/login',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/Login/Standard').default)
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
    }
  ]},
  {
    path: '/',
    getComponent: (location, cb) => {
      require.ensure([], (require) => {
        cb(null, require('../containers/App/Standard').default)
      })
    },
    indexRoute: {
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/IndexPage/Standard').default)
        })
      },
    },
    childRoutes: [{
      path: 'quickentry',
      component: require('../components/QuickEntry').default,
    },{
      path: 'app_manage',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/Application').default)
        })
      },
      indexRoute: {
        getComponent: (location, cb) => {
          require.ensure([], (require) => {
            cb(null, require('../components/AppModule/AppList').default)
          })
        },
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./app_manage').default)
        })
      },
    }, {
      path: 'app_center',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/AppCenter').default)
        })
      },
      indexRoute: {
        getComponent: (location, cb) => {
          require.ensure([], (require) => {
            cb(null, require('../components/AppCenter').default)
          })
        },
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./app_center').default)
        })
      },
    }, {
      path: 'database_cache',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/Database').default)
        })
      },
      indexRoute: {
        getComponent: (location, cb) => {
          require.ensure([], (require) => {
            cb(null, require('../components/DatabaseCache/MysqlCluster').default)
          })
        },
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./database_cache').default)
        })
      },
    }, {
      path: 'ci_cd',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/CICD').default)
        })
      },
      indexRoute: {
        getComponent: (location, cb) => {
          require.ensure([], (require) => {
            cb(null, require('../components/CICDModule/CodeStore').default)
          })
        },
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./ci_cd').default)
        })
      },
    }, {
      path: 'account',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/Account').default)
        })
      },
      indexRoute: {
        getComponent: (location, cb) => {
          require.ensure([], (require) => {
            cb(null, require('../components/AccountModal/_Standard/UserInfo').default)
          })
        },
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./account').default)
        })
      },
    }, {
      path: 'setting',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/App/Standard').default)
        })
      },
      indexRoute: {
        getComponent: (location, cb) => {
          require.ensure([], (require) => {
            cb(null, require('../containers/IndexPage/Standard').default)
          })
        },
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, mode === standard ? null : require('./setting').default)
        })
      },
    }, {
      path: 'manange_monitor',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/ManageMonitor').default)
        })
      },
      indexRoute: {
        getComponent: (location, cb) => {
          require.ensure([], (require) => {
            cb(null, require('../components/ManageMonitor/OperationalAudit').default)
          })
        },
      },
      getChildRoutes: (location, cb) => {
        require.ensure([], function (require) {
          cb(null, require('./manange_monitor').default)
        })
      },
    }, {
      path: 'integration',
      getComponent: (location, cb) => {
        require.ensure([], (require) => {
          cb(null, require('../containers/Integration').default)
        })
      },
      indexRoute: {
        getComponent: (location, cb) => {
          require.ensure([], (require) => {
            cb(null, require('../components/IntegrationModule').default)
          })
        },
      }
    }, {
      path: '*',
      component: require('../containers/ErrorPage').default,
    }],
  }]
}

export default rootRoutes