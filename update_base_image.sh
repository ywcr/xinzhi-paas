#!/bin/bash
set -e
# docker login
docker login -e zhangpc@tenxcloud.com -u zhangpc -p 11111111 192.168.1.113
# build base image
base_image="192.168.1.113/zhangpc/user-portal:base-4.4.7"
docker build -t ${base_image} -f Dockerfile.base .
# push base image
docker push ${base_image}