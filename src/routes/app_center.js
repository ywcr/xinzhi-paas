/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * App center routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/

const appCenterRoutes = [
  {
    path: 'image_store',
    component: require('../components/AppCenter/AppStore').default,
  },{
    path: 'stack_center',
    component: require('../components/AppCenter/Stack').default,
  },
  {
    path: 'projects',
    component: require('../components/AppCenter/Item').default,
    indexRoute: {
      component: require('../components/AppCenter/ImageCenter/Project').default,
    },
    childRoutes: [
      {
        path: 'public',
        component: require('../components/AppCenter/ImageCenter/Project/PublicProject').default,
      },
      {
        path: 'other',
        component: require('../components/AppCenter/ImageCenter/Project/PublicProject').default,
      },
      {
        path: 'detail/:id',
        component: require('../components/AppCenter/ImageCenter/ItemDetail').default,
      }
    ]
  }
]

export default appCenterRoutes