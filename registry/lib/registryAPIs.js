/*
* Licensed Materials - Property of paas.enncloud.cn
* (C) Copyright 2015 TenX Cloud. All Rights Reserved.
*/

/* Util classes for docker registry API
 * Document reference: https://docs.docker.com/reference/api/registry_api
 *
 * NOTE: Extension and registry server should use the same protocol
 *
 * v0.1 - 2015-03-21
 * @author Wang Lei
*/

var logger = require('../../utils/logger').getLogger('registryAPIs');
var request = require('request');
var async = require('async');
var registryConfigLoader = require('../registryConfigLoader')

var TokenCacheMgr = []
var TokenExpiredTime = 3600 // seconds

var AdminUserName = 'admin'
/*
 * Docker registry APIs
 */
function DockerRegistryAPIs(registryConfig) {
  if (registryConfig) {
    this.registryConfig = registryConfig
  } else {
    // Get registry config from registry loader
    this.registryConfig = registryConfigLoader.GetRegistryConfig()
  }
}

/*
Search registry repositories

Just need to provide the callback if query all images
    q – what you want to search for
    n - number of results you want returned per page (default: 25, min:1, max:100)
    page - page number of results
    callback - return the query result to callback
*/
DockerRegistryAPIs.prototype.getRepositories = function (user, showDetail, q, page, n, callback) {
  var method = "getRepositories";
  logger.debug(method, "Searching docker images...");

  // If no callback, then will use the 1st parameter as callback, so we can do search all by default
  var requestUrl = this.getAPIPrefix() + "/search";
  if (showDetail) {
    requestUrl += "?showdetail=" + showDetail;
  }
  if (!callback) {
    callback = q;
  } else {
    // Matching all q/page/n to do the search
    requestUrl += "?q=" + q + "&page=" + page + "&n=" + n;
  }
  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, user);
};

DockerRegistryAPIs.prototype.searchRepositories = function (user, search, showDetail, callback) {
  var method = "searchRepositories";
  logger.debug(method, "Searching docker images...");

  // If no callback, then will use the 1st parameter as callback, so we can do search all by default
  var requestUrl = this.getAPIPrefix() + "/search";
  if (search) {
    requestUrl += "?q=" + search + "&showdetail=" + showDetail;
  } else {
    requestUrl += "?q=" + search + "&page=1&n=50&showdetail=" + showDetail;
  }
  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, user);
};

DockerRegistryAPIs.prototype.getTopRepositories = function (count, showDetail, callback) {
  var method = "getTopRepositories";
  logger.debug(method, "Getting top images...");
  var requestUrl = this.getAPIPrefix() + "/toplist?count=" + count + "&showdetail=" + showDetail;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback);
};

/*
Get the repositories that I'm the owner
Make sure we use the username in the session for this API, don't pass in any user name or the private image will
also be returned

*/
DockerRegistryAPIs.prototype.getPrivateRepositories = function (user, showDetail, callback) {
  var method = "getPrivateRepositories";
  logger.debug(method, "Getting my docker images...");
  var requestUrl = this.getAPIPrefix() + "/myrepositories?showdetail=" + showDetail;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, user);
};

/*
Get user repositories without the private ones
*/
DockerRegistryAPIs.prototype.getUserRepositories = function (loginUser, specifiedUser, callback) {
  var method = "getUserRepositories";
  logger.debug(method, "Getting images of " + specifiedUser);
  var requestUrl = this.getAPIPrefix() + "/userrepositories?username=" + specifiedUser;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, loginUser);
};


/*
Get the repositories that my favourites

*/
DockerRegistryAPIs.prototype.getMyfavouritesRepos = function (user, showDetail, callback) {
  var method = "getMyfavouritesRepos";
  logger.debug(method, "Getting my docker images...");
  var requestUrl = this.getAPIPrefix() + "/myfavourites?showdetail=" + showDetail;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, user);
};

