 /**
 * API handler for user portal
 *
 * v0.1 - 2016-09-22
 *
 * @author Zhangpc
 */

'use strict';

const middlewares = require('../services/middlewares')
const volumeController = require('../controllers/volume')
const appController = require('../controllers/app_manage')
const serviceController = require('../controllers/service_manage')
const containerController = require('../controllers/container')
const configController = require('../controllers/configs')
const registryController = require('../controllers/registry')
const harborController = require('../controllers/registry_harbor')
const metricsController = require('../controllers/metrics')
const databaseCacheController = require('../controllers/database_cache')
const appTemplateController = require('../controllers/app_template')
const manageMonitorController = require('../controllers/manage_monitor')
const userController = require('../controllers/user_manage')
const teamController = require('../controllers/team_manage')
const overviewTeamController = require('../controllers/overview_team')
const overviewClusterController = require('../controllers/overview_cluster')
const overviewSpaceController = require('../controllers/overview_space')
const tokenController = require('../controllers/token')
const devopsController = require('../controllers/devops')
const licenseController = require('../controllers/license')
const clusterController = require('../controllers/cluster_manage')
const integrationController = require('../controllers/integration')
const consumptionController = require('../controllers/consumption')
const clusternodesController = require('../controllers/cluster_node')
const versionsController = require('../controllers/versions')
const chargeController = require('../controllers/charge')
const globalConfigController = require('../controllers/global_config')
const imageScanController = require('../controllers/image_scan')
const alertController = require('../controllers/alert')
const labelController = require('../controllers/labels')
const ldapController = require('../controllers/ldap_manage')
const oemController = require('../controllers/oem_info')

const netIsolationController = require('../controllers/network_isolation')

