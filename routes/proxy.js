/**
 * API handler for user portal
 *
 * v0.1 - 2017-05-19
 *
 * @author YangYuBiao
 */

const pluginsProxyController = require('../controllers/plugins_proxy')
const middlewares = require('../services/middlewares')

module.exports = function (Router) {
  const router = new Router({
  })
  router.use(middlewares.auth)

  //plugins proxy
  router.get(/\/proxy\/clusters\/[-a-zA-z0-9_]+\/plugins\/[-a-zA-z_]+(\/[-a-zA-z0-9_\.\/]+)?/, pluginsProxyController.pluginsProxy)
  router.post(/\/proxy\/clusters\/[-a-zA-z0-9_]+\/plugins\/[-a-zA-z_]+(\/[-a-zA-z0-9_\.\/]+)?/, pluginsProxyController.pluginsProxy)
  router.put(/\/proxy\/clusters\/[-a-zA-z0-9_]+\/plugins\/[-a-zA-z_]+(\/[-a-zA-z0-9_\.\/]+)?/, pluginsProxyController.pluginsProxy)
  router.delete(/\/proxy\/clusters\/[-a-zA-z0-9_]+\/plugins\/[-a-zA-z_]+(\/[-a-zA-z0-9_\.\/]+)?/, pluginsProxyController.pluginsProxy)
  
  router.get(/\/api\/v1\/proxy\/namespaces\/kube-system\/services\/[_a-z-A-Z0-9:-]+(\/[_a-zA-Z-]+(\/[-a-zA-Z_]+(.[a-zA-z])?)?)?/, pluginsProxyController.pluginsStaticProxy)
  router.post(/\/api\/v1\/proxy\/namespaces\/kube-system\/services\/[_a-z-A-Z0-9:-]+(\/[_a-zA-Z-]+(\/[-a-zA-Z_]+(.[a-zA-z])?)?)?/, pluginsProxyController.pluginsStaticProxy)
  router.put(/\/api\/v1\/proxy\/namespaces\/kube-system\/services\/[_a-z-A-Z0-9:-]+(\/[_a-zA-Z-]+(\/[-a-zA-Z_]+(.[a-zA-z])?)?)?/, pluginsProxyController.pluginsStaticProxy)
  router.delete(/\/api\/v1\/proxy\/namespaces\/kube-system\/services\/[_a-z-A-Z0-9:-]+(\/[_a-zA-Z-]+(\/[-a-zA-Z_]+(.[a-zA-z])?)?)?/, pluginsProxyController.pluginsStaticProxy)

  return router.routes()
}
