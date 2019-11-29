"use strict";

let app = '/root/project/jujubeServer';

let MyConf = {}

MyConf.requires = {
  myDev: app + '/common/MyDev',
  myUtil: app + '/common/MyUtil',
  dbTool: app + '/common/dbTool',
}

MyConf.paths = {
  model: app + '/model',
  common: app + '/common',
  config: app + '/config',
}

MyConf.urls = {
  front: 'http://106.53.26.252:3000',
}

MyConf.sockets = {
  hall: '106.53.26.252:9001',
}

MyConf.db = {
  host: "127.0.0.1",
  username: "root",
  password: "123456",
  database: "jujube",
}

module.exports = MyConf;