/*
Get the repositories that my favourites order by favouriteNumber

*/
DockerRegistryAPIs.prototype.getTopfavRepos = function (user, count, callback) {
  var method = "getTopfavRepos";
  logger.debug(method, "Getting my docker images...");
  var requestUrl = this.getAPIPrefix() + "/topfavlist?count=" + count;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, user);
};

/*
Get the repositories that top contributor list

*/
DockerRegistryAPIs.prototype.getTopContributorList = function (user, count, callback) {
  var method = "getTopContributorList";
  logger.debug(method, "Getting my docker images...");
  var requestUrl = this.getAPIPrefix() + "/topcontributorlist?count=" + count;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, user);
};
/*
Get the information of an image

*/
DockerRegistryAPIs.prototype.getImageInfo = function (user, imageName, callback) {
  var method = "getImageInfo";
  logger.debug(method, "Geting info of image " + imageName);
  var requestUrl = this.getAPIPrefix() + "/image/" + imageName;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, user);
};

// Get the image JSON info from index and registry server
// 1. GET https://index.paas.enncloud.cn/v1/repositories/nkwanglei/testimage/images
// 2. POST https://registry1q.paas.enncloud.cn/v1/images/ffa6f94c9e7d4cbebe6ed39ca7faf9c92a69f07b462ad245c6cc1461e0e1c292/json
/*DockerRegistryAPIs.prototype.getImageJsonInfo = function(user, imageName, tag, callback) {
    var method = "getImageJsonInfo";
    logger.debug(method, "Geting json info of image "+ imageName);
    // Get the image info from the index server first
    var requestUrl = this.getAPIPrefix() + "/repositories/" + imageName + "/images";
    var self = this;
    request.get({
        url: requestUrl,
        json: true,
        headers: self.getAuthorizationHeader(user)
    }, function (err, resp, body) {
        if (err) {
            logger.error(method, err);
            callback(500, body, err);
            return;
        }
        if (callback) {
            // Get the image info from registry server?
            // Get the image id for specified tag
            var statusCode = resp ? resp.statusCode: 200;
            if (resp.statusCode != 200) {
                return callback(404, body);
            }
            var imageId = '';
            var found = false;
            for (var x = 0; x < body.length; x++) {
              var i = body[x];
              var keys = Object.keys(i);
              for (var y = 0; y < keys.length; y++) {
                // check if tag is set
                if (typeof(i['Tag']) !== "undefined" && i['Tag'] == tag) {
                  imageId = i[keys[y]];
                  found = true;
                  break;
                } else if (typeof(i['Tag']) !== "undefined") {
                  // Use the last tag by default if no tag specified
                  imageId = i[keys[y]];
                  y++;
                }
              }
              if (found) {
                break;
              }
            }
            // Get the endpoints in the header
            var registry = resp.headers['x-docker-endpoints'];
            var protocol = resp.request.uri.protocol;
            var statusCode = resp ? resp.statusCode: 200;
            var registryUrl = protocol + "//" + registry + "/v1/images/" + imageId + "/json";
            request.get({
                url: registryUrl,
                json: true,
                headers: self.getAuthorizationHeader(user)
            }, function (err, resp, imageInfo) {
                if (err) {
                    logger.error(method, err);
                    callback(500, this.body, err);
                    return;
                }
                callback(resp.statusCode, imageInfo);
            });
        }
    });
}*/


DockerRegistryAPIs.prototype.getImageConfigInfo = function (user, imageName, callback) {
  var method = "getImageConfigInfo";
  logger.debug(method, "Geting config info of image " + imageName);
  var requestUrl = this.getAPIPrefix() + "/image/config/" + imageName;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, user);
};

/*
Add a new user to docker index server
*/
DockerRegistryAPIs.prototype.addUser = function (userName, password, email, callback) {
  var method = "addUser";
  logger.info(method, "Adding a new user: " + userName);
  var requestUrl = this.getAPIPrefix() + "/users";
  var userInfo = { "username": userName, "password": password, "email": email };

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'POST', userInfo, callback, userName);
};
/*
Update user information
*/
DockerRegistryAPIs.prototype.updateUser = function (userName, password, callback) {
  var method = "updateUser";
  logger.info(method, "Updating user: " + userName);
  var requestUrl = this.getAPIPrefix() + "/users/" + userName;
  var userInfo = { "password": password };

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'PUT', userInfo, callback, userName);
};

