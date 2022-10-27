this.Tutorials = class Tutorials {
  constructor(app) {
    this.app = app;
  }

  load() {
    var origin, req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (event) => {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status === 200) {
          return this.update(req.responseText);
        }
      }
    };
    origin = window.ms_tutorials_root_url || location.origin + "/tutorials/";
    switch (this.app.translator.lang) {
      case "fr":
        req.open("GET", origin + "fr/toc.md");
        break;
      case "it":
        req.open("GET", origin + "it/toc.md");
        break;
      case "pt":
        req.open("GET", origin + "pt/toc.md");
        break;
      default:
        req.open("GET", origin + "en/toc.md");
    }
    return req.send();
  }

  update(doc) {
    var e, e2, element, j, k, len, len1, list, ref, ref1;
    element = document.createElement("div");
    element.innerHTML = DOMPurify.sanitize(marked(doc));
    this.tutorials = [];
    if (element.hasChildNodes()) {
      ref = element.childNodes;
      for (j = 0, len = ref.length; j < len; j++) {
        e = ref[j];
        //console.info e
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
              for (k = 0, len1 = ref1.length; k < len1; k++) {
                e2 = ref1[k];
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
    //console.info @tutorials
    this.build();
  }

  checkCompletion() {
    var all, course, hasAchievement, i, id, j, k, len, len1, list, progress, ref, ref1, results, tuto;
    list = ["tour", "programming", "drawing", "game"];
    ref = this.tutorials;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      course = ref[i];
      all = true;
      ref1 = course.list;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        tuto = ref1[k];
        progress = this.app.getTutorialProgress(tuto.link);
        if (progress !== 100) {
          all = false;
        }
      }
      if (all) {
        id = `tutorials/tutorial_${list[i]}`;
        hasAchievement = (id) => {
          var a, l, len2, ref2;
          ref2 = this.app.user.info.achievements;
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            a = ref2[l];
            if (a.id === id) {
              return true;
            }
          }
          return false;
        };
        if (!hasAchievement(id)) {
          console.info("sending tutorial completion " + id);
          results.push(this.app.client.send({
            name: "tutorial_completed",
            id: id
          }));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  }

  build() {
    var div, j, len, ref, t;
    document.getElementById("tutorials-content").innerHTML = "";
    ref = this.tutorials;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      this.buildCourse(t);
    }
    this.checkCompletion();
    div = document.createElement("div");
    div.innerHTML = `<br/>\n<h1 style="margin-top:80px">${this.app.translator.get("More Tutorials")}</h1>\n<h3 style="margin-bottom: 0px;">${this.app.translator.get("Check this great series of microStudio tutorials by mrLman:")}</h3>\n<br/><a target="_blank" href="https://sites.google.com/ed.act.edu.au/games-programming/game-elements/"><img src="/img/mrlman_tutorials.png" /></a>`;
    document.getElementById("tutorials-content").appendChild(div);
  }

  buildCourse(course) {
    var div, h2, j, len, p, ref, t, ul;
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
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      div.appendChild(this.buildTutorial(t));
    }
    return document.getElementById("tutorials-content").appendChild(div);
  }

  buildTutorial(t) {
    var a, code, li, progress;
    li = document.createElement("li");
    li.innerHTML = `<i class='fa fa-play'></i> ${t.title}`;
    li.addEventListener("click", () => {
      return this.startTutorial(t);
    });
    progress = this.app.getTutorialProgress(t.link);
    if (progress > 0) {
      li.style.background = `linear-gradient(90deg,hsl(160,50%,70%) 0%,hsl(160,50%,70%) ${progress}%,rgba(0,0,0,.1) ${progress}%)`;
      li.addEventListener("mouseover", function() {
        return li.style.background = "hsl(200,50%,70%)";
      });
      li.addEventListener("mouseout", function() {
        return li.style.background = `linear-gradient(90deg,hsl(160,50%,70%) 0%,hsl(160,50%,70%) ${progress}%,rgba(0,0,0,.1) ${progress}%)`;
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
    a.addEventListener("click", (event) => {
      return event.stopPropagation();
    });
    return li;
  }

  startTutorial(t) {
    var tuto;
    tuto = new Tutorial(t.link.replace("https://microstudio.dev", location.origin));
    return tuto.load(() => {
      return this.app.tutorial.start(tuto);
    });
  }

};
