this.Documentation = (function() {
  function Documentation(app) {
    var e, fn, fn1, j, k, len1, len2, list;
    this.app = app;
    this.doc = "";
    this.help = {};
    this.suggest = {};
    this.title_elements = [];
    setTimeout(((function(_this) {
      return function() {
        return _this.load("API", function(src) {
          _this.buildLiveHelp(src, "API");
          return setTimeout((function() {
            return _this.setSection("Quickstart", function() {
              return _this.buildLiveHelp(_this.doc, "Quickstart");
            });
          }), 1000);
        });
      };
    })(this)), 1000);
    this.sections = {};
    list = document.getElementsByClassName("help-section-category");
    fn = (function(_this) {
      return function(e) {
        var title;
        title = e.getElementsByClassName("help-section-title")[0];
        return title.addEventListener("click", function() {
          if (e.classList.contains("collapsed")) {
            e.classList.remove("collapsed");
          } else {
            e.classList.add("collapsed");
          }
          return _this.updateViewPos();
        });
      };
    })(this);
    for (j = 0, len1 = list.length; j < len1; j++) {
      e = list[j];
      fn(e);
    }
    list = document.getElementsByClassName("help-section-button");
    fn1 = (function(_this) {
      return function(e) {
        return e.addEventListener("click", function() {
          var id;
          id = e.id.split("-")[1];
          return _this.setSection(id);
        });
      };
    })(this);
    for (k = 0, len2 = list.length; k < len2; k++) {
      e = list[k];
      fn1(e);
    }
    window.addEventListener("resize", (function(_this) {
      return function() {
        return _this.updateViewPos();
      };
    })(this));
  }

  Documentation.prototype.setSection = function(id, callback) {
    var e, fn, j, len1, list;
    this.load(id, (function(_this) {
      return function(doc1) {
        _this.doc = doc1;
        _this.update();
        if (callback != null) {
          return callback();
        }
      };
    })(this));
    list = document.getElementsByClassName("help-section-button");
    fn = (function(_this) {
      return function(e) {
        if (e.id === ("documentation-" + id)) {
          e.classList.add("selected");
          return e.parentNode.parentNode.classList.remove("collapsed");
        } else {
          return e.classList.remove("selected");
        }
      };
    })(this);
    for (j = 0, len1 = list.length; j < len1; j++) {
      e = list[j];
      fn(e);
    }
  };

  Documentation.prototype.load = function(id, callback, lang) {
    var ref1, req;
    if (id == null) {
      id = "Quickstart";
    }
    if (callback == null) {
      callback = (function() {});
    }
    if (lang == null) {
      lang = this.app.translator.lang;
    }
    if (this.sections[id] != null) {
      return callback(this.sections[id]);
    }
    if ((ref1 = !lang) === "fr" || ref1 === "de" || ref1 === "pl" || ref1 === "it" || ref1 === "pt" || ref1 === "ru") {
      lang = "en";
    }
    req = new XMLHttpRequest();
    req.onreadystatechange = (function(_this) {
      return function(event) {
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            _this.sections[id] = req.responseText;
            return callback(_this.sections[id]);
          } else if (lang !== "en") {
            return _this.load(id, callback, "en");
          }
        }
      };
    })(this);
    req.open("GET", "/microstudio.wiki/" + lang + "/" + lang + "-" + id + ".md");
    return req.send();
  };

  Documentation.prototype.updateViewPos = function() {
    var doc, sections;
    sections = document.getElementById("help-sections");
    doc = document.getElementById("help-document");
    return doc.style.top = sections.offsetHeight + "px";
  };

  Documentation.prototype.update = function() {
    var e, element, j, len1, list;
    if (this.doc == null) {
      return;
    }
    element = document.getElementById("documentation");
    marked.setOptions({
      baseUrl: "/microstudio.wiki/",
      headerPrefix: "documentation_"
    });
    element.innerHTML = DOMPurify.sanitize(marked(this.doc));
    list = element.getElementsByTagName("a");
    for (j = 0, len1 = list.length; j < len1; j++) {
      e = list[j];
      e.target = "_blank";
    }
    this.buildToc();
    return this.updateViewPos();
  };

  Documentation.prototype.buildToc = function() {
    var e, element, fn, j, len1, ref1, toc;
    element = document.getElementById("documentation");
    toc = document.getElementById("help-list");
    toc.innerHTML = "";
    ref1 = element.childNodes;
    fn = (function(_this) {
      return function(e) {
        var h;
        switch (e.tagName) {
          case "H1":
            h = document.createElement("h1");
            h.innerText = e.innerText;
            h.addEventListener("click", function() {
              return e.scrollIntoView(true, {
                behavior: "smooth"
              });
            });
            return toc.appendChild(h);
          case "H2":
            h = document.createElement("h2");
            h.innerText = e.innerText;
            h.addEventListener("click", function() {
              return e.scrollIntoView(true, {
                behavior: "smooth"
              });
            });
            return toc.appendChild(h);
          case "H3":
            h = document.createElement("h3");
            h.innerText = e.innerText;
            h.addEventListener("click", function() {
              return e.scrollIntoView(true, {
                behavior: "smooth"
              });
            });
            return toc.appendChild(h);
        }
      };
    })(this);
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      e = ref1[j];
      fn(e);
    }
  };

  Documentation.prototype.buildLiveHelp = function(src, section) {
    var content, current_section, index, line, lines, ref, slugger, tline;
    lines = src.split("\n");
    index = 0;
    current_section = "";
    slugger = new marked.Slugger;
    while (index < lines.length) {
      line = lines[index];
      tline = lines[Math.min(lines.length - 1, index + 1)];
      if (tline.startsWith("# ")) {
        current_section = "documentation_" + slugger.slug(tline.substring(2, tline.length).replace(/\&lt;|\&gt;/g, ""));
      } else if (tline.startsWith("## ")) {
        current_section = "documentation_" + slugger.slug(tline.substring(3, tline.length).replace(/\&lt;|\&gt;/g, ""));
      } else if (tline.startsWith("### ")) {
        current_section = "documentation_" + slugger.slug(tline.substring(4, tline.length).replace(/\&lt;|\&gt;/g, ""));
      } else if (tline.startsWith("#### ")) {
        current_section = "documentation_" + slugger.slug(tline.substring(5, tline.length).replace(/\&lt;|\&gt;/g, ""));
      } else if (tline.startsWith("##### ")) {
        current_section = "documentation_" + slugger.slug(tline.substring(6, tline.length).replace(/\&lt;|\&gt;/g, ""));
      }
      if (line.indexOf("help_start") > 0) {
        ref = line.substring(line.indexOf("help_start") + 11, line.indexOf("--->"));
        ref = ref.trim();
        index += 1;
        content = "";
        while (index < lines.length) {
          line = lines[index];
          if (line.indexOf("help_end") > 0) {
            this.help[ref] = {
              pointer: current_section,
              value: content,
              section: section
            };
            break;
          } else {
            content += line + "\n";
          }
          index += 1;
        }
      }
      if (line.indexOf("suggest_start") > 0) {
        ref = line.substring(line.indexOf("suggest_start") + "suggest_start".length + 1, line.indexOf("--->"));
        ref = ref.trim();
        index += 1;
        content = "";
        while (index < lines.length) {
          line = lines[index];
          if (line.indexOf("suggest_end") > 0) {
            this.suggest[ref] = {
              pointer: current_section,
              value: content,
              section: section
            };
            break;
          } else {
            content += line + "\n";
          }
          index += 1;
        }
      }
      index++;
    }
  };

  Documentation.prototype.findSuggestMatch = function(line, position) {
    var best, i, index, j, k, key, l, len, len1, len2, m, n, r, ref1, ref2, ref3, ref4, res, value, within;
    if (position == null) {
      position = 0;
    }
    res = [];
    best = 0;
    ref1 = this.suggest;
    for (key in ref1) {
      value = ref1[key];
      for (len = j = ref2 = key.length; j >= 3; len = j += -1) {
        index = line.indexOf(key.substring(0, len));
        if (index >= 0) {
          best = Math.max(best, len);
          res.push({
            ref: key,
            radix: key.substring(0, len),
            value: value.value,
            pointer: value.pointer,
            index: index,
            within: index <= position && position <= index + len
          });
          break;
        }
      }
    }
    within = false;
    for (k = 0, len1 = res.length; k < len1; k++) {
      r = res[k];
      if (r.ref === r.radix && r.radix.length === best && r.index + r.radix.length < line.length) {
        return [r];
      }
      within = within || r.within;
    }
    if (within) {
      for (i = l = ref3 = res.length - 1; l >= 0; i = l += -1) {
        r = res[i];
        if (!r.within) {
          res.splice(i, 1);
        }
      }
    }
    best = 0;
    for (m = 0, len2 = res.length; m < len2; m++) {
      r = res[m];
      best = Math.max(best, r.radix.length);
    }
    for (i = n = ref4 = res.length - 1; n >= 0; i = n += -1) {
      r = res[i];
      if (r.radix.length < best) {
        res.splice(i, 1);
      }
    }
    return res;
  };

  Documentation.prototype.findHelpMatch = function(line) {
    var key, ref1, res, value;
    res = [];
    ref1 = this.help;
    for (key in ref1) {
      value = ref1[key];
      if (line.indexOf(key) >= 0) {
        res.push(value);
      }
    }
    return res;
  };

  return Documentation;

})();