/*
For internal operation only  -  BEGIN
*/
DockerRegistryAPIs.prototype.getUserPermission = function (userName, callback) {
  var method = "getUser";
  logger.info(method, "Remove user permission: " + userName);
  var requestUrl = this.getInternalAPIPrefix() + "/users/" + userName + "/permissions";

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', '', callback, userName);
};

DockerRegistryAPIs.prototype.removeUserPermission = function (userName, repoName, callback) {
  var method = "getUser";
  logger.info(method, "Remove user permission: " + userName);
  var requestUrl = this.getInternalAPIPrefix() + "/users/" + userName + "/permissions/" + repoName;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'DELETE', '', callback, userName);
};
/*
For internal operation only  -  END
*/


DockerRegistryAPIs.prototype.updateUserIcon = function (userName, icon, callback) {
  var method = "updateUserIcon";
  logger.info(method, "Updating user: " + userName + "'s icon");
  var requestUrl = this.getAPIPrefix() + "/users/" + userName;
  var userInfo = { "icon": icon };

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'PUT', userInfo, callback, userName);
};

DockerRegistryAPIs.prototype.isUserExist = function (userName, callback) {
  var method = "isUserExist";
  logger.info(method, "Checking if user exist:" + userName);
  var requestUrl = this.getInternalAPIPrefix() + "/users/" + userName;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, userName);
}
/*
Grant permissions to a specified user
index.paas.enncloud.cn/users/admin/permissions
{ "repo": "library", "access": "admin"}
*/
DockerRegistryAPIs.prototype.addPermissions = function (userName, permissions, callback) {
  var method = "addPermissions";
  logger.info(method, "Granting " + permissions + " access to user " + userName);
  var requestUrl = this.getInternalAPIPrefix() + "/users/" + userName + "/permissions";
  var accessInfo = { "repo": userName, "access": permissions };

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'PUT', accessInfo, callback, userName);
};

DockerRegistryAPIs.prototype.grantPermissions = function (repo, user, permissions, callback) {
  var method = "grantPermissions";
  logger.info(method, "Granting " + permissions + " access to user " + user);
  var requestUrl = this.getInternalAPIPrefix() + "/users/" + user + "/permissions";
  var accessInfo = { "repo": repo, "access": permissions };

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'PUT', accessInfo, callback, user);
};

/*
Search tags for repositories
Just need to provide the callback if query all images
    repositoryName - the repository name, like ubuntu, tenxcloud/wordpress, formate: <namespace>/<repository>
    callback - return the query result to callback
*/
/*DockerRegistryAPIs.prototype.getTags = function(user, repositoryName, callback) {
    var method = "getTags";
    logger.debug(method, "Get tags for " + repositoryName);
    var requestUrl = this.getAPIPrefix() + "/image/" + repositoryName + "/tags";

    logger.debug(method, "Request url: " + requestUrl);
    this.sendRequest(requestUrl, 'GET', '', callback, user);
};*/

DockerRegistryAPIs.prototype.getV2AuthTokenForDel = function (user, repositoryName, callback) {
  var method = 'getV2AuthTokenForDel';
  var requestUser = (user == "" ? user : this.registryConfig.user);
  // Use 'admin' for now if user login, so we can always get the tags for all repositories
  var exchangeURL = this.registryConfig.v2AuthServer + "/auth?account=" + requestUser + "&scope=repository:" + repositoryName + ":*&service=" + this.getRegistryHost();
  logger.debug(method, "Request url: " + exchangeURL);
  request.get({
    url: exchangeURL,
    json: true,
    headers: this.getAuthorizationHeader(user)
  }, function (err, resp, body) {
    if (err) {
      logger.error(method, err);
      callback(null);
      return;
    }
    callback(body.token);
  });
};

