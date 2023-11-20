this.About = class About {
  constructor(app) {
    this.app = app;
    this.current = "about";
    this.loaded = {};
    this.sections = ["about", "changelog", "terms", "privacy"];
    this.init();
  }

  init() {
    var i, len, ref, results, s;
    ref = this.sections;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      results.push(((s) => {
        return document.getElementById(`about-menu-${s}`).addEventListener("click", () => {
          return this.setSection(s);
        });
      })(s));
    }
    return results;
  }

  setSection(section) {
    var i, len, ref, s;
    this.current = section;
    ref = this.sections;
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      if (s === section) {
        document.getElementById(`about-menu-${s}`).classList.add("selected");
      } else {
        document.getElementById(`about-menu-${s}`).classList.remove("selected");
      }
    }
    return this.load(section, (text) => {
      return this.update(text);
    });
  }

  load(section, callback) {
    var ref, req;
    if (this.loaded[section] != null) {
      if (callback != null) {
        callback(this.loaded[section]);
      }
      return;
    }
    req = new XMLHttpRequest();
    req.onreadystatechange = (event) => {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status === 200) {
          this.loaded[section] = req.responseText;
          if (callback != null) {
            return callback(this.loaded[section]);
          }
        }
      }
    };
    if (((ref = this.app.translator.lang) === "fr" || ref === "it" || ref === "pt") && section !== "changelog") {
      req.open("GET", location.origin + `/doc/${this.app.translator.lang}/${section}.md`);
    } else {
      req.open("GET", location.origin + `/doc/en/${section}.md`);
    }
    return req.send();
  }

  update(doc) {
    var e, element, i, len, list;
    element = document.getElementById("about-content");
    element.innerHTML = DOMPurify.sanitize(marked(doc));
    list = element.getElementsByTagName("a");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      e.target = "_blank";
    }
  }

};
