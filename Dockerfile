FROM node:latest
ENV APP_ROOT /var/lib/jenkins/workspace-go/src/go-sghen
WORKDIR ${APP_ROOT}
COPY ./ ${APP_ROOT}
RUN npm install
EXPOSE 80
CMD npm start
