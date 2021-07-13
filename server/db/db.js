var Table, fs;

fs = require("fs");

Table = require(__dirname + "/table.js");

this.DB = (function() {
  function DB(folder, callback) {
    this.folder = folder != null ? folder : "../data";
    this.callback = callback;
    this.tables = {};
    this.save_list = [];
    if (!fs.existsSync(this.folder)) {
      fs.mkdir(this.folder, (function(_this) {
        return function() {};
      })(this));
    } else {
      this.load();
    }
  }

  DB.prototype.close = function() {
    var key, results;
    results = [];
    for (key in this.tables) {
      results.push(this.tables[key].close());
    }
    return results;
  };

  DB.prototype.load = function() {
    var f, files, i, len, table;
    console.info("loading DB...");
    this.load_time = Date.now();
    files = fs.readdirSync(this.folder);
    for (i = 0, len = files.length; i < len; i++) {
      f = files[i];
      if (fs.lstatSync(this.folder + "/" + f).isDirectory()) {
        table = new Table(this, f);
        this.tables[f] = table;
      }
    }
    this.tableLoaded();
  };

  DB.prototype.tableLoaded = function() {
    var key, ref, table;
    ref = this.tables;
    for (key in ref) {
      table = ref[key];
      if (!table.loaded) {
        return;
      }
    }
    if (this.callback != null) {
      this.load_time = Date.now() - this.load_time;
      console.info("DB load time: " + this.load_time + " ms");
      this.callback(this);
      return delete this.callback;
    }
  };

  DB.prototype.create = function(table, data) {
    var t;
    t = this.tables[table];
    if (t == null) {
      t = new Table(this, table);
      this.tables[table] = t;
    }
    return t.create(data);
  };

  DB.prototype.get = function(table, id, value) {
    var t;
    t = this.tables[table];
    if (t != null) {
      return t.get(id, value);
    } else {
      return null;
    }
  };

  DB.prototype.set = function(table, id, data) {
    var t;
    t = this.tables[table];
    if (t != null) {
      return t.set(id, data);
    }
  };

  DB.prototype.list = function(table) {
    var t;
    t = this.tables[table];
    if (t == null) {
      return [];
    } else {
      return t.list();
    }
  };

  return DB;

})();

module.exports = this.DB;
