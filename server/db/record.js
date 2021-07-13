var fs;

fs = require("fs");

this.Record = (function() {
  function Record(table, cluster, id, data1) {
    this.table = table;
    this.cluster = cluster;
    this.id = id;
    this.data = data1;
    this.data.id = this.id;
    this.data = JSON.stringify(this.data);
  }

  Record.prototype.get = function() {
    return JSON.parse(this.data);
  };

  Record.prototype.set = function(data) {
    var old_data;
    old_data = this.data;
    this.data = data;
    this.data.id = this.id;
    this.data = JSON.stringify(this.data);
    this.cluster.save_requested = true;
    return this.table.updateIndexes(this, old_data, data);
  };

  Record.prototype.setField = function(field, value) {
    var data;
    data = this.get();
    if (value == null) {
      delete data[field];
    } else {
      data[field] = value;
    }
    return this.set(data);
  };

  Record.prototype.getField = function(field) {
    var data;
    data = this.get();
    return data[field];
  };

  return Record;

})();

module.exports = this.Record;