DockerRegistryAPIs.prototype.getRepoTags = function (token, repositoryName, callback) {
  var method = 'getRepoTags';
  if (!token) {
    callback(null);
    return;
  }
  // Get the tag first ...
  var tagRequestUrl = this.getRegistryUrl() + "/v2/" + repositoryName + "/tags/list";
  request.get({
    url: tagRequestUrl,
    json: true,
    headers: {
      Authorization: "Bearer " + token
    }
  }, function (err, resp, result) {
    if (err) {
      logger.error(method, err);
      callback(null);
      return;
    }
    callback(result.tags);
  });
}

/*

1) Get the token from auth server
curl "https://rv2.paas.enncloud.cn:8000/auth?account=admin&scope=repository%3Aedcapding%2Fgodoc%3Apush%2Cpull&service=rv2.paas.enncloud.cn%3A8001" -H "Authorization:Basic YWRtaW46Q2xvdWQtZHJlYW0hISE="

 2) Get the tags using token
 curl "https://rv2.paas.enncloud.cn:8001/v2/edcapding/godoc/tags/list" -H "Authorization:Bearer <token>"
*/
DockerRegistryAPIs.prototype.getTagsV2 = function (user, repositoryName, callback) {
  var method = "getTagsV2";
  var self = this
  /*
  TODO: Check if it's private repository before get the tags
  */
  logger.debug(method, "Get tags for " + repositoryName);
  // Use 'admin' for now if user login, so we can always get the tags for all repositories
  this.refreshToken(user, repositoryName, function (err, resp, token) {
    if (err) {
      logger.error(method, err);
      callback(500, resp, err);
      return;
    }
    if (callback) {
      // Get the image info from registry server?
      // Get the image id for specified tag
      var statusCode = resp ? resp.statusCode : 200;
      if (resp.statusCode != 200) {
        return callback(404, resp);
      }
      var tagRequestUrl = self.getRegistryUrl() + "/v2/" + repositoryName + "/tags/list";
      logger.info("Get tag url: " + tagRequestUrl);
      request.get({
        url: tagRequestUrl,
        json: true,
        headers: {
          Authorization: "Bearer " + token
        }
      }, function (err, resp, result) {
        if (err) {
          logger.error(method, err);
          callback(500, resp, err);
          return;
        }
        callback(resp.statusCode, result.tags);
      });
    }
  });
};

DockerRegistryAPIs.prototype.refreshToken = function (user, repository, callback) {
  var method = 'refreshToken'
  var requestUser = (user == "" ? user : this.registryConfig.user);
  var exchangeURL = this.registryConfig.v2AuthServer + "/auth?account=" + requestUser + "&scope=repository:" + repository + ":pull&service=" + this.getRegistryHost();
  // Use exchangeURL as the key
  if (TokenCacheMgr[exchangeURL]) {
    var timePeriod = new Date() - TokenCacheMgr[exchangeURL].lastRefreshTime
    if (timePeriod / 1000 < TokenExpiredTime) {
      return callback(null, { statusCode: 200 }, TokenCacheMgr[exchangeURL].lastToken)
    }
  }
  logger.debug("Request url: " + exchangeURL);
  var self = this;

  request.get({
    url: exchangeURL,
    json: true,
    headers: self.getAuthorizationHeader(user)
  }, function (err, resp, body) {
    if (err) {
      logger.error(method, err);
      callback(err, resp, body);
    } else {
      // Add to cache
      TokenCacheMgr[exchangeURL] = {
        lastRefreshTime: new Date(),
        lastToken: body.token
      }
      callback(null, resp, body.token);
    }
  })
}

