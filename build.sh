#!/bin/sh
set -e
# build document

MODE=${RUNNING_MODE}
CLEAN_ALL_FILES_FLAG="false"
build_user_portal() {
  set -x
  echo "start build frontend files ..."
  outputPath="static/bundles"
  # rm -rf dist
  rm -rf ${outputPath}

  node_modules/.bin/webpack -p --progress

  cp ${outputPath}/zh.*.js ${outputPath}/zh.js
  rm -f ${outputPath}/zh.*.js
  cp ${outputPath}/en.*.js ${outputPath}/en.js
  rm -f ${outputPath}/en.*.js

  set +x
}

build_user_portal_backend() {
  set -x
  echo "start build backtend files ..."
  outputPath="dist"
  tmp="user_portal_tmp"

  # 如果在私有云，在构建之前删除只有在 standard 模式下用到的代码（支付宝、微信配置等）
  if [ "${MODE}" = "enterprise" ] && [ "${CLEAN_ALL_FILES_FLAG}" = "true" ]; then
      echo "***********************************"
      echo "* will delete standard files      *"
      echo "***********************************"
      rm -rf 3rd_account/wechat
      rm -rf configs/_standard
      rm -rf controllers/_standard
      rm -rf pay
      rm -rf routes/_standard
      rm -f store/qiniu_api.js
  fi

  node_modules/.bin/webpack --config webpack.config.backend.js --progress

  # 如果在执行脚本时传递 '--clean=all' 参数，构建完成后会删除源文件
  if [ "${CLEAN_ALL_FILES_FLAG}" = "true" ]; then
      mkdir -p ${tmp}
      # copy files to tmp dir
      cp ${outputPath}/app.js ${tmp}/app.js
      cp -rf static ${tmp}/
      cp index.html ${tmp}/index.html
      cp package.json ${tmp}/package.json
      # rm all source files
      ls | grep -v ${tmp} | grep -v node_modules | grep -v templates | xargs rm -rf
      mv ${tmp}/* ./
      rm -rf ${tmp}
  else
      cp ${outputPath}/app.js ./backend.js
  fi

  set +x
}

project="user-portal 2.0"
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  cat << EOF
Run the command the build release of the ${project}:
sh build.sh
EOF
#注意： Windows下也可使用（需要安装git）
else
  echo "start build ${project}"
  echo "node_env: ${NODE_ENV}"
  echo "running_mode: ${MODE}"
  # build frontend files
  build_user_portal
  # build backend files
  # 只有在私有云，而且在执行脚本时传递 '--build=all' 参数，才会构建后端代码
  if [ "${MODE}" = "enterprise" ] && [ "$1" = "--build=all" ]; then
      echo "***********************************"
      echo "* will build backend              *"
      if [ "$2" = "--clean=all" ]; then
          echo "* will delete all source files ...*"
          CLEAN_ALL_FILES_FLAG="true"
      fi
      echo "***********************************"
      build_user_portal_backend
  fi
  echo "build ${project} success"
fi
