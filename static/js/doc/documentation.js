this.Documentation = class Documentation {
  constructor(app) {
    var e, j, k, len1, len2, list;
    this.app = app;
    this.doc = "";
    this.help = {};
    this.suggest = {};
    this.title_elements = [];
    this.sections = {};
    list = document.getElementsByClassName("help-section-category");
    for (j = 0, len1 = list.length; j < len1; j++) {
      e = list[j];
      ((e) => {
        var title;
        title = e.getElementsByClassName("help-section-title")[0];
        return title.addEventListener("click", () => {
          if (e.classList.contains("collapsed")) {
            e.classList.remove("collapsed");
          } else {
            e.classList.add("collapsed");
          }
          return this.updateViewPos();
        });
      })(e);
    }
    list = document.getElementsByClassName("help-section-button");
    for (k = 0, len2 = list.length; k < len2; k++) {
      e = list[k];
      ((e) => {
        return e.addEventListener("click", () => {
          var id, split;
          split = e.id.split("-");
          split.splice(0, 1);
          id = split.join("-");
          return this.setSection(id);
        });
      })(e);
    }
    window.addEventListener("resize", () => {
      return this.updateViewPos();
    });
  }

  stateInitialized() {
    return this.load("API", (src) => {
      this.buildLiveHelp(src, "API");
      if (!this.current_section) {
        return setTimeout((() => {
          return this.setSection("Quickstart", (() => {
            return this.buildLiveHelp(this.doc, "Quickstart");
          }), null, false);
        }), 100);
      } else {
        return this.load("Quickstart", (src) => {
          return this.buildLiveHelp(src, "Quickstart");
        });
      }
    });
  }

  pushState() {
    if (this.current_section) {
      return this.app.app_state.pushState(`documentation.${this.current_section}`, `/documentation/${this.current_section}/`);
    } else {
      return this.app.app_state.pushState("documentation", "/documentation/");
    }
  }

  setSection(id, callback, url, push_state = true) {
    var e, j, len1, list;
    this.current_section = id;
    if (push_state) {
      this.pushState();
    }
    this.load((url != null ? url : id), (doc1) => {
      this.doc = doc1;
      this.update();
      if (callback != null) {
        return callback();
      }
    });
    list = document.getElementsByClassName("help-section-button");
    for (j = 0, len1 = list.length; j < len1; j++) {
      e = list[j];
      ((e) => {
        if (e.id === `documentation-${id}`) {
          e.classList.add("selected");
          return e.parentNode.parentNode.classList.remove("collapsed");
        } else {
          return e.classList.remove("selected");
        }
      })(e);
    }
  }

  load(id = "Quickstart", callback = (function() {}), lang = this.app.translator.lang) {
    var ref1, req, url;
    if (this.sections[id] != null) {
      return callback(this.sections[id]);
    }
    if ((ref1 = !lang) === "fr" || ref1 === "de" || ref1 === "pl" || ref1 === "it" || ref1 === "pt" || ref1 === "ru") {
      lang = "en";
    }
    req = new XMLHttpRequest();
    req.onreadystatechange = (event) => {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status === 200) {
          this.sections[id] = req.responseText;
          return callback(this.sections[id]);
        } else if (lang !== "en") {
          return this.load(id, callback, "en");
        }
      }
    };
    if (id.startsWith("http")) {
      url = id;
    } else {
      url = `/microstudio.wiki/${lang}/${lang}-${id}.md`;
    }
    req.open("GET", url);
    return req.send();
  }

  updateViewPos() {
    var doc, sections;
    sections = document.getElementById("help-sections");
    doc = document.getElementById("help-document");
    return doc.style.top = `${sections.offsetHeight}px`;
  }

  update() {
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
    //lexer = new marked.Lexer({})
    //console.info lexer.lex @doc
    this.buildToc();
    return this.updateViewPos();
  }

  buildToc() {
    var e, element, j, len1, ref1, toc;
    element = document.getElementById("documentation");
    toc = document.getElementById("help-list");
    toc.innerHTML = "";
    ref1 = element.childNodes;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      e = ref1[j];
      ((e) => {
        var h;
        switch (e.tagName) {
          case "H1":
            h = document.createElement("h1");
            h.innerText = e.innerText;
            h.addEventListener("click", () => {
              return e.scrollIntoView(true, {
                behavior: "smooth"
              });
            });
            return toc.appendChild(h);
          case "H2":
            h = document.createElement("h2");
            h.innerText = e.innerText;
            h.addEventListener("click", () => {
              return e.scrollIntoView(true, {
                behavior: "smooth"
              });
            });
            return toc.appendChild(h);
          case "H3":
            h = document.createElement("h3");
            h.innerText = e.innerText;
            h.addEventListener("click", () => {
              return e.scrollIntoView(true, {
                behavior: "smooth"
              });
            });
            return toc.appendChild(h);
        }
      })(e);
    }
  }

  buildLiveHelp(src, section) {
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
  }

  findSuggestMatch(line, position = 0) {
    var best, err, i, index, j, k, key, known_prefixes, l, len, len1, len2, len3, len4, m, n, o, p, prefixes, q, r, ref1, ref2, ref3, ref4, ref5, res, s, split, table, v, value, within;
    res = [];
    best = 0;
    ref1 = this.suggest;
    for (key in ref1) {
      value = ref1[key];
      for (len = j = ref2 = key.length; j >= 3; len = j += -1) {
        index = line.indexOf(key.substring(0, len));
        if (index >= 0) {
          if (index > 0 && line.charAt(index - 1) !== " ") {
            continue;
          }
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
    if (res.length > 20) {
      try {
        known_prefixes = ["set", "get", "draw", "fill"];
        prefixes = {};
        for (o = 0, len3 = res.length; o < len3; o++) {
          v = res[o];
          split = v.ref.split(".");
          for (q = 0, len4 = known_prefixes.length; q < len4; q++) {
            p = known_prefixes[q];
            if ((split[1] != null) && split[1].startsWith(p)) {
              v.ref = `${split[0]}.${p}...`;
            }
          }
        }
        table = {};
        for (i = s = ref5 = res.length - 1; s >= 0; i = s += -1) {
          v = res[i];
          if (table[v.ref] != null) {
            res.splice(i, 1);
          } else {
            table[v.ref] = v;
          }
        }
      } catch (error) {
        err = error;
        console.error(err);
      }
    }
    return res;
  }

  findHelpMatch(line) {
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
  }

  getPluginsSection() {
    var help_sections, plugins_section;
    help_sections = document.getElementById("help-sections");
    plugins_section = document.getElementById("help-plugins");
    if (plugins_section == null) {
      plugins_section = document.createElement("div");
      plugins_section.classList.add("help-section-category");
      //plugins_section.classList.add "collapsed"
      plugins_section.classList.add("bg-green");
      plugins_section.id = "help-plugins";
      help_sections.appendChild(plugins_section);
      plugins_section.innerHTML = `<div class="help-section-title">\n  <i class="fa"></i><span>${this.app.translator.get("Plug-ins")}</span>\n</div>\n<div class="help-section-content"></div>`;
      plugins_section.querySelector(".help-section-title").addEventListener("click", () => {
        if (plugins_section.classList.contains("collapsed")) {
          plugins_section.classList.remove("collapsed");
        } else {
          plugins_section.classList.add("collapsed");
        }
        return this.updateViewPos();
      });
    }
    return plugins_section;
  }

  addPlugin(id, title, link) {
    var doc, plugins_section;
    id = `documentation-${id}`;
    if (!document.getElementById(id)) {
      plugins_section = this.getPluginsSection();
      doc = document.createElement("div");
      doc.id = id;
      doc.classList.add("help-section-button");
      doc.innerText = title;
      plugins_section.querySelector(".help-section-content").appendChild(doc);
      doc.addEventListener("click", () => {
        return this.setSection(link);
      });
      return this.updateViewPos();
    }
  }

  removePlugin(id) {
    var element, parent;
    id = `documentation-${id}`;
    element = document.getElementById(id);
    if (element != null) {
      parent = element.parentNode;
      parent.removeChild(element);
      if (parent.childNodes.length === 0) {
        this.removeAllPlugins();
      }
      return this.updateViewPos();
    }
  }

  removeAllPlugins() {
    var plugins_section;
    plugins_section = document.getElementById("help-plugins");
    if (plugins_section != null) {
      plugins_section.parentNode.removeChild(plugins_section);
      return this.updateViewPos();
    }
  }

  getLibsSection() {
    var help_sections, libs_section;
    help_sections = document.getElementById("help-sections");
    libs_section = document.getElementById("help-libraries");
    if (libs_section == null) {
      libs_section = document.createElement("div");
      libs_section.classList.add("help-section-category");
      //libs_section.classList.add "collapsed"
      libs_section.classList.add("bg-purple");
      libs_section.id = "help-libraries";
      help_sections.appendChild(libs_section);
      libs_section.innerHTML = `<div class="help-section-title">\n  <i class="fa"></i><span>${this.app.translator.get("Libraries in use")}</span>\n</div>\n<div class="help-section-content"></div>`;
      libs_section.querySelector(".help-section-title").addEventListener("click", () => {
        if (libs_section.classList.contains("collapsed")) {
          libs_section.classList.remove("collapsed");
        } else {
          libs_section.classList.add("collapsed");
        }
        return this.updateViewPos();
      });
    }
    return libs_section;
  }

  addLib(id, title, link) {
    var doc, libs_section;
    id = `documentation-${id}`;
    if (!document.getElementById(id)) {
      libs_section = this.getLibsSection();
      doc = document.createElement("div");
      doc.id = id;
      doc.classList.add("help-section-button");
      doc.innerText = title;
      libs_section.querySelector(".help-section-content").appendChild(doc);
      doc.addEventListener("click", () => {
        return this.setSection(link);
      });
      return this.updateViewPos();
    }
  }

  removeLib(id) {
    var element, parent;
    id = `documentation-${id}`;
    element = document.getElementById(id);
    if (element != null) {
      parent = element.parentNode;
      parent.removeChild(element);
      if (parent.childNodes.length === 0) {
        this.removeAllLibs();
      }
      return this.updateViewPos();
    }
  }

  removeAllLibs() {
    var libs_section;
    libs_section = document.getElementById("help-libraries");
    if (libs_section != null) {
      libs_section.parentNode.removeChild(libs_section);
      return this.updateViewPos();
    }
  }

};
