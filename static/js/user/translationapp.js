this.TranslationApp = (function() {
  function TranslationApp(app) {
    this.app = app;
    this.update();
    this.edits = {};
    this.last_edit = 0;
    setInterval(((function(_this) {
      return function() {
        return _this.check();
      };
    })(this)), 100);
  }

  TranslationApp.prototype.update = function() {
    var key, ref, value;
    ref = this.app.user.flags;
    for (key in ref) {
      value = ref[key];
      if (key.startsWith("translator_") && value) {
        this.lang = key.split("_")[1];
      }
    }
    this.app.client.sendRequest({
      name: "get_translation_list"
    }, (function(_this) {
      return function(msg) {
        _this.list = msg.list;
        return _this.refresh();
      };
    })(this));
    return this.app.client.sendRequest({
      name: "get_language",
      language: this.lang
    }, (function(_this) {
      return function(msg) {
        _this.language = JSON.parse(msg.language);
        return _this.refresh();
      };
    })(this));
  };

  TranslationApp.prototype.refresh = function() {
    var text;
    if ((this.list != null) && (this.language != null)) {
      document.getElementById("translation-app-contents").innerHTML = "";
      for (text in this.list) {
        this.add(text, this.language[text]);
      }
    }
  };

  TranslationApp.prototype.add = function(text, translation) {
    var div, i1, i2;
    div = document.createElement("div");
    i1 = document.createElement("input");
    i1.value = text;
    i1.readOnly = true;
    div.appendChild(i1);
    i2 = document.createElement("input");
    i2.value = translation || "";
    div.appendChild(i2);
    i2.addEventListener("input", (function(_this) {
      return function() {
        var trans;
        trans = i2.value;
        _this.edits[text] = trans;
        return _this.last_edit = Date.now();
      };
    })(this));
    return document.getElementById("translation-app-contents").appendChild(div);
  };

  TranslationApp.prototype.check = function() {
    var key, ref, value;
    if (this.last_edit > 0 && Date.now() > this.last_edit + 2000) {
      this.last_edit = 0;
      ref = this.edits;
      for (key in ref) {
        value = ref[key];
        delete this.edits[key];
        this.app.client.sendRequest({
          name: "set_translation",
          language: this.lang,
          source: key,
          translation: value
        });
      }
    }
  };

  return TranslationApp;

})();
