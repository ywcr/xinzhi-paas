/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Registry factory
 *
 * v0.1 - 2016-10-10
 * @author Zhangpc
 */
'use strict'
const registryAPIs = require('../registry/lib/registryAPIs')
const markdown     = require('markdown-it')()
const logger       = require('../utils/logger.js').getLogger("tenx_registry")
const registryConfigLoader = require('../registry/registryConfigLoader')

const TenxCloudOfficialHub = {
  "protocol": "https",
  "host": "rv2-ext.tenxcloud.com",
  "port": "",
  "user": "",
  "password": "",
  "v2Server": "index.tenxcloud.com",
  "v2AuthServer": "https://rv2-ext.tenxcloud.com:5001"
}

var TenxHubConfig = []

exports.getTenxHubConfig = function(){
  return TenxHubConfig
}

exports.getUserTenxHubConfig = function(username) {
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().host) {
    // Return system level config from tenx_configs
    return registryConfigLoader.GetRegistryConfig()
  } else {
    // Return the user defined one
    return TenxHubConfig[username]
  }
}

exports.getOfficialTenxCloudHub = function() {
  return TenxCloudOfficialHub
}
/*
Get public images

Default will be official service like hub.paas.enncloud.cn

*/
exports.getImages = function (username, search) {
  var defaultConfig = this.getUserTenxHubConfig(username)
  // Use default if not specified
  if (!defaultConfig || !defaultConfig.host) {
    logger.info("Using index.tenxcloud.com...")
    defaultConfig = TenxCloudOfficialHub
  }
  const registry = new registryAPIs(defaultConfig)
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.searchRepositories(username, search, 0, function (statusCode, data, err) {
      if (err) {
        reject(err)
        return
      }
      if (statusCode > 300) {
        logger.error('Failed to get public repositories -> ' + statusCode)
        err = new Error('Failed to get public repositories')
        err.status = statusCode
        reject(err)
        return
      }
      resolve(data.results)
    })
  })
}

exports.getImageTags = function (username, imageFullName) {
  var defaultConfig = this.getUserTenxHubConfig(username)
  // Use default if not specified
  if (!defaultConfig || !defaultConfig.host) {
    logger.info("Using index.tenxcloud.com...")
    defaultConfig = TenxCloudOfficialHub
  }
  const registry = new registryAPIs(defaultConfig)
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getTagsV2(username, imageFullName, function (statusCode, tags, err) {
      if (err) {
        reject(err)
        return
      }
      if (statusCode > 300) {
        logger.error('Failed to get image tags -> ' + statusCode)
        err = new Error('Failed to get image tags')
        err.status = statusCode
        reject(err)
        return
      }
      resolve(tags)
    })
  })
}

exports.getImageConfigs = function (username, imageFullName, tag) {
  var defaultConfig = this.getUserTenxHubConfig(username)
  // Use default if not specified
  if (!defaultConfig || !defaultConfig.host) {
    logger.info("Using index.tenxcloud.com...")
    defaultConfig = TenxCloudOfficialHub
  }
  const registry = new registryAPIs(defaultConfig)
  if (username) {
    username = username.toLowerCase()
  }
  var self = this
  return new Promise(function (resolve, reject) {
    registry.getImageJsonInfoV2(username, imageFullName, tag, function (statusCode, configs, err) {
      if (err) {
        reject(err)
        return
      }
      if (statusCode > 300) {
        logger.error('Failed to get image configs -> ' + statusCode)
        err = new Error('Failed to get image configs')
        err.status = statusCode
        reject(err)
        return
      }
      if (!configs.configInfo) {// Probably the image was corrupted
        logger.error('Failed to get image configs -> ' + statusCode)
        err = new Error('Failed to get image configs')
        err.status = 500
        reject(err)
        return
      }
      var result = self.FormatImageInfo(JSON.parse(configs.configInfo), imageFullName, tag)
      result.sizeInfo = configs.sizeInfo
      resolve(result)
    })
  })
}

exports.getImageInfo = function(username, imageFullName, isCheckOnly) {
  var defaultConfig = this.getUserTenxHubConfig(username)
  // Use default if not specified
  if (!defaultConfig || !defaultConfig.host) {
    logger.info("Using index.tenxcloud.com...")
    defaultConfig = TenxCloudOfficialHub
  }
  const registry = new registryAPIs(defaultConfig)
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getImageInfo(username, imageFullName, function (statusCode, imageInfo, err) {
      statusCode = parseInt(statusCode)
      if (err) {
        reject(err)
        return
      }
      if (statusCode > 300) {
        // Indicate whether the current user is the owner
        logger.error("Failed to get image information: " + statusCode)
        err = new Error('Failed to get image information: ' + imageInfo)
        err.status = statusCode
        if (isCheckOnly) {
          resolve(err)
        } else {
          reject(err)
        }
        return
      }
      if (imageInfo && imageInfo.contributor == username) {
        imageInfo.isOwner = true
      }
      if (imageInfo.detail) {
        imageInfo.detailMarkdown = markdown.render(imageInfo.detail)
      } else {
        imageInfo.detailMarkdown = imageInfo.detail
      }
      if (!imageInfo.dockerfile) {
        imageInfo.dockerfile = ''
      }
      resolve(imageInfo)
    })
  })
}

