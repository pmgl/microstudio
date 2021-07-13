this.SpriteList = (function() {
  function SpriteList(app1) {
    this.app = app1;
    this.list = [];
    this.table = {};
    this.listeners = [];
  }

  SpriteList.prototype.add = function(sprite) {
    var j, len, lis, ref;
    if (this.list.indexOf(sprite) < 0) {
      this.list.push(sprite);
    }
    this.table[sprite.name] = sprite;
    ref = this.listeners;
    for (j = 0, len = ref.length; j < len; j++) {
      lis = ref[j];
      lis.spriteListChanged();
    }
  };

  SpriteList.prototype.rename = function(old_name, new_name) {
    var j, len, lis, ref;
    if (this.table[old_name] != null) {
      this.table[new_name] = this.table[old_name];
      delete this.table[old_name];
    }
    ref = this.listeners;
    for (j = 0, len = ref.length; j < len; j++) {
      lis = ref[j];
      lis.spriteListChanged();
    }
  };

  SpriteList.prototype.get = function(name) {
    return this.table[name];
  };

  SpriteList.prototype["delete"] = function(sprite) {
    var index, j, len, lis, ref;
    index = this.list.indexOf(sprite);
    if (index >= 0) {
      this.list.splice(index, 1);
    }
    delete this.table[sprite.name];
    ref = this.listeners;
    for (j = 0, len = ref.length; j < len; j++) {
      lis = ref[j];
      lis.spriteListChanged();
    }
  };

  SpriteList.prototype.addListener = function(listener) {
    return this.listeners.push(listener);
  };

  SpriteList.prototype.clear = function() {
    var j, key, len, lis, ref;
    this.list.length = 0;
    for (key in this.table) {
      delete this.table[key];
    }
    ref = this.listeners;
    for (j = 0, len = ref.length; j < len; j++) {
      lis = ref[j];
      lis.spriteListChanged();
    }
  };

  SpriteList.prototype.listFiles = function() {
    var i, j, ref, results;
    results = [];
    for (i = j = 0, ref = this.list.length - 1; j <= ref; i = j += 1) {
      results.push(this.list[i].name + ".png");
    }
    return results;
  };

  SpriteList.prototype.update = function(list) {
    var i, j, k, l, len, len1, lis, name, ref, ref1, s, u, url;
    for (i = j = ref = this.list.length - 1; j >= 0; i = j += -1) {
      s = this.list[i];
      if (list.indexOf(s.name + ".png") < 0) {
        this.list.splice(i, 1);
      }
    }
    url = location.origin + ("/" + this.app.nick + "/" + app.project.slug + "/");
    for (k = 0, len = list.length; k < len; k++) {
      s = list[k];
      u = url + s;
      name = s.substring(0, s.length - 4);
      s = new Sprite(u);
      s.name = name;
      this.add(s);
    }
    ref1 = this.listeners;
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      lis = ref1[l];
      lis.spriteListChanged();
    }
  };

  return SpriteList;

})();
