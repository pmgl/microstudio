this.Tutorials = (function() {
  function Tutorials(app) {
    this.app = app;
  }

  Tutorials.prototype.load = function() {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (function(_this) {
      return function(event) {
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            return _this.update(req.responseText);
          }
        }
      };
    })(this);
    switch (this.app.translator.lang) {
      case "fr":
        req.open("GET", location.origin + "/tutorials/fr/toc.md");
        break;
      default:
        req.open("GET", location.origin + "/tutorials/en/toc.md");
    }
    return req.send();
  };

  Tutorials.prototype.update = function(doc) {
    var e, e2, element, i, j, len, len1, list, ref, ref1;
    element = document.createElement("div");
    element.innerHTML = DOMPurify.sanitize(marked(doc));
    this.tutorials = [];
    if (element.hasChildNodes()) {
      ref = element.childNodes;
      for (i = 0, len = ref.length; i < len; i++) {
        e = ref[i];
        switch (e.tagName) {
          case "H2":
            list = {
              title: e.innerText,
              description: "",
              list: []
            };
            this.tutorials.push(list);
            break;
          case "P":
            if (e.hasChildNodes()) {
              ref1 = e.childNodes;
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                e2 = ref1[j];
                switch (e2.tagName) {
                  case "A":
                    if (list != null) {
                      list.list.push({
                        title: e2.textContent,
                        link: e2.href
                      });
                    }
                    break;
                  case void 0:
                    list.description = e2.textContent;
                }
              }
            }
        }
      }
    }
    this.build();
  };

  Tutorials.prototype.build = function() {
    var i, len, ref, t;
    document.getElementById("tutorials-content").innerHTML = "";
    ref = this.tutorials;
    for (i = 0, len = ref.length; i < len; i++) {
      t = ref[i];
      this.buildCourse(t);
    }
  };

  Tutorials.prototype.buildCourse = function(course) {
    var div, h2, i, len, p, ref, t, ul;
    div = document.createElement("div");
    div.classList.add("course");
    h2 = document.createElement("h2");
    h2.innerText = course.title;
    div.appendChild(h2);
    p = document.createElement("p");
    div.appendChild(p);
    p.innerText = course.description;
    ul = document.createElement("ul");
    div.appendChild(ul);
    ref = course.list;
    for (i = 0, len = ref.length; i < len; i++) {
      t = ref[i];
      div.appendChild(this.buildTutorial(t));
    }
    return document.getElementById("tutorials-content").appendChild(div);
  };

  Tutorials.prototype.buildTutorial = function(t) {
    var a, code, li, progress;
    li = document.createElement("li");
    li.innerHTML = "<i class='fa fa-play'></i> " + t.title;
    li.addEventListener("click", (function(_this) {
      return function() {
        return _this.startTutorial(t);
      };
    })(this));
    progress = this.app.getTutorialProgress(t.link);
    if (progress > 0) {
      li.style.background = "linear-gradient(90deg,hsl(160,50%,70%) 0%,hsl(160,50%,70%) " + progress + "%,rgba(0,0,0,.1) " + progress + "%)";
      li.addEventListener("mouseover", function() {
        return li.style.background = "hsl(200,50%,70%)";
      });
      li.addEventListener("mouseout", function() {
        return li.style.background = "linear-gradient(90deg,hsl(160,50%,70%) 0%,hsl(160,50%,70%) " + progress + "%,rgba(0,0,0,.1) " + progress + "%)";
      });
    }
    if (progress === 100) {
      li.firstChild.classList.remove("fa-play");
      li.firstChild.classList.add("fa-check");
    }
    a = document.createElement("a");
    a.href = t.link;
    a.target = "_blank";
    a.title = this.app.translator.get("View tutorial source code");
    code = document.createElement("i");
    code.classList.add("fas");
    code.classList.add("fa-file-code");
    a.appendChild(code);
    li.appendChild(a);
    a.addEventListener("click", (function(_this) {
      return function(event) {
        return event.stopPropagation();
      };
    })(this));
    return li;
  };

  Tutorials.prototype.startTutorial = function(t) {
    var tuto;
    tuto = new Tutorial(t.link.replace("https://microstudio.dev", location.origin));
    return tuto.load((function(_this) {
      return function() {
        return _this.app.tutorial.start(tuto);
      };
    })(this));
  };

  return Tutorials;

})();
