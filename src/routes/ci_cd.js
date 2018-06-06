/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * CI/CD routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/


const CICDRoutes = [{
  path: 'coderepo',
  component: require('../components/CICDModule/CodeStore/CodeRepo').default,
}, {
  path: 'enn_flow',
  indexRoute: {
    component: require('../components/CICDModule/TenxFlow').default,
  },
  childRoutes: [{
    path: 'enn_flow_build',
    component: require('../components/CICDModule/TenxFlow/TenxFlowDetail').default,
  }],
},{
  path: 'docker_file',
  component: require('../components/CICDModule/DockerFile').default,
},{
  path: 'build_image',
  indexRoute: {
    component: require('../components/CICDModule/BuildImage').default,
  },
  childRoutes: [{
    path: 'enn_flow_build',
    component: require('../components/CICDModule/TenxFlow/TenxFlowDetail').default,
  }],
}]

export default CICDRoutes