/*
v1: not used now
curl 127.0.0.1:5000/v2/<repo>/manifests/<tag>

*/
DockerRegistryAPIs.prototype.getImageSize = function (user, repositoryName, tag, callback) {
  var method = "getImageSize";
  /*
  TODO: Check if it's private repository before get the size
  */
  logger.debug(method, "Get size for " + repositoryName);
  // Use 'admin' for now if user login, so we can always get the tags for all repositories
  var requestUser = (user == "" ? user : this.registryConfig.user);
  var exchangeURL = this.registryConfig.v2AuthServer + "/auth?account=" + requestUser + "&scope=repository:" + repositoryName + ":pull&service=" + this.getRegistryHost();
  logger.debug(method, "Request url: " + exchangeURL);
  var self = this;

  request.get({
    url: exchangeURL,
    json: true,
    headers: self.getAuthorizationHeader(user)
  }, function (err, resp, body) {
    if (err) {
      logger.error(method, err);
      callback(500, body, err);
      return;
    }
    if (callback) {
      // Get the image info from registry server?
      // Get the image id for specified tag
      var statusCode = resp ? resp.statusCode : 200;
      if (resp.statusCode != 200) {
        return callback(404, body);
      }
      var token = body.token;
      var manifestRequestUrl = self.getRegistryUrl() + "/v2/" + repositoryName + "/manifests/" + tag;
      logger.info("Get manifests url: " + manifestRequestUrl);
      request.get({
        url: manifestRequestUrl,
        json: true,
        headers: {
          Accept: "application/vnd.docker.distribution.manifest.v2+json",
          Authorization: "Bearer " + token
        }
      }, function (err, resp, result) {
        if (err) {
          logger.error(method, err);
          callback(500, this.body, err);
          return;
        }
        var totalSize = 0;
        if (result && result.layers) {
          result.layers.forEach(function (layerInfo) {
            if (layerInfo.size) {
              totalSize += layerInfo.size;
            }
          });
        }
        logger.info("Size of " + repositoryName + ": " + totalSize);
        callback(resp.statusCode, totalSize);
      });
    }
  });
};

DockerRegistryAPIs.prototype.getImageJsonInfoV2 = function (user, repositoryName, tag, callback, isGetManifest) {
  var method = "getImageJsonInfoV2";
  /*
  TODO: Check if it's private repository before get the tags
  */
  logger.debug(method, "Get tags for " + repositoryName);
  var requestUser = (user == "" ? user : this.registryConfig.user);
  var self = this;

  async.waterfall([
    function (callback) {
      self.refreshToken(requestUser, repositoryName, function (err, resp, token) {
        if (err) {
          logger.error(method, err);
          callback(err, resp);
        } else {
          callback(null, token);
        }
      });
    },
    function (token, callback) {
      // Get the tag first ...
      var tagRequestUrl = self.getRegistryUrl() + "/v2/" + repositoryName + "/tags/list";
      request.get({
        url: tagRequestUrl,
        json: true,
        headers: {
          Authorization: "Bearer " + token
        }
      }, function (err, resp, result) {
        if (err) {
          callback(err, result);
        } else {
          if (result.tags) {
            var newTag = tag;
            for (var y = 0; y < result.tags.length; y++) {
              // check if tag is set
              if (typeof (result.tags[y]) !== "undefined" && result.tags[y] == tag) {
                newTag = tag;
                break;
              } else if (typeof (result.tags[y]) !== "undefined") {
                // Use the last tag by default if no tag specified
                newTag = result.tags[y];
              }
            }
            logger.info("Tag: " + newTag);
            callback(null, token, newTag);
          } else {
            logger.error("Failed to find any tag:" + JSON.stringify(result));
            callback("Failed to find any tag", result);
          }
        }
      });
    },
    function (token, tag, callback) {
      var jsonInfoRequestUrl = self.getRegistryUrl() + "/v2/" + repositoryName + "/manifests/" + tag;
      logger.info("Get image json url: " + jsonInfoRequestUrl);
      request.get({
        url: jsonInfoRequestUrl,
        json: true,
        headers: {
          Authorization: "Bearer " + token
        }
      }, function (err, resp, configInfo) {
        if (err) {
          logger.error(method, err);
          callback(err, configInfo);
          return;
        }
        var layerRequestUrl = self.getRegistryUrl() + "/v2/" + repositoryName + "/manifests/" + tag;
        logger.info("Get layer info url: " + layerRequestUrl);
        request.get({
          url: layerRequestUrl,
          json: true,
          headers: {
            Accept: "application/vnd.docker.distribution.manifest.v2+json",
            Authorization: "Bearer " + token
          }
        }, function (err, resp, layerInfo) {
          if (err) {
            logger.error(method, err);
            callback(500, this.body, err);
            return;
          }
          logger.debug(JSON.stringify(layerInfo));
          // Return the config info of latest layer
          var result = {}
          if (isGetManifest) {
            result = configInfo
            callback(null, result);
            return
          } else {
            if (configInfo && configInfo.history) {
              result.configInfo = configInfo.history[0].v1Compatibility;
            }
          }
          var totalSize = 0
          var length = 0
          if (layerInfo && layerInfo.layers) {
            length = layerInfo.layers.length
            layerInfo.layers.forEach(function (layerInfo) {
              if (layerInfo.size) {
                totalSize += layerInfo.size;
              }
            });
          }
          result.sizeInfo = {
            "layerLength": length,
            "totalSize": totalSize
          }
          logger.info("Size of " + repositoryName + ": " + totalSize);
          callback(null, result);
        });
      });
    }],
    function (err, result) {
      if (err) {
        callback(500, result, err);
      } else {
        callback(200, result, null);
      }
    }
  );
};

