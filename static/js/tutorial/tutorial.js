this.Tutorial = (function() {
  function Tutorial(link, back_to_tutorials) {
    this.link = link;
    this.back_to_tutorials = back_to_tutorials != null ? back_to_tutorials : true;
    this.title = "";
  }

  Tutorial.prototype.load = function(callback, error) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (function(_this) {
      return function(event) {
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            return _this.update(req.responseText, callback);
          } else if (req.status >= 400) {
            if (error != null) {
              return error(req.status);
            }
          }
        }
      };
    })(this);
    req.open("GET", this.link);
    return req.send();
  };

  Tutorial.prototype.update = function(doc, callback) {
    var a, alist, button, e, element, i, j, len, len1, line, ref, s, step, text;
    element = document.createElement("div");
    element.innerHTML = DOMPurify.sanitize(marked(doc));
    this.steps = [];
    if (element.hasChildNodes()) {
      alist = element.getElementsByTagName("a");
      if (alist && alist.length > 0) {
        for (i = 0, len = alist.length; i < len; i++) {
          a = alist[i];
          a.target = "_blank";
        }
      }
      ref = element.childNodes;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        e = ref[j];
        switch (e.tagName) {
          case "H1":
            this.title = e.innerText;
            break;
          case "H2":
            step = {
              title: e.innerText,
              content: []
            };
            this.steps.push(step);
            break;
          default:
            if (step != null) {
              if (e.tagName === "P" && e.textContent.startsWith(":")) {
                line = e.textContent;
                line = line.substring(1, line.length);
                s = line.split(" ");
                switch (s[0]) {
                  case "highlight":
                    s.splice(0, 1);
                    step.highlight = s.join(" ").trim();
                    break;
                  case "navigate":
                    s.splice(0, 1);
                    step.navigate = s.join(" ").trim();
                    break;
                  case "position":
                    s.splice(0, 1);
                    step.position = s.join(" ").trim();
                    break;
                  case "overlay":
                    step.overlay = true;
                    break;
                  case "auto":
                    s.splice(0, 1);
                    step.auto = s.join(" ").trim() || true;
                }
              } else {
                if (e.tagName === "PRE") {
                  text = e.firstChild.textContent;
                  button = document.createElement("div");
                  button.classList.add("copy-button");
                  button.innerText = app.translator.get("Copy");
                  e.appendChild(button);
                  (function(_this) {
                    return (function(text, button) {
                      return button.addEventListener("click", function() {
                        console.info(text);
                        navigator.clipboard.writeText(text);
                        button.innerText = app.translator.get("Copied!");
                        return button.classList.add("copied");
                      });
                    });
                  })(this)(text, button);
                }
                step.content.push(e);
              }
            } else if (e.tagName === "P" && e.textContent.startsWith(":")) {
              line = e.textContent;
              line = line.substring(1, line.length);
              s = line.split(" ");
              if (s.splice(0, 1)[0] === "project") {
                this.project_title = s.join(" ");
              }
            }
        }
      }
    }
    console.info(this.steps);
    if (callback != null) {
      return callback();
    }
  };

  return Tutorial;

})();
