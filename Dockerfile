FROM mhart/alpine-node:latest
ENV APP_ROOT /var/lib/jenkins/workspace/sghen-node-server
WORKDIR ${APP_ROOT}
COPY ./ ${APP_ROOT}
RUN npm install
EXPOSE 8282
CMD npm start
