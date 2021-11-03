var fs;

fs = require("fs");

this.Translator = (function() {
  function Translator(content) {
    this.content = content;
    this.languages = {};
    this.list = {};
    this.load();
  }

  Translator.prototype.load = function() {
    var i, languages, len, record, results;
    languages = this.content.db.list("translations");
    results = [];
    for (i = 0, len = languages.length; i < len; i++) {
      record = languages[i];
      results.push(this.loadLanguage(record));
    }
    return results;
  };

  Translator.prototype.loadLanguage = function(record) {
    var language;
    language = new Translator.Language(this, record);
    return this.languages[language.code] = language;
  };

  Translator.prototype.get = function(language, text) {
    var t;
    this.reference(text);
    t = this.languages[language];
    if (t != null) {
      return t.get(text);
    } else {
      return text;
    }
  };

  Translator.prototype.reference = function(text) {
    if (!this.list[text]) {
      return this.list[text] = true;
    }
  };

  Translator.prototype.createLanguage = function(lang) {
    var d, record;
    if (!this.languages[lang]) {
      d = {
        code: lang,
        translations: {}
      };
      record = this.content.db.create("translations", d);
      return this.loadLanguage(record);
    }
  };

  Translator.prototype.getTranslator = function(language) {
    language = language || "en";
    return {
      get: (function(_this) {
        return function(text) {
          return _this.get(language, text);
        };
      })(this)
    };
  };

  return Translator;

})();

this.Translator.Language = (function() {
  function Language(translator, record1) {
    var data;
    this.translator = translator;
    this.record = record1;
    data = this.record.get();
    this.code = data.code;
    this.translations = data.translations;
    this.buffer = null;
    this["default"] = {};
    console.info("reading " + ("../static/lang/" + this.code + ".json"));
    fs.readFile("../static/lang/" + this.code + ".json", (function(_this) {
      return function(err, data) {
        if (!err) {
          try {
            return _this["default"] = JSON.parse(data);
          } catch (error) {
            err = error;
            return console.error(err);
          }
        }
      };
    })(this));
  }

  Language.prototype.get = function(text) {
    var t;
    t = this.translations[text];
    if (t != null) {
      return t.best;
    } else if (this["default"][text]) {
      return this["default"][text];
    } else {
      return text;
    }
  };

  Language.prototype["export"] = function() {
    var key, ref, ref1, value;
    if (this.buffer == null) {
      this.buffer = {};
      ref = this.translations;
      for (key in ref) {
        value = ref[key];
        this.buffer[key] = value.best;
      }
      ref1 = this["default"];
      for (key in ref1) {
        value = ref1[key];
        if (this.buffer[key] == null) {
          this.buffer[key] = value;
        }
      }
      this.buffer = JSON.stringify(this.buffer);
    }
    return this.buffer;
  };

  Language.prototype.updateBest = function(trans) {
    var best, id, ref, ref1, u;
    best = 0;
    ref = trans.list;
    for (id in ref) {
      u = ref[id];
      best = Math.max(best, u.votes);
    }
    ref1 = trans.list;
    for (id in ref1) {
      u = ref1[id];
      if (u.votes === best) {
        trans.best = u.trans;
        return;
      }
    }
  };

  Language.prototype.set = function(userid, source, trans) {
    var t, u;
    this.updated = true;
    t = this.translations[source];
    if (t == null) {
      t = {
        best: trans,
        list: {}
      };
      t.list[userid] = {
        trans: trans,
        votes: 1
      };
      this.translations[source] = t;
      this.record.setField("translations", this.translations);
      this.buffer = null;
    } else {
      if (t.list[userid] != null) {
        u = t.list[userid];
        if (trans !== u.trans) {
          u.trans = trans;
          this.updateBest(t);
          this.buffer = null;
          return this.record.setField("translations", this.translations);
        }
      } else {
        t.list[userid] = {
          trans: trans,
          votes: 1
        };
        this.updateBest(t);
        this.buffer = null;
        return this.record.setField("translations", this.translations);
      }
    }
  };

  return Language;

})();

module.exports = this.Translator;
