PREFIX = harbor.enncloud.cn/lijiaob
TAG = v2.2.0-no-certs

SOURCE_DIR=$(shell pwd)
PROJECT=$(shell basename $(SOURCE_DIR))
IMAGE=$(PREFIX)/portal:$(TAG)

.PHONY: all image build
all: build

build:
	docker run --rm -v $(SOURCE_DIR):/home/node/$(PROJECT) -w /home/node/$(PROJECT) \
		-e RUNNING_MODE="enterprise" \
		node:6.9.2 \
		/bin/sh -c "npm cache clean --force && npm install --registry=https://registry.npm.taobao.org && npm run build"

image:
	docker build -t $(IMAGE) .
	echo $(IMAGE)

run:
	docker run -idt  \
		-e NODE_ENV="production" \
		-e RUNNING_MODE="enterprise" \
		-e TENX_API_HOST="10.39.0.119:9001" \
		-e DEVOPS_HOST="10.39.0.119:38090" \
		-p 8003:8003 \
		$(IMAGE)