exports.deleteImage = function(username, imageName, callback) {
  const registry = new registryAPIs(this.getUserTenxHubConfig(username))
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.deleteImage(username, imageName, function(statusCode, result, err) {
      if (err) {
        reject(err)
      }
      if (statusCode < 300) {
        resolve(statusCode)
      } else {
        if (statusCode == 404) {
          // Don't return error if the image was already removed
          logger.warn("Return OK for now, as the image already does not exit")
          resolve(result)
        } else {
          logger.error("Failed to delete image -> " + statusCode)
          err = 'Failed to delete image:' + result
        }
        reject(err)
      }
    })
  })
}

/*
Service to get the repostories for specified user including private repositories
*/
exports.getPrivateRepositories = function(username, showDetail) {
  var registry = new registryAPIs(this.getUserTenxHubConfig(username))
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getPrivateRepositories(username, showDetail, function(statusCode, respositories, err) {
      if (err) {
        reject(err)
      }
      if (statusCode < 300) {
        logger.debug('getPrivateRepositories', 'Return my repositories: ' + JSON.stringify(respositories))
        resolve(respositories.results)
      } else {
        logger.error("Failed to get my repositories -> " + statusCode)
        err = 'Failed to get my repositories: ' + respositories
        reject(err)
      }
    })
  })
}

/*
Service to get the repostories for specified user including private repositories
*/
exports.getFavouriteRepositories = function(username, showDetail) {
  var registry = new registryAPIs(this.getUserTenxHubConfig(username))
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.getMyfavouritesRepos(username, showDetail, function(statusCode, respositories, err) {
      if (err) {
        reject(err)
      }
      if (statusCode < 300) {
        logger.debug('getFavouriteRepositories', 'Return my favourite repositories: ' + JSON.stringify(respositories))
        resolve(respositories.results)
      } else {
        logger.error("Failed to get my repositories -> " + statusCode)
        err = 'Failed to get my repositories: ' + respositories
        reject(err)
      }
    })
  })
}

/*
Service to update image info, for example:
1) Mark as favourite: myfavourite = 1
*/
exports.updateImageInfo = function(username, imageObj) {
  var registry = new registryAPIs(this.getUserTenxHubConfig(username))
  if (username) {
    username = username.toLowerCase()
  }
  return new Promise(function (resolve, reject) {
    registry.updateImageInfo(username, imageObj, function(statusCode, result, err) {
      if (err) {
        return reject(err)
      }
      if (statusCode < 300) {
        resolve(result)
      } else {
        logger.error("Failed to update image information -> " + statusCode)
        err = 'Failed to update image information: ' + JSON.stringify(result)
        reject(err)
      }
    })
  })
}

/*
Only for admin user to use, and only get the number of all images
*/
exports.queryRegistryStats = function(username) {
  var registry = new registryAPIs(this.getUserTenxHubConfig(username))
  return new Promise(function (resolve, reject) {
    registry.getRepositoryStats(username, function(statusCode, result, err) {
      if (err) {
        return reject(err)
      }
      if (statusCode < 300) {
        resolve(result)
      } else {
        logger.error("Failed to get all images -> " + statusCode)
        err = 'Failed to get all images: ' + JSON.stringify(result)
        reject(err)
      }
    })
  })
}

exports.FormatImageInfo = function(imageInfo, imageName, tag) {
  var image = {}
  if (!imageInfo) {
    return image
  }
  if (imageInfo.id) {
    image.id = imageInfo.id
  }
  if (imageName) {
    image.name = imageName
  }
  if (tag) {
    image.tag = tag
  }
  if (imageInfo.os) {
    image.os = imageInfo.os
  }
  if (imageInfo.docker_version) {
    image.docker_version = imageInfo.docker_version
  }
  if (imageInfo.config) {
    if (imageInfo.config.ExposedPorts) {
      image.containerPorts = _getValueName(imageInfo.config.ExposedPorts)
    }
    if (imageInfo.config.Volumes) {
      image.mountPath = _getValueName(imageInfo.config.Volumes)
    }
    if (imageInfo.config.Env) {
      image.defaultEnv = imageInfo.config.Env
    }
    image.cmd = imageInfo.config.Cmd
    image.entrypoint = imageInfo.config.Entrypoint
  }
  return image
}

function _getValueName(Obj) {
  var nameArray = []
  if (!Obj || typeof Obj !== 'object') {
    return nameArray
  }
  for (let valueName in Obj) {
    nameArray.push(valueName)
  }
  return nameArray
}