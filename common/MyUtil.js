let util = {
  toJson: function(data = {}, ret = 0, message = '') {
    return JSON.stringify({data, ret, message});
  },

  retObj: function(data = {}, ret = 0, message = '') {
    data.ret = ret;
    data.message = message;
    return data;
  }
}

module.exports = util;
