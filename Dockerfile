FROM  node:6.9.2

ENV NODE_ENV production
ENV RUNNING_MODE enterprise

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN mkdir -p /usr/src/app
ADD . /usr/src/app/

WORKDIR /usr/src/app

RUN npm cache clean --force
RUN npm install --registry=https://registry.npm.taobao.org

EXPOSE 8003

CMD ["node", "app.js"]