module.exports = function (Router) {
    const router = new Router({
        prefix: '/api/v2'
    })
    router.use(middlewares.auth)

    // Storage
    router.get('/storage-pools/:pool/:cluster/volumes', volumeController.getVolumeListByPool)
    router.post('/storage-pools/:pool/:cluster/volumes/batch-delete', volumeController.deleteVolume)
    router.post('/clusters/:cluster/volumes', volumeController.createVolume)
    router.get('/clusters/:cluster/apps/checkport', volumeController.getVolumePort)
    // `${API_URL_PREFIX}/clusters/${cluster}/apps/checkport?lbgroup=${netWorl}&ports=${mappingPort}`
    router.post('/clusters/:cluster/pvcs', volumeController.createpvcs)
    router.put('/storage-pools/:pool/:cluster/volumes/format', volumeController.formateVolume)
    router.put('/storage-pools/:pool/:cluster/volumes/size', volumeController.resizeVolume)
    router.get('/storage-pools/:pool/:cluster/volumes/:name', volumeController.getVolumeDetail)
    //router.post('/storage-pools/:pool/:cluster/volumes/:name/beforeimport', volumeController.beforeUploadFile)
    //router.post('/storage-pools/:pool/:cluster/volumes/:name/import', volumeController.uploadFile)
    router.get('/storage-pools/:pool/:cluster/volumes/:name/filehistory', volumeController.getFileHistory)
    router.get('/storage-pools/:pool/:cluster/volumes/:name/bindinfo', volumeController.getBindInfo)
    // router.get('/storage-pools/:pool/:cluster/volumes/:name/exportfile', volumeController.exportFile)
    router.get('/storage-pools/:cluster/volumes/available', volumeController.getAvailableVolume)
    router.get('/storage-pools/:cluster/volumes/pool-status', volumeController.getPoolStatus)
    router.get('/storage-pools/:cluster/volumes/snapshot/list', volumeController.listSnapshots)
    router.post('/storage-pools/:cluster/volumes/snapshot/delete', volumeController.deleteSnapshot)
    router.post('/storage-pools/:cluster/volumes/:name/snapshot', volumeController.createSnapshot)
    router.post('/storage-pools/:cluster/volumes/:name/snapshot/rollback', volumeController.rollbackSnapshot)
    router.post('/storage-pools/:cluster/volumes/:name/snapshot/clone', volumeController.cloneSnapshot)
    router.get('/storage-pools/:cluster/volumes/calamari-url', volumeController.getCalamariUrl)
    router.post('/storage-pools/:cluster/volumes/calamari-url', volumeController.setCalamariUrl)

    // Clusters
    router.get('/clusters', clusterController.getClusters)
    router.post('/clusters', clusterController.createCluster)
    router.put('/clusters/:cluster', clusterController.updateCluster)
    router.put('/clusters/:cluster/configs', clusterController.updateConfigs)
    router.del('/clusters/:cluster', clusterController.deleteCluster)
    router.get('/clusters/:cluster/summary', clusterController.getClusterSummary)
    // For bind node when create service(lite only)
    router.get('/clusters/:cluster/nodes', clusterController.getNodes)
    router.get('/clusters/add-cluster-cmd', clusterController.getAddClusterCMD)
    router.get('/clusters/:cluster/proxies', clusterController.getProxy)
    router.put('/clusters/:cluster/proxies', middlewares.isAdminUser, clusterController.updateProxies)
    router.put('/clusters/:cluster/proxies/:groupID', middlewares.isAdminUser, clusterController.updateProxy)
    router.put('/clusters/:cluster/proxies/:groupID/as_default', middlewares.isAdminUser, clusterController.setDefaultProxy)
    router.get('/clusters/:cluster/node_addr', middlewares.isAdminUser, clusterController.getClusterNodeAddr)
    router.get('/clusters/:cluster/plugins', middlewares.isAdminUser, clusterController.getClusterPlugins)
    router.put('/clusters/:cluster/plugins/:name', middlewares.isAdminUser, clusterController.updateClusterPlugins)
    router.get('/clusters/:cluster/network', clusterController.getClusterNetworkMode)
    router.put('/clusters/:cluster/plugins/operation/stop', middlewares.isAdminUser, clusterController.batchStopPlugins)
    router.put('/clusters/:cluster/plugins/operation/start', middlewares.isAdminUser, clusterController.batchStartPlugins)
    router.delete('/clusters/:cluster/plugins', middlewares.isAdminUser, clusterController.batchDeletePlugins)
    router.post('/clusters/:cluster/plugins', middlewares.isAdminUser, clusterController.createPlugins)

    // Apps
    router.post('/clusters/:cluster/apps', appController.createApp)
    router.post('/clusters/:cluster/plugins', appController.createPlugin)
    router.put('/clusters/:cluster/apps/:app_name/desc', appController.updateAppDesc)
    router.get('/clusters/:cluster/apps', appController.getApps)
    router.post('/clusters/:cluster/apps/batch-delete', appController.deleteApps)
    router.put('/clusters/:cluster/apps/batch-stop', appController.stopApps)
    router.put('/clusters/:cluster/apps/batch-start', appController.startApps)
    router.put('/clusters/:cluster/apps/batch-restart', appController.restartApps)
    router.put('/clusters/:cluster/apps/batch-status', appController.getAppsStatus)
    router.get('/clusters/:cluster/apps/:app_name/services', appController.getAppServices)
    router.post('/clusters/:cluster/apps/:app_name/services', appController.addService)
    router.get('/clusters/:cluster/apps/:app_name/orchfile', appController.getAppOrchfile)
    router.get('/clusters/:cluster/apps/:app_name/detail', appController.getAppDetail) // spi
    router.get('/clusters/:cluster/apps/:app_name/logs', appController.getAppLogs)
    router.get('/clusters/:cluster/apps/:app_name/existence', appController.checkAppName)
    router.get('/clusters/:cluster/services/:service/existence', serviceController.checkServiceName)
    router.put('/clusters/:cluster/services/:service/lbgroups/:groupID', serviceController.setServiceProxyGroup)

    // AppTemplates
    router.get('/templates', appTemplateController.listTemplates)
    router.get('/templates/:templateid', appTemplateController.getTemplate)
    router.post('/templates', appTemplateController.createTemplate)
    // /clusters/CID-f794208bc85f/networkpolicy/ingress
    router.post('/templates/:templateid', appTemplateController.deleteTemplate)
    router.delete('/templates/:templateid/', appTemplateController.deleteAppTemplate)

    router.put('/templates/:templateid', appTemplateController.updateTemplate)

    // Services
    router.get('/clusters/:cluster/services', serviceController.getAllService)//serviceslist
    router.get('/clusters/:cluster/flow/services', appController.getServiceList)    
    router.get('/clusters/:cluster/pods/:name', serviceController.getPodsLine)
    router.get('/clusters/:cluster/pods/:name/detail', serviceController.getVessDetail)
    router.put('/clusters/:cluster/services/batch-start', serviceController.startServices)
    router.put('/clusters/:cluster/services/batch-stop', serviceController.stopServices)
    router.put('/clusters/:cluster/services/batch-restart', serviceController.restartServices)
    router.put('/clusters/:cluster/services/batch-quickrestart', serviceController.quickRestartServices)
    router.post('/clusters/:cluster/services/batch-delete', serviceController.deleteServices)
    router.get('/clusters/:cluster/services/batch-status', serviceController.getServicesStatus)
    router.get('/clusters/:cluster/services/:service_name/detail', serviceController.getServiceDetail)
    router.get('/clusters/:cluster/:namespace/services/:service_name/containers', serviceController.getServiceContainers)
    router.put('/clusters/:cluster/services/:service_name/env', serviceController.updateServiceContainers)
    router.put('/clusters/:cluster/services/:service_name/manualscale', serviceController.manualScaleService)
    router.get('/clusters/:cluster/services/:service_name/autoscale', serviceController.getServiceAutoScale)
    router.put('/clusters/:cluster/services/:service_name/autoscale', serviceController.autoScaleService)
    router.del('/clusters/:cluster/services/:service_name/autoscale', serviceController.delServiceAutoScale)
    router.put('/clusters/:cluster/services/:service_name/quota', serviceController.changeServiceQuota)
    router.put('/clusters/:cluster/services/:service_name/ha', serviceController.changeServiceHa)
    router.put('/clusters/:cluster/services/:service_name/rollingupdate', serviceController.rollingUpdateService)
    router.get('/clusters/:cluster/replicaset/:service_name/events', serviceController.getReplicasetDetailEvents)
    router.get('/clusters/:cluster/dbservice/:service_name/events', serviceController.getDbServiceDetailEvents)
    router.get('/clusters/:cluster/service/:service_name/pods/events', serviceController.getPodsEventByServicementName)
    router.post('/clusters/:cluster/namespaces/:namespace/services/:service_name/logs', serviceController.getServiceLogs)
    router.get('/clusters/:cluster/services/:service_name/k8s-service', serviceController.getK8sService)
    router.put('/clusters/:cluster/services/:service_name/portinfo', serviceController.updateServicePortInfo)
    router.get('/clusters/:cluster/services/:service_name/certificates', serviceController.getCertificate)
    router.put('/clusters/:cluster/services/:service_name/certificates', serviceController.updateCertificate)
    router.delete('/clusters/:cluster/services/:service_name/certificates', serviceController.deleteCertificate)
    router.put('/clusters/:cluster/services/:service_name/tls', serviceController.toggleHTTPs)
    router.get('/clusters/:cluster/apps/:appName/topology-services', serviceController.serviceTopology)
    router.get('/clusters/:cluster/apps/:appName/topology-pods', serviceController.podTopology)

    // Users
    router.get('/users/:user_id', userController.getUserDetail)
    router.get('/users/:user_id/app_info', userController.getUserAppInfo)
    router.get('/users', userController.getUsers)
    router.get('/users/:user_id/teams', userController.getUserTeams)
    router.get('/users/:user_id/teamspaces', userController.getUserTeamspaces)
    router.get('/users/:user_id/teamspaces/detail', userController.getUserTeamspacesWithDetail)
    router.post('/users', userController.createUser)
    router.delete('/users/:user_id', userController.deleteUser)
    router.patch('/users/:user_id', userController.updateUser)
    router.get('/users/:user_name/existence', userController.checkUserName)

    // Teams
    router.get('/teams/:team_id/spaces/:space_id/users', teamController.getSpaceUsers)
    router.post('/teams/:team_id/spaces/:space_id/users', teamController.setSpaceUsers)
    router.post('/teams/:team_id/spaces/:space_id/deleteusers', teamController.deleteSpaceUsers)
    
    router.get('/teams/:team_id/spaces', teamController.getTeamspaces)
    router.get('/teams/:team_id/clusters', teamController.getTeamClusters)
    router.get('/teams/:team_id/clusters/all', teamController.getAllClusters)
    router.get('/teams/:team_id/users', teamController.getTeamUsers)
    router.get('/teams/:team_id', teamController.getTeamDetail)
    router.post('/teams', teamController.createTeam)
    router.delete('/teams/:team_id', teamController.deleteTeam)
    router.post('/teams/:team_id/spaces', teamController.createTeamspace)
    router.post('/teams/:team_id/users', teamController.addTeamusers)
    //To remove multiple users, seperate the user ids with ",".
    router.delete('/teams/:team_id/users/:user_ids', teamController.removeTeamusers)
//  teams/:team/update/users/:user/role/:role
    router.put('/teams/:team/update/users/:user/role/:role/type/:type', teamController.permissionPut)
    
    router.delete('/teams/:team_id/spaces/:space_id', teamController.deleteTeamspace)
    router.put('/teams/:team_id/clusters/:cluster_id/request', teamController.requestTeamCluster)
    router.get('/teams/:team_name/existence', teamController.checkTeamName)
    router.get('/teams/:team_id/spaces/:space_name/existence', teamController.checkSpaceName)

    //Overview Team
    router.get('/overview/teaminfo', overviewTeamController.getTeamOverview)
    router.get('/overview/teamdetail', overviewTeamController.getTeamDetail)
    router.get('/overview/teamoperations', overviewTeamController.getTeamOperations)

    //Overview Cluster
    router.get('/overview/clusterinfo/clusters/:cluster_id', overviewClusterController.getClusterOverview)
    router.get('/overview/clusterinfo-std/clusters/:cluster_id', overviewClusterController.getStdClusterOverview)
    router.get('/overview/clusters/:cluster_id/operations', overviewClusterController.getClusterOperations)
    router.get('/overview/clusters/:cluster_id/sysinfo', overviewClusterController.getClusterSysinfo)
    router.get('/overview/clusters/:cluster_id/storage', overviewClusterController.getClusterStorage)
    router.get('/overview/clusters/:cluster_id/appstatus', overviewClusterController.getClusterAppStatus)
    router.get('/overview/clusters/:cluster_id/dbservices', overviewClusterController.getClusterDbServices)
    router.get('/overview/clusters/:cluster_id/nodesummary', overviewClusterController.getClusterNodeSummary)
    router.get('/overview/clusters/:cluster_id/summary', overviewClusterController.getClusterSummary)

    //Overview Space
    router.get('/overview/spaceinfo', overviewSpaceController.getSpaceOverview)
    router.get('/overview/operations', overviewSpaceController.getSpaceOperations)
    router.get('/overview/templates', overviewSpaceController.getSpaceTemplateStats)
    router.get('/overview/warnings', overviewSpaceController.getSpaceWarnings)

    // spi
    router.post('/clusters/:cluster/services/:service_name/binddomain', serviceController.bindServiceDomain)
    router.put('/clusters/:cluster/services/:service_name/binddomain', serviceController.deleteServiceDomain)
    // Containers
    router.get('/clusters/:cluster/containers', containerController.getContainers)
    router.get('/clusters/:cluster/containers/:container_name/detail', containerController.getContainerDetail)
    router.get('/clusters/:cluster/containers/:container_name/events', containerController.getContainerDetailEvents)
    router.post('/clusters/:cluster/containers/:name/logs', containerController.getContainerLogs)
    router.post('/clusters/:cluster/containers/batch-delete', containerController.deleteContainers)
    router.get('/clusters/:cluster/containers/:name/process', containerController.getProcess)
    router.post('/clusters/:cluster/containers/:name/export',containerController.exportContainers)
    // Configs
    router.post('/clusters/:cluster/creatAppServices', configController.createAPPService)
    router.get('/clusters/:cluster/configgroups', configController.listConfigGroups)
    router.get('/clusters/:cluster/configgroups/:name', configController.getConfigGroupName)
    router.get('/clusters/:cluster/configgroups/:group/configs/:name', configController.loadConfigFiles)
    router.post('/clusters/:cluster/configs', configController.createConfigGroup)
    router.post('/clusters/:cluster/configgroups/:group/configs/:name', configController.createConfigFiles)
    router.put('/clusters/:cluster/configgroups/:group/configs/:name', configController.updateConfigFile)
    router.post('/clusters/:cluster/configs/delete', configController.deleteConfigGroup)
    router.post('/clusters/:cluster/configgroups/:group/configs-batch-delete', configController.deleteConfigFiles)

    // Harbor integration
    router.get('/registries/:registry/systeminfo', harborController.getSysteminfo)
    router.get('/registries/:registry/users/current', harborController.getCurrentUserCtl)
    router.get('/registries/:registry/projects', harborController.getProjects)
    router.get('/registries/:registry/projects/search', harborController.searchProjects)

    router.del('/registries/:registry/repositories/:user/:name/tags', harborController.deleteRepository)
    router.get('/registries/:registry/repositories/:user/:name/tags', harborController.getRepositoriesTags)
    router.get('/registries/:registry/repositories/:user/:name/tags/:tag/configinfo', harborController.getRepositoriyConfig)

    router.post('/registries/:registry/projects', harborController.createProject)
    router.get('/registries/:registry/projects/:project_id', harborController.getProjectDetail)
    router.del('/registries/:registry/projects/:project_id', harborController.deleteProject)
    router.put('/registries/:registry/projects/:project_id/publicity', harborController.updateProjectPublicity)
    router.get('/registries/:registry/projects/:project_id/members', harborController.getProjectMembers)
    router.post('/registries/:registry/projects/:project_id/members', harborController.addProjectMember)
    router.put('/registries/:registry/projects/:project_id/members/:user_id', harborController.updateProjectMember)
    router.del('/registries/:registry/projects/:project_id/members/:user_id', harborController.deleteProjectMember)
    router.get('/registries/:registry/repositories', harborController.getProjectRepositories)

    router.get('/registries/:registry/logs', harborController.getLogs)
    router.post('/registries/:registry/projects/:projectID/logs', harborController.getProjectLogs)
    router.get('/registries/:registry/systeminfo', harborController.getSystemInfo)
    router.get('/registries/:registry/systeminfo/volumes', harborController.getSystemInfoVolumes)
    router.get('/registries/:registry/systeminfo/cert', harborController.getSystemInfoCert)
    router.get('/registries/:registry/configurations', harborController.getConfigurations)
    router.put('/registries/:registry/configurations', harborController.updateConfigurations)
    router.post('/registries/:registry/configurations/reset', harborController.resetConfigurations)

    router.get('/registries/:registry/jobs/replication', harborController.getReplicationJobs)
    router.delete('/registries/:registry/jobs/replication/:id', harborController.deleteReplicationJob)
    router.get('/registries/:registry/jobs/replication/:id/log', harborController.getReplicationJobLogs)
    router.get('/registries/:registry/policies/replication', harborController.getReplicationPolicies)
    router.post('/registries/:registry/policies/replication', harborController.newReplicationPolicy)
    router.get('/registries/:registry/policies/replication/:id', harborController.getReplicationPolicy)
    router.delete('/registries/:registry/policies/replication/:id', harborController.deleteReplicationPolicy)
    router.put('/registries/:registry/policies/replication/:id', harborController.modifyReplicationPolicy)
    router.put('/registries/:registry/policies/replication/:id/enablement', harborController.enableReplicationPolicy)
    router.get('/registries/:registry/targets', harborController.getReplicationTargets)
    router.post('/registries/:registry/targets', harborController.newReplicationTarget)
    router.post('/registries/:registry/targets/ping', harborController.pingReplicationTarget)
    router.post('/registries/:registry/targets/:id/ping', harborController.pingReplicationTargetByID)
    router.put('/registries/:registry/targets/:id', harborController.modifyReplicationTarget)
    router.get('/registries/:registry/targets/:id', harborController.getReplicationTarget)
    router.delete('/registries/:registry/targets/:id', harborController.deleteReplicationTarget)
    router.get('/registries/:registry/targets/:id/policies', harborController.getReplicationTargetRelatedPolicies)
    router.get('/registries/:registry/projects/:id/replication/summary', harborController.getReplicationSummary)

    router.get('/registries/:registry/statistics', harborController.getStatistics)

    // Registries of TenxCloud
    router.get('/registries/:registry', registryController.getImages)
    router.get('/registries/:registry/:user/:name/detailInfo', registryController.getImageInfo)
    router.get('/registries/:registry/:user/:name', registryController.checkImage)
    router.get('/registries/:registry/:user/:name/tags', registryController.getImageTags)
    router.get('/registries/:registry/:user/:name/tags/:tag/configs', registryController.getImageConfigs)
    router.get('/registries/:registry/private', registryController.getPrivateImages)
    router.get('/registries/:registry/favourite', registryController.getFavouriteImages)
    router.put('/registries/:registry/:image*', registryController.updateImageInfo)
    router.delete('/registries/:registry/:image*', registryController.deleteImage)
    // router.get('/registries/:registry/stats', registryController.queryServerStats)

    // Private docker registry integration
    router.get('/docker-registry', registryController.getPrivateRegistries)
    router.post('/docker-registry/:name', registryController.addPrivateRegistry)
    router.del('/docker-registry/:id', registryController.deletePrivateRegistry)
    // Docker registry spec API
    router.get('/docker-registry/:id/images', registryController.specListRepositories)
    router.get('/docker-registry/:id/images/:image*/tags', registryController.specGetImageTags)
    router.get('/docker-registry/:id/images/:image*/tags/:tag', registryController.specGetImageTagInfo)
    // spi for tenxcloud hub
    router.get('/tenx-hubs', registryController.isTenxCloudHubConfigured)
    router.post('/tenx-hubs', registryController.addTenxCloudHub)
    router.delete('/tenx-hubs', registryController.removeTenxCloudHub)
    // Tag size is merged to specGetImageTagConfig
    //router.get('/docker-registry/:id/images/:image*/tags/:tag/size', registryController.specGetImageTagSize)

    // Metrics
    router.get('/clusters/:cluster/containers/:container_name/metrics', metricsController.getContainerMetrics)
    router.get('/clusters/:cluster/containers/:container_name/getAllmetrics', metricsController.getAllContainerMetrics)
    router.get('/clusters/:cluster/services/:service_name/metrics', metricsController.getServiceMetrics)
    router.get('/clusters/:cluster/services/:service_name/getAllMetrics', metricsController.getAllServiceMetrics)
    router.get('/clusters/:cluster/apps/:app_name/metrics', metricsController.getAppMetrics)
    router.get('/clusters/:cluster/apps/:app_name/getAllMetrics', metricsController.getAllAppMetrics)
    // router.get('/clusters/:cluster/apps/:app_name/getAllMetrics', metricsController.getAppAllMetrics)

    // Manage Monitor
    router.post('/manage-monitor/getOperationAuditLog', manageMonitorController.getOperationAuditLog)
    router.get('/manage-monitor/:team_id/:namespace/getClusterOfQueryLog', manageMonitorController.getClusterOfQueryLog)
    router.get('/manage-monitor/:cluster_id/:namespace/getServiceOfQueryLog', manageMonitorController.getServiceOfQueryLog)
    router.post('/clusters/:cluster/namespaces/:namespace/instances/:instances/getSearchLog', manageMonitorController.getSearchLog)
    router.post('/clusters/:cluster/namespaces/:namespace/services/:services/getSearchLog', manageMonitorController.getServiceSearchLog)

    // DevOps service: CI/CD
    router.get('/devops/stats', devopsController.getStats)
    // Repos
    router.get('/devops/repos/supported', devopsController.getSupportedRepository)
    router.post('/devops/repos/:type', devopsController.registerRepo)
    router.post('/devops/ci-flows/:flow_id/sync', devopsController.ennflowClone)// --- yaowei ---- ennflow clone
    router.get('/devops/repos/:type', devopsController.listRepository)
    router.put('/devops/repos/:type', devopsController.syncRepository)
    router.delete('/devops/repos/:type', devopsController.removeRepository)
    router.get('/devops/repos/:type/branches', devopsController.listBranches)
    router.get('/devops/repos/:type/tags', devopsController.listTags)
    router.get('/devops/repos/:type/branches_tags', devopsController.listBranchesAndTags)
    router.get('/devops/repos/:type/user', devopsController.getUserInfo)
    // Auth with 3rdparty SCM and callback
    router.get('/devops/repos/:type/auth', devopsController.getAuthRedirectUrl);
    router.get('/devops/repos/:type/auth-callback', devopsController.doUserAuthorization)

    // Managed projects
    router.post('/devops/managed-projects', devopsController.addManagedProject)
    router.get('/devops/managed-projects', devopsController.listManagedProject)
    router.delete('/devops/managed-projects/:project_id', devopsController.removeManagedProject)
    router.get('/devops/managed-projects/:project_id/branches_tags', devopsController.getManagedProject, devopsController.listBranchesAndTags)
    // CI flows
    router.post('/devops/ci-flows', devopsController.createCIFlows)
    router.get('/devops/ci-flows', devopsController.listCIFlows)
    router.get('/devops/ci-flows/:flow_id', devopsController.getCIFlow)
    router.get('/devops/ci-flows/:flow_id/yaml', devopsController.getCIFlowYAML)
    router.put('/devops/ci-flows/:flow_id', devopsController.updateCIFlow)
    router.delete('/devops/ci-flows/:flow_id', devopsController.removeCIFlow)
    router.get('/devops/ci-flows/:flow_id/images', devopsController.getImagesOfFlow)
    router.get('/devops/ci-flows/:flow_id/deployment-logs', devopsController.listDeploymentLogsOfFlow)
    // CI flow stages
    router.get('/devops/ci-flows/:flow_id/stages', devopsController.listFlowStages)
    router.post('/devops/ci-flows/:flow_id/stages', devopsController.createFlowStages)
    router.delete('/devops/ci-flows/:flow_id/stages/:stage_id', devopsController.deleteFlowStage)
    router.put('/devops/ci-flows/:flow_id/stages/:stage_id', devopsController.updateFlowStage)
    router.get('/ci-flows/:flow_id/stages/:stage_id', devopsController.getStage)
    router.get('/devops/ci-flows/:flow_id/stages/:stage_id/getStageBuildLogs', devopsController.getStageBuildLogList)
    router.put('/devops/ci-flows/:flow_id/stages/:stage_id/link/:target_id', devopsController.updateStageLink)

    // CD rules
    router.post('/devops/ci-flows/:flow_id/cd-rules', devopsController.createCDRule)
    router.get('/devops/ci-flows/:flow_id/cd-rules', devopsController.listCDRules)
    router.delete('/devops/ci-flows/:flow_id/cd-rules/:rule_id', devopsController.removeCDRule)
    router.put('/devops/ci-flows/:flow_id/cd-rules/:rule_id', devopsController.updateCDRule)
    router.get('/devops/cd-rules/type/:type', devopsController.getDeploymentOrAppCDRule)
    router.delete('/devops/cd-rules/type/:type', devopsController.deleteDeploymentOrAppCDRule)

    // CI rules
    router.get('/devops/ci-flows/:flow_id/ci-rules', devopsController.getCIRule)
    router.put('/devops/ci-flows/:flow_id/ci-rules', devopsController.updateCIRule)

    // Flow build
    router.post('/devops/ci-flows/:flow_id/builds', devopsController.createFlowBuild)
    router.get('/devops/ci-flows/:flow_id/builds', devopsController.listBuilds)
    router.get('/devops/ci-flows/:flow_id/builds/:flow_build_id', devopsController.getFlowBuild)
    router.put('/devops/ci-flows/:flow_id/stages/:stage_id/builds/:build_id/stop', devopsController.stopBuild)
    router.get('/devops/ci-flows/:flow_id/getBuildLogs', devopsController.getBuildLog)
    router.get('/devops/ci-flows/:flow_id/getLastBuildLogs', devopsController.getLastBuildLog)
    router.get('/devops/ci-flows/:flow_id/stages/:stage_id/builds/:stage_build_id', devopsController.getFlowStageBuildLog)
    router.get('/devops/ci-flows/:flow_id/stages/:stage_id/builds/:stage_build_id/events', devopsController.getFlowStageBuildEvents)

    // CI Dockerfile
    router.get('/devops/dockerfiles', devopsController.listDockerfiles)
    router.post('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.addDockerfile)
    router.get('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.getDockerfile)
    router.delete('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.removeDockerfile)
    router.put('/devops/ci-flows/:flow_id/stages/:stage_id/dockerfile', devopsController.updateDockerfile)
    router.post('/devops/ci-scripts', devopsController.createScripts)
    router.get('/devops/ci-scripts/:scripts_id', devopsController.getScriptsById)
    router.put('/devops/ci-scripts/:scripts_id', devopsController.updateScriptsById)
    // Available CI images
    router.get('/devops/ci/images', devopsController.getAvailableImages)

    // Petsets - DB service APIs
    router.post('/clusters/:cluster/dbservices', databaseCacheController.createNewDBService)
    router.delete('/clusters/:cluster/dbservices/:name', databaseCacheController.deleteDBService)
    router.delete('/clusters/:cluster/statefulsets/:name', databaseCacheController.deleteStatefulsets)
    // Filter by type
    router.get('/clusters/:cluster/dbservices', databaseCacheController.listDBService)
    router.get('/clusters/:cluster/statefulsets', databaseCacheController.listStatefulsets)
    router.get('/clusters/:cluster/dbservices/:name', databaseCacheController.getDBService)
    router.get('/clusters/:cluster/stateDetail/:name', databaseCacheController.stateDetail)
    router.patch('/clusters/:cluster/dbservices/:name', databaseCacheController.scaleDBService)
    router.put('/clusters/:cluster/statefulsets/:name', databaseCacheController.scaleState)

// caches
    router.get('/clusters/:cluster/:type', databaseCacheController.getCaches)
    router.post('/clusters/:cluster/snapshots', databaseCacheController.getBackUp)
    router.get('/clusters/:cluster/snapshots/:id', databaseCacheController.getBackUpList)
    router.get('/clusters/:cluster/:type/:node/monitor', databaseCacheController.getMonitor)//获取监控
    router.get('/clusters/:cluster/:type/:node/monitor/list', databaseCacheController.getMonitorMetric)//获取监控
    router.get('/clusters/:cluster/cacheParameterGroups/list', databaseCacheController.getCachesConfig)
    router.get('/clusters/:cluster/:type/:mongoId/nodes', databaseCacheController.getDatabaseNodes)         //获取数据库节点
    router.get('/clusters/:cluster/:type/:id/parameters', databaseCacheController.getDatabaseParameters)         //获取数据库参数配置
    router.put('/clusters/:cluster/updateConfig/:id', databaseCacheController.updateCachesConfig)
    router.put('/clusters/:cluster/:type/:mongoId/parameters', databaseCacheController.getModifyParameters)         //获取数据库参数配置
    router.post('/clusters/:cluster/:type', databaseCacheController.createNewCaches)
    // ApiURI/api/v2/clusters/:cluster/mongos/:mongo/nodes?nodecount=1
    // /clusters/${cluster}/${types}/${mongoId}/nodes?nodecount=${nodecount}
    router.post('/clusters/:cluster/:types/:mongoId/nodes', databaseCacheController.addnode)
    router.delete('/clusters/:cluster/:type/:id', databaseCacheController.deleteRedis)
    router.delete('/clusters/:cluster/:type/:deleteId/nodes/:rdbInstanceId', databaseCacheController.deleteNodes)
    router.delete('/clusters/:cluster/snapshots/:id', databaseCacheController.deleteBackup)
    router.put('/clusters/:cluster/:type/:id/:verb', databaseCacheController.updateCaches)

    // BaseImage
    router.post('/devops/ci/images', devopsController.addBaseImage)
    router.put('/devops/ci/images/:id', devopsController.updateBaseImage)
    router.delete('/devops/ci/images/:id', devopsController.deleteBaseImage)

    // Integration
    router.get('/integrations/getAllIntegration', integrationController.getAllIntegrations)
    router.post('/integrations/createIntegration', integrationController.createIntegrations)
    router.delete('/integrations/deleteIntegrations/:id', integrationController.deleteIntegrations)
    router.get('/integrations/getIntegrationDateCenter/:id', integrationController.getIntegrationDateCenter)
    router.get('/integrations/getIntegrationVmList/:id', integrationController.getIntegrationVmList)
    router.post('/integrations/manageIntegrationsVmDetail/:id', integrationController.manageIntegrationsVmDetail)
    router.get('/integrations/getCreateVmConfig/:id', integrationController.getCreateVmConfig)
    router.post('/integrations/createIntegrationVm/:id', integrationController.createIntegrationVm)
    router.get('/integrations/getIntegrationPods/:id', integrationController.getIntegrationPods)
    router.get('/integrations/getIntegrationConfig/:id', integrationController.getIntegrationConfig)
    router.put('/integrations/updateIntegrationConfig/:id', integrationController.updateIntegrationConfig)

    // Cluster pod
    router.get('/cluster-nodes/:cluster', clusternodesController.getClusterNodes)
    router.post('/cluster-nodes/:cluster/node/:node', clusternodesController.changeNodeSchedule)
    router.delete('/cluster-nodes/:cluster/node/:node', clusternodesController.deleteNode)
    router.get('/cluster-nodes/:cluster/add-node-cmd', clusternodesController.getAddNodeCMD)
    // Get kubectl pods names
    router.get('/cluster-nodes/:cluster/kubectls', clusternodesController.getKubectls)
    router.get('/cluster-nodes/:cluster/:node/podlist', clusternodesController.getPodlist)
    // get host detail info
    router.get('/cluster-nodes/:cluster/metrics', clusternodesController.getClusterNodesMetric)
    router.get('/cluster-nodes/:cluster/:node/info', clusternodesController.getClustersInfo)
    router.get('/cluster-nodes/:cluster/:node/metrics', clusternodesController.getClustersMetrics)
    router.get('/cluster-nodes/:cluster/:node/instant', clusternodesController.getClustersInstant)
    router.get('/cluster-nodes/:cluster/label-summary', clusternodesController.getLabelSummary)

    // manipulate node's labels
    router.get('/cluster-nodes/:cluster/:node/labels', clusternodesController.getNodeLabels)
    router.put('/cluster-nodes/:cluster/:node/labels', clusternodesController.updateNodeLabels)
    router.post('/cluster-nodes/:cluster/:node/affectedpods', clusternodesController.getAffectedPods)

    // Token info
    router.get('/token', tokenController.getTokenInfo)

    // Licenses
    router.get('/licenses', licenseController.getLicenses)

    // consumption and charge
    router.get('/consumptions/detail', consumptionController.getDetail)
    router.get('/consumptions/trend', consumptionController.getTrend)
    router.get('/consumptions/summary', consumptionController.getSummaryInDay)
    router.get('/consumptions/charge-history', consumptionController.getChargeRecord)
    router.get('/consumptions/notify-rule', consumptionController.getNotifyRule)
    router.put('/consumptions/notify-rule', consumptionController.setNotifyRule)

    // Versions
    router.get('/versions/check', versionsController.checkVersion)

    // Charge
    router.post('/charge/user', chargeController.chargeUser)
    router.post('/charge/teamspace', chargeController.chargeTeamspace)

    //setting
    router.post('/cluster/:cluster/type/:type/config', globalConfigController.changeGlobalConfig)
    router.put('/cluster/:cluster/type/:type/config', globalConfigController.changeGlobalConfig)
    router.get('/cluster/:cluster/config', globalConfigController.getGlobalConfig)
    router.post('/type/:type/isvalidconfig', globalConfigController.isValidConfig)
    router.post('/configs/email/verification',globalConfigController.sendVerification)
    //image scan
    router.get('/images/scan-status', imageScanController.getScanStatus)
    router.get('/images/layer-info', imageScanController.getLayerInfo)
    router.get('/images/lyins-info', imageScanController.getLyins)
    router.get('/images/clair-info', imageScanController.getClair)
    router.post('/images/scan', imageScanController.scan)
    router.post('/images/scan-rule', imageScanController.uploadFile)
    // alert
    router.get('/alerts/record-filters', alertController.getRecordFilters)
    router.get('/alerts/records', alertController.getRecords)
    router.delete('/alerts/records', alertController.deleteRecords)
    router.post('/alerts/groups', alertController.createNotifyGroup)
    router.put('/alerts/groups/:groupid', alertController.modifyNotifyGroup)
    router.get('/alerts/groups', alertController.listNotifyGroups)
    router.post('/alerts/groups/batch-delete', alertController.batchDeleteNotifyGroups)
    router.post('/alerts/invitations', alertController.sendInvitation)
    // /alerts/phone
    router.post('/alerts/phone', alertController.sendPhone)
    router.get('/alerts/invitations/status', alertController.checkEmailAcceptInvitation)
    //  /alerts/phone/content
    router.post('/alerts/phone/content', alertController.sendPhoneContent)
    // /alerts/invitations/phone
    router.get('/alerts/invitations/status/state', alertController.checkPhoneAcceptInvitation)
    // /alerts/phone/mobile
    // router.post('/alerts/phone/mobile', alertController.checkPhoneAcceptMobile)
    router.get('/alerts/cluster/:cluster/setting', alertController.getAlertSetting)
    router.get('/alerts/cluster/:cluster/setting/:strategyName/existence', alertController.checkExist)
    router.post('/alerts/cluster/:cluster/setting', alertController.addAlertSetting)
    router.put('/alerts/cluster/:cluster/setting', alertController.addAlertSetting)
    router.get('/alerts/cluster/:cluster/setting/list', alertController.getSettingList)
    router.get('/alerts/group-strategies', alertController.getSettingListfromserviceorapp)
    router.delete('/alerts/cluster/:cluster/setting', alertController.deleteSetting)
    router.put('/alerts/cluster/:cluster/setting/enable', alertController.updateEnable)
    router.put('/alerts/cluster/:cluster/setting/email', alertController.updateSendEmail)
    router.put('/alerts/cluster/:cluster/setting/ignore', alertController.setIgnore)
    router.get('/alerts/cluster/:cluster/type/:type/setting/:name/instant', alertController.getTargetInstant)
    router.delete('/alerts/cluster/:cluster/rule', alertController.deleteRule)

    // user defined labels
    router.get('/labels', labelController.getLabels)
    router.post('/labels', labelController.addLabels)
    router.put('/labels/:id', labelController.updateLabel)
    router.delete('/labels/:id', labelController.deleteLabel)

    // Ldap
    router.get('/configs/ldap', ldapController.getLdap)
    router.post('/configs/ldap', ldapController.upsertLdap)
    router.post('/user-directory/ldap', ldapController.syncLdap)
    router.delete('/user-directory/ldap', ldapController.removeLdap)



    // oem info
    router.put('/oem/info', oemController.updateText)
    router.put('/oem/logo', oemController.updateLogo)
    router.post('/oem/logo/upload', oemController.uploadImage)
    router.post('/oem/logo/file', oemController.uploadImagess)
    router.get('/oem/media/:id', oemController.queryImage)

    router.put('/oem/info/default', oemController.restoreDefaultInfo)
    router.put('/oem/logo/default', oemController.restoreDefaultLogo)
    router.put('/oem/color/default', oemController.restoreDefaultColor)

      // Network Isolation
//   router.get('/cluster/:clusterID/networkisolation', netIsolationController.getCurrentSetting)
//   /networkpolicy/ingress/default
  router.get('/cluster/:clusterID/ingress/default/action', netIsolationController.getCurrentSettingingress)
  router.get('/cluster/:clusterID/networkpolicy/ingress', netIsolationController.getIngress)
  router.post('/cluster/:clusterID/networkisolation', netIsolationController.setIsolationRule)
//   ingress
  router.post('/cluster/:clusterID/networkpolicy/ingress/default', netIsolationController.setIsolationRuleingress)
  router.delete('/cluster/:clusterID/networkisolation', netIsolationController.restoreDefault)
  router.delete('/cluster/:clusterID/networkpolicy/ingress/:name', netIsolationController.restoreDefaultIngress)
  router.post('/clusters/:clusters/networkpolicy/ingress', netIsolationController.createTemplateIngress)
  router.patch('/clusters/:clusters/networkpolicynew/ingress/patch', netIsolationController.networkpolicyIngress)
//   router.get('/cluster/:clusterID/networkpolicy/ingress/default', netIsolationController.getStatus)
//   /networkpolicy/ingress/patch
//   `${API_URL_PREFIX}/clusters/${cluster}/networkpolicy/ingress`,

    return router.routes()
}