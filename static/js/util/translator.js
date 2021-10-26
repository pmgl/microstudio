this.Translator = (function() {
  function Translator(app) {
    var index;
    this.app = app;
    this.lang = document.children[0].lang;
    this.language = window.translation;
    this.incomplete = {};
    if ((document.cookie != null) && document.cookie.indexOf("language=") >= 0) {
      index = document.cookie.indexOf("language=") + "language=".length;
      this.lang = document.cookie.substring(index, index + 2);
    }
    setInterval(((function(_this) {
      return function() {
        return _this.check();
      };
    })(this)), 5000);
  }

  Translator.prototype.load = function(callback) {
    if (this.language != null) {
      return;
    }
    return this.app.client.sendRequest({
      name: "get_language",
      language: this.lang
    }, (function(_this) {
      return function(msg) {
        var err;
        try {
          _this.language = JSON.parse(msg.language);
        } catch (error) {
          err = error;
        }
        if (callback != null) {
          return callback();
        }
      };
    })(this));
  };

  Translator.prototype.get = function(text) {
    var value;
    if (this.language != null) {
      value = this.language[text];
      if (value == null) {
        this.incomplete[text] = true;
        return text;
      } else {
        return value;
      }
    } else {
      return text;
    }
  };

  Translator.prototype.check = function() {
    var text;
    if ((this.app.user != null) && (this.app.user.flags != null) && this.app.user.flags.admin) {
      if (!this.list_fetched) {
        this.list_fetched = true;
        this.app.client.sendRequest({
          name: "get_translation_list"
        }, (function(_this) {
          return function(msg) {
            return _this.list = msg.list;
          };
        })(this));
      }
      if (this.list != null) {
        for (text in this.incomplete) {
          if (this.list[text] == null) {
            this.app.client.sendRequest({
              name: "add_translation",
              source: text
            });
            this.list[text] = true;
          }
        }
      }
    }
  };

  Translator.prototype.translatorLanguage = function() {
    var key, ref, translator, value;
    translator = false;
    ref = this.app.user.flags;
    for (key in ref) {
      value = ref[key];
      if (key.startsWith("translator_") && value) {
        return key.split("-")[1];
      }
    }
    return null;
  };

  return Translator;

})();
