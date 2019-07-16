"use strict";

let app = '/root/test/jujubeServer';

let MyConf = {}

MyConf.requires = {
  myDev: app + '/common/MyDev',
  myUtil: app + '/common/MyUtil',
  dbTool: app + '/common/dbTool',
}

MyConf.paths = {
  model: app + '/model',
  config: app + '/config',
}

MyConf.urls = {
  front: 'http://47.100.99.3:3000',
}

MyConf.sockets = {
  hall: '47.100.99.3:9001',
}

MyConf.db = {
  host: "127.0.0.1",
  username: "root",
  password: "123456",
  database: "jujube",
}

module.exports = MyConf;
