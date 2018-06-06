#! /bin/bash

kubectl exec rd-0 -- /opt/redis/redis-cli -h rd-0.redis SET replicated:test true
kubectl exec rd-2 -- /opt/redis/redis-cli -h rd-2.redis GET replicated:test

