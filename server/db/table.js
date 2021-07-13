var CLUSTER_SIZE, Cluster, Record, fs;

fs = require("fs");

Record = require("./record.js");

CLUSTER_SIZE = 1000;

this.Table = (function() {
  function Table(db, name) {
    this.db = db;
    this.name = name;
    this.folder = this.db.folder + "/" + this.name;
    this.records = {};
    this.clusters = {};
    this.indexes = {};
    this.current_id = 0;
    if (!fs.existsSync(this.folder)) {
      fs.mkdirSync(this.folder);
    } else {
      this.load();
    }
    this.scheduler = setInterval(((function(_this) {
      return function() {
        return _this.timer();
      };
    })(this)), 2000);
  }

  Table.prototype.close = function() {
    return clearInterval(this.scheduler);
  };

  Table.prototype.load = function(dir) {
    var cluster, fi, files, funk, queue;
    if (dir == null) {
      dir = this.folder;
    }
    files = fs.readdirSync(dir);
    queue = [];
    cluster = 0;
    while (true) {
      if (files.indexOf(cluster + "") < 0 && files.indexOf(cluster + ".bak") < 0) {
        break;
      }
      fi = dir + "/" + cluster;
      queue.push(cluster);
      cluster++;
    }
    funk = (function(_this) {
      return function() {
        var f;
        if (queue.length > 0) {
          f = queue.splice(0, 1)[0];
          console.info("loading cluster " + f);
          cluster = new Cluster(_this, f | 0);
          _this.clusters[f | 0] = cluster;
          return cluster.load(funk);
        } else {
          _this.loaded = true;
          return _this.db.tableLoaded();
        }
      };
    })(this);
    funk();
  };

  Table.prototype.create = function(data) {
    var cluster, cluster_id, record;
    cluster_id = Math.floor(this.current_id / CLUSTER_SIZE);
    cluster = this.clusters[cluster_id];
    if (cluster == null) {
      cluster = new Cluster(this, cluster_id);
      this.clusters[cluster_id] = cluster;
    }
    record = new Record(this, cluster, this.current_id++, data);
    cluster.addRecord(record);
    return this.records[record.id] = record;
  };

  Table.prototype.updateIndexes = function(record, old_data, data) {
    var i, index, key, v, value;
    for (key in old_data) {
      value = old_data[key];
      if (data[key] !== value) {
        index = this.indexes[key];
        if (index != null) {
          v = index[value];
          if (v != null) {
            if (v === record) {
              delete index[value];
            } else if (Array.isArray(v) && v.indexOf(record) >= 0) {
              v.splice(v.indexOf(record), 1);
              if (v.length === 1) {
                index[value] = v[0];
              }
            }
          }
          value = data[key];
          i = index[value];
          if (i != null) {
            if (!Array.isArray(i)) {
              i = index[value] = [i];
            }
            i.push(record);
          } else {
            index[value] = record;
          }
        }
      }
    }
  };

  Table.prototype.getIndex = function(field) {
    var i, index, key, record, ref, value;
    index = this.indexes[field];
    if (index == null) {
      this.indexes[field] = index = {};
      ref = this.records;
      for (key in ref) {
        record = ref[key];
        value = record.get()[field];
        if (value != null) {
          i = index[value];
          if (i != null) {
            if (!Array.isArray(i)) {
              i = index[value] = [i];
            }
            i.push(record);
          } else {
            index[value] = record;
          }
        }
      }
    }
    return index;
  };

  Table.prototype.get = function(id, value) {
    var index, list, v;
    if (value != null) {
      index = this.getIndex(id);
      list = index[value];
      if (list != null) {
        if (Array.isArray(list)) {
          return (function() {
            var j, len, results;
            results = [];
            for (j = 0, len = list.length; j < len; j++) {
              v = list[j];
              results.push(v.get());
            }
            return results;
          })();
        } else {
          return list.get();
        }
      } else {
        return null;
      }
    } else {
      return this.records[id];
    }
  };

  Table.prototype.set = function(id, data) {
    var record;
    record = this.records[id];
    if (record != null) {
      return record.set(data);
    }
  };

  Table.prototype.list = function() {
    var key, list, r, ref;
    list = [];
    ref = this.records;
    for (key in ref) {
      r = ref[key];
      list.push(r);
    }
    return list;
  };

  Table.prototype.timer = function() {
    var cluster, key, ref;
    ref = this.clusters;
    for (key in ref) {
      cluster = ref[key];
      cluster.timer();
    }
  };

  return Table;

})();

Cluster = (function() {
  function Cluster(table, id1) {
    this.table = table;
    this.id = id1;
    this.records = [];
    this.save_requested = false;
  }

  Cluster.prototype.addRecord = function(record) {
    this.records.push(record);
    return this.save_requested = true;
  };

  Cluster.prototype.load = function(callback) {
    var file;
    file = this.table.folder + "/" + this.id;
    return fs.readFile(file, (function(_this) {
      return function(err, data) {
        var j, len, r, record;
        try {
          data = JSON.parse(data);
          for (j = 0, len = data.length; j < len; j++) {
            r = data[j];
            record = new Record(_this.table, _this, r.id, r);
            _this.records.push(record);
            _this.table.records[record.id] = record;
            _this.table.current_id = Math.max(_this.table.current_id, record.id + 1);
          }
          console.info("cluster loaded: " + _this.id);
          return callback();
        } catch (error) {
          err = error;
          console.error(err);
          return fs.readFile(file + ".bak", function(err, data) {
            var k, len1;
            try {
              data = JSON.parse(data);
              for (k = 0, len1 = data.length; k < len1; k++) {
                r = data[k];
                record = new Record(_this.table, _this, r.id, r);
                _this.records.push(record);
                _this.table.records[record.id] = record;
                _this.table.current_id = Math.max(_this.table.current_id, record.id + 1);
              }
              console.info("cluster loaded from backup: " + _this.id);
              return callback();
            } catch (error) {
              err = error;
              console.error(err);
              throw "DB loading error with cluster: " + file;
            }
          });
        }
      };
    })(this));
  };

  Cluster.prototype.save = function() {
    var data, file, j, len, r, ref;
    data = [];
    ref = this.records;
    for (j = 0, len = ref.length; j < len; j++) {
      r = ref[j];
      data.push(r.get());
    }
    data = JSON.stringify(data);
    file = this.table.folder + "/" + this.id;
    return fs.writeFile(file, data, (function(_this) {
      return function(err) {
        if (!err) {
          fs.writeFile(file + ".bak", data, function(err) {});
        }
        return console.info("cluster " + _this.table.name + ":" + _this.id + " saved");
      };
    })(this));
  };

  Cluster.prototype.timer = function() {
    var err;
    try {
      if (this.save_requested) {
        this.save_requested = false;
        return this.save();
      }
    } catch (error) {
      err = error;
      return console.error(err);
    }
  };

  return Cluster;

})();

module.exports = this.Table;