/*
Update the star number of the image
*/
DockerRegistryAPIs.prototype.increaseStarNumber = function (imageName, callback) {
  var method = "increaseStarNumber";
  logger.info(method, "Increase star number of " + imageName);
  var requestUrl = this.getAPIPrefix() + "/image/" + imageName + "/star";

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'POST', '', callback);
};

/*
Update the download number of the image
*/
DockerRegistryAPIs.prototype.increaseDownloadNumber = function (imageName, callback) {
  var method = "increaseStarNumber";
  logger.info(method, "Increase star number of " + imageName);
  var requestUrl = this.getAPIPrefix() + "/image/" + imageName + "/download";

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'POST', '', callback);
};

/*
Update protected information of the image
We need to specify the properties to be update in imageObj, currently we can support:
1) description
2) detail
3) isPrivate

*/
DockerRegistryAPIs.prototype.updateImageInfo = function (user, imageObj, callback) {
  var method = "updateImageInfo";
  logger.info(method, "Update image information using " + JSON.stringify(imageObj));
  // imageObj.name should be in format namespace/repo
  var requestUrl = this.getAPIPrefix() + "/image/" + imageObj.name;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'POST', imageObj, callback, user);
};

/*
Update protected configuration information of the image
We need to specify the properties to be update in imageConfigObj, currently we can support:
1) containerPort
2) defaultEnv
3) isPrivate
*/
DockerRegistryAPIs.prototype.updateImageConfigInfo = function (user, imageConfigObj, callback) {
  var method = "updateImageConfigInfo";
  logger.info(method, "Update image config information using " + imageConfigObj);
  var requestUrl = this.getAPIPrefix() + "/image/config/" + imageConfigObj.name;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'POST', imageConfigObj, callback, user);
};

