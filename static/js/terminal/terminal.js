this.Terminal = class Terminal {
  constructor(runwindow, tid = "terminal") {
    this.runwindow = runwindow;
    this.tid = tid;
    this.localStorage = localStorage;
    this.commands = {
      clear: () => {
        return this.clear();
      }
    };
    this.loadHistory();
    this.buffer = [];
    this.length = 0;
    this.error_lines = 0;
  }

  loadHistory() {
    var err;
    this.history = [];
    try {
      if (this.localStorage.getItem("console_history") != null) {
        return this.history = JSON.parse(this.localStorage.getItem("console_history"));
      }
    } catch (error) {
      err = error;
    }
  }

  saveHistory() {
    return this.localStorage.setItem("console_history", JSON.stringify(this.history));
  }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;
    document.getElementById(`${this.tid}`).addEventListener("mousedown", (event) => {
      this.pressed = true;
      this.moved = false;
      return true;
    });
    document.getElementById(`${this.tid}`).addEventListener("mousemove", (event) => {
      if (this.pressed) {
        this.moved = true;
      }
      return true;
    });
    document.getElementById(`${this.tid}`).addEventListener("mouseup", (event) => {
      if (!this.moved) {
        document.getElementById(`${this.tid}-input`).focus();
      }
      this.moved = false;
      this.pressed = false;
      return true;
    });
    document.getElementById(`${this.tid}-input`).addEventListener("paste", (event) => {
      var j, len, line, s, text;
      text = event.clipboardData.getData("text/plain");
      s = text.split("\n");
      if (s.length > 1) {
        event.preventDefault();
        for (j = 0, len = s.length; j < len; j++) {
          line = s[j];
          document.getElementById(`${this.tid}-input`).value = "";
          this.validateLine(line);
        }
      } else {
        return false;
      }
    });
    //document.getElementById("#{@tid}-input").value = s[0]
    document.getElementById(`${this.tid}-input`).addEventListener("keydown", (event) => {
      var v;
      // console.info event.key
      if (event.key === "Enter") {
        v = document.getElementById(`${this.tid}-input`).value;
        document.getElementById(`${this.tid}-input`).value = "";
        this.validateLine(v);
        return this.force_scroll = true;
      } else if (event.key === "ArrowUp") {
        if (this.history_index == null) {
          this.history_index = this.history.length - 1;
          this.current_input = document.getElementById(`${this.tid}-input`).value;
        } else {
          this.history_index = Math.max(0, this.history_index - 1);
        }
        if (this.history_index === this.history.length - 1) {
          this.current_input = document.getElementById(`${this.tid}-input`).value;
        }
        if (this.history_index >= 0 && this.history_index < this.history.length) {
          document.getElementById(`${this.tid}-input`).value = this.history[this.history_index];
          return this.setTrailingCaret();
        }
      } else if (event.key === "ArrowDown") {
        if (this.history_index === this.history.length) {
          return;
        }
        if (this.history_index != null) {
          this.history_index = Math.min(this.history.length, this.history_index + 1);
        } else {
          return;
        }
        if (this.history_index >= 0 && this.history_index < this.history.length) {
          document.getElementById(`${this.tid}-input`).value = this.history[this.history_index];
          return this.setTrailingCaret();
        } else if (this.history_index === this.history.length) {
          document.getElementById(`${this.tid}-input`).value = this.current_input;
          return this.setTrailingCaret();
        }
      }
    });
    return setInterval((() => {
      return this.update();
    }), 16);
  }

  validateLine(v) {
    var i, j, ref;
    this.history_index = null;
    if (v.trim().length > 0 && v !== this.history[this.history.length - 1]) {
      this.history.push(v);
      if (this.history.length > 1000) {
        this.history.splice(0, 1);
      }
      this.saveHistory();
    }
    this.echo(`${v}`, true, "input");
    if (this.commands[v.trim()] != null) {
      return this.commands[v.trim()]();
    } else {
      this.runwindow.runCommand(v);
      if (this.runwindow.multiline) {
        document.querySelector(`#${this.tid}-input-gt i`).classList.add("fa-ellipsis-v");
        for (i = j = 0, ref = this.runwindow.nesting * 2 - 1; j <= ref; i = j += 1) {
          document.getElementById(`${this.tid}-input`).value += " ";
        }
        return this.setTrailingCaret();
      } else {
        return document.querySelector(`#${this.tid}-input-gt i`).classList.remove("fa-ellipsis-v");
      }
    }
  }

  setTrailingCaret() {
    return setTimeout((() => {
      var val;
      val = document.getElementById(`${this.tid}-input`).value;
      return document.getElementById(`${this.tid}-input`).setSelectionRange(val.length, val.length);
    }), 0);
  }

  update() {
    var container, div, e, element, j, len, ref, t;
    if (this.buffer.length > 0) {
      if (this.force_scroll) {
        this.scroll = true;
        this.force_scroll = false;
      } else {
        e = document.getElementById(`${this.tid}-view`);
        this.scroll = Math.abs(e.getBoundingClientRect().height + e.scrollTop - e.scrollHeight) < 10;
      }
      div = document.createDocumentFragment();
      container = document.createElement("div");
      div.appendChild(container);
      ref = this.buffer;
      for (j = 0, len = ref.length; j < len; j++) {
        t = ref[j];
        container.appendChild(element = this.echoReal(t.text, t.classname));
      }
      document.getElementById(`${this.tid}-lines`).appendChild(div);
      if (this.scroll) {
        element.scrollIntoView();
      }
      this.length += this.buffer.length;
      return this.buffer = [];
    }
  }

  echo(text, scroll = false, classname) {
    this.buffer.push({
      text: text,
      classname: classname
    });
  }

  echoReal(text, classname) {
    var d, div, i;
    div = document.createElement("div");
    if (classname === "input") {
      d = document.createTextNode(" " + text);
      i = document.createElement("i");
      i.classList.add("fa");
      i.classList.add("fa-angle-right");
      div.appendChild(i);
      div.appendChild(d);
    } else {
      div.innerText = text;
    }
    if (classname != null) {
      div.classList.add(classname);
    }
    this.truncate();
    return div;
  }

  error(text, scroll = false) {
    this.echo(text, scroll, "error");
    return this.error_lines += 1;
  }

  truncate() {
    var c, e;
    e = document.getElementById(`${this.tid}-lines`);
    while (this.length > 10000 && (e.firstChild != null)) {
      c = e.firstChild.children.length;
      e.removeChild(e.firstChild);
      this.length -= c;
    }
  }

  clear() {
    document.getElementById(`${this.tid}-lines`).innerHTML = "";
    this.buffer = [];
    this.length = 0;
    this.error_lines = 0;
    document.querySelector(`#${this.tid}-input-gt i`).classList.remove("fa-ellipsis-v");
    return delete this.runwindow.multiline;
  }

};
