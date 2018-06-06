/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * integration routes
 *
 * v0.1 - 2017-1-22
 * @author GaoJian
*/

const clusterRoutes = [{
  path: ':clusterID/:cluster_name',
  component: require('../components/ClusterModule/ClusterDetail').default,
},
]

export default clusterRoutes