/*
Remove the image from index server, but don't remove the image binary, as Docker don't have this kind of API
for now.
*/
DockerRegistryAPIs.prototype.deleteImage = function (user, imageName, callback) {
  var method = "deleteImage";
  logger.info(method, "Deleting image " + imageName);
  var self = this;
  var token = null;
  var tags = null;
  async.series([
    // 获取所有tags，以便清除对应的manifests
    function (cb) {
      self.getV2AuthTokenForDel(user, imageName, function (result) {
        token = result;
        cb(null);
      });
    },
    function (cb) {
      self.getRepoTags(token, imageName, function (result) {
        tags = result;
        cb(null);
      });
    },
    //异步删除镜像并清理manifest
    function (cb) {
      async.parallel([
        function (cb) {
          var requestUrl = self.getInternalAPIPrefix() + "/image/" + imageName;
          logger.debug(method, "Request url: " + requestUrl);
          self.sendRequest(requestUrl, 'DELETE', '', callback, user);
          cb(null);
        },
        function (cb) {
          //删除所有tags对应的manifests
          if (tags && tags.length > 0) {
            self.deleteManifest(token, imageName, tags[0], function (err, resp, body) {
              if (err) {
                logger.error(method, "failed to delete manifest", err);
              } else if (resp && 405 === resp.statusCode && 'UNSUPPORTED' === body.errors[0].code) {
                //如果registry禁止删除操作，则不需要再发送删除请求
                logger.warn(method, 'deletion operation is not allowed by registry');
              } else {
                //为避免一次性产生过多网络连接，此处使用同步方式依次删除manifests。
                tags.slice(1).forEach(function (tag) {
                  self.deleteManifest(token, imageName, tag, function (err, resp, body) {
                    // 删除出错时记录
                    if (err) {
                      logger.error(method, "failed to delete manifest", err);
                    } else if (resp && 202 !== resp.statusCode) {
                      logger.error(method, "failed to delete manifest", body);
                    }
                  });
                });
              }
            });
          } //if (tags && tags.length > 0)
          cb(null);
        } // function (cb)
      ]); // async.parallel
      cb(null);
    } // function (cb) {
  ]); // async.series
};

DockerRegistryAPIs.prototype.deleteManifest = function (token, repositoryName, tag, callback) {
  var method = 'deleteManifest';
  if (!token) {
    callback('no token');
    return
  }
  var delHeader = { Authorization: "Bearer " + token };
  // registry2.3及以上版本修改了schema在获取digest时需要
  var getHeader = {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.docker.distribution.manifest.v2+json"
  };
  var baseUrl = this.getRegistryUrl() + "/v2/" + repositoryName + "/manifests";
  //registry不允许直接使用tag删除manifest，因此要先获取对应的digest
  request.head({
    url: baseUrl + "/" + tag,
    json: true,
    headers: getHeader
  }, function (err, resp, result) {
    if (err) {
      logger.error(method, "failed to get manifest digest of " + repositoryName, err);
      callback(err);
      return;
    }
    //获取digest后，请求删除API
    var digest = resp.headers['docker-content-digest'];
    request.del({
      url: baseUrl + "/" + digest,
      json: true,
      headers: delHeader
    }, function (err, resp, result) {
      if (err) {
        logger.error(method, "failed to delete manifest of " + repositoryName, err);
        callback(err);
        return;
      }
      callback(err, resp, result);
    });
  });
}

/*
Webhook related APIs
*/
/* Add webhook
1) URL
https://index.paas.enncloud.cn/webhooks/nkwanglei/node-js-sample33
2) Body
{"events": ["new"], "url": "http://staging.paas.enncloud.cn:9000"}
3) return data
{"message":"webhook created","id":"00da29e5a7aed489ad629e638c9ff4294331848b","events":["new"]}
*/
DockerRegistryAPIs.prototype.addWebhook = function (user, imageName, webhookUrl, secret, callback) {
  var method = "addWebhook";
  logger.info(method, "Adding webhook " + imageName);
  var requestUrl = this.getInternalAPIPrefix() + "/webhooks/" + imageName;

  logger.debug(method, "Request url: " + requestUrl);
  // Don't handle the new event for now...
  this.sendRequest(requestUrl, 'POST', { "events": ["existing"], "url": webhookUrl, "secret": secret }, callback, user);
};

/*
https://index.paas.enncloud.cn/webhooks/nkwanglei/node-js-sample33/00da29e5a7aed489ad629e638c9ff4294331848b
*/
DockerRegistryAPIs.prototype.removeWebhook = function (user, imageName, webhookId, callback) {
  var method = "removeWebhook";
  logger.info(method, "Removing webhook " + imageName);
  var requestUrl = this.getInternalAPIPrefix() + "/webhooks/" + imageName + "/" + webhookId;

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'DELETE', '', callback, user);
};

/*
Add a new image config to docker index server
*/
/*
DockerRegistryAPIs.prototype.addImageConfig = function(user, imageConfigObj, callback) {
    var method = "addImageConfig";
    logger.info(method, "Adding a new image config: " + imageConfigObj.name );
    var requestUrl = this.getAPIPrefix() + "/image/config/" + imageConfigObj.name;
    logger.info(method, "Request url: " + requestUrl);
    this.sendRequest(requestUrl, 'POST', imageConfigObj, callback, user);
};
*/

DockerRegistryAPIs.prototype.sendRequest = function (requestUrl, httpMethod, data, callback, user) {
  var method = "sendRequest";
  logger.debug(method, "Sending request: " + requestUrl);
  var requestAction = request.get;
  data = (data == null ? "" : data)
  if (httpMethod == 'POST') {
    requestAction = request.post;
  } else if (httpMethod == 'PUT') {
    requestAction = request.put;
  } else if (httpMethod == 'DELETE') {
    requestAction = request.del;
  }
  logger.debug(method, this.getAuthorizationHeader(user));
  logger.debug(method, data);
  requestAction({
    url: requestUrl,
    json: true,
    body: data,
    headers: this.getAuthorizationHeader(user)
  }, function (err, resp, body) {
    if (err) {
      logger.error(method, err);
      callback(500, body, err);
      return;
    }
    if (callback) {
      var statusCode = resp ? resp.statusCode : 200;
      if (!resp) {
        logger.error("No response? " + resp);
      }
      callback(resp.statusCode, body);
    }
  });
};

/*
For registry v2 extension service
*/
DockerRegistryAPIs.prototype.getAPIPrefix = function () {
  var APIPrefix = this.registryConfig.protocol + "://" + this.registryConfig.host
  if (this.registryConfig.port && this.registryConfig.port != 80) {
    APIPrefix += ":" + this.registryConfig.port
  }
  APIPrefix += '/v1'
  return APIPrefix
}

DockerRegistryAPIs.prototype.getInternalAPIPrefix = function () {
  var internalAPIPrefix = this.registryConfig.protocol + "://" + this.registryConfig.host
  if (this.registryConfig.port && this.registryConfig.port != 80) {
    internalAPIPrefix += ":" + this.registryConfig.port
  }
  return internalAPIPrefix
}

DockerRegistryAPIs.prototype.getAuthorizationHeader = function (onbehalfUser) {
  var authHeader = {
    'Authorization': 'Basic ' + Buffer(this.registryConfig.user + ':' + this.registryConfig.password).toString('base64')
  };
  // Only admin user can use onbehalfUser
  if (this.registryConfig.user == AdminUserName && onbehalfUser) {
    authHeader.onbehalfuser = onbehalfUser;
  }
  return authHeader;
}

// For user or teamspace
DockerRegistryAPIs.prototype.getRepositoryStats = function (username, callback) {
  var method = "getRepositoryStats";
  logger.debug(method, "Querying repository stats ...");

  var requestUrl = this.getAPIPrefix() + "/repositories/stats";

  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback, username);
}

// Return the host of registry server
DockerRegistryAPIs.prototype.getRegistryHost = function () {
  var registryServerHost = this.registryConfig.v2Server
  if (this.registryConfig.v2Server.indexOf('http://') >= 0 || this.registryConfig.v2Server.indexOf('https://') >= 0) {
    registryServerHost = this.registryConfig.v2Server.substring(this.registryConfig.v2Server.indexOf('://') + 3)
  }
  return registryServerHost
}

DockerRegistryAPIs.prototype.getRegistryUrl = function () {
  var registryServerUrl = this.registryConfig.v2Server
  if (this.registryConfig.v2Server.indexOf('http://') >= 0 || this.registryConfig.v2Server.indexOf('https://') >= 0) {
    return registryServerUrl
  } else {
    // Use same protocol as extension one
    return this.registryConfig.protocol + '://' + this.registryConfig.v2Server
  }
}

module.exports = DockerRegistryAPIs;
