var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

this.Editor = (function() {
  function Editor(app) {
    var f;
    this.app = app;
    this.editor = ace.edit("editor-view");
    this.editor.$blockScrolling = 2e308;
    this.editor.setTheme("ace/theme/tomorrow_night_bright");
    this.editor.getSession().setMode("ace/mode/microscript");
    this.editor.setFontSize("14px");
    this.editor.getSession().setOptions({
      tabSize: 2,
      useSoftTabs: true,
      useWorker: false
    });
    this.update_delay = 50;
    this.update_time = 0;
    setInterval(((function(_this) {
      return function() {
        return _this.check();
      };
    })(this)), this.update_delay / 2);
    this.save_delay = 3000;
    this.save_time = 0;
    setInterval(((function(_this) {
      return function() {
        return _this.checkSave();
      };
    })(this)), this.save_delay / 2);
    this.editor.getSession().on("change", (function(_this) {
      return function() {
        return _this.editorContentsChanged();
      };
    })(this));
    this.editor.on("blur", (function(_this) {
      return function() {
        return _this.app.runwindow.rulercanvas.hide();
      };
    })(this));
    this.editor.on("focus", (function(_this) {
      return function() {
        _this.checkValueToolButtons();
        return _this.cancelValueTool();
      };
    })(this));
    this.RULER_FUNCTIONS = ["fillRect", "fillRound", "fillRoundRect", "drawRect", "drawRound", "drawRoundRect", "drawSprite", "drawMap", "drawText", "drawLine", "drawPolygon", "fillPolygon"];
    this.number_tool_button = document.getElementById("number-value-tool-button");
    this.color_tool_button = document.getElementById("color-value-tool-button");
    this.number_tool_button.addEventListener("click", (function(_this) {
      return function(event) {
        event.preventDefault();
        if (_this.value_tool) {
          return _this.cancelValueTool();
        } else {
          return _this.showValueTool();
        }
      };
    })(this));
    this.color_tool_button.addEventListener("click", (function(_this) {
      return function(event) {
        event.preventDefault();
        if (_this.value_tool) {
          return _this.cancelValueTool();
        } else {
          return _this.showValueTool();
        }
      };
    })(this));
    this.editor.selection.on("changeCursor", (function(_this) {
      return function() {
        _this.liveHelp();
        if (_this.value_tool == null) {
          _this.drawHelper();
        }
        return _this.checkValueToolButtons();
      };
    })(this));
    this.show_help = true;
    document.querySelector("#help-window").addEventListener("click", (function(_this) {
      return function() {
        _this.show_help = !_this.show_help;
        if (!_this.show_help) {
          document.querySelector("#help-window").classList.add("disabled");
          return document.querySelector("#help-window .content").style.display = "none";
        } else {
          document.querySelector("#help-window").classList.remove("disabled");
          return _this.liveHelp();
        }
      };
    })(this));
    document.addEventListener("keydown", (function(_this) {
      return function(event) {
        if (event.keyCode !== 17 && event.ctrlKey) {
          _this.cancelValueTool();
          _this.ignore_ctrl_up = true;
        }
      };
    })(this));
    document.addEventListener("keyup", (function(_this) {
      return function(event) {
        if (document.getElementById("editor-view").offsetParent == null) {
          return;
        }
        if (event.keyCode === 17 && !event.altKey) {
          if (_this.ignore_ctrl_up) {
            _this.ignore_ctrl_up = false;
            return;
          }
          if (_this.value_tool) {
            _this.cancelValueTool();
          } else {
            _this.showValueTool();
          }
        }
      };
    })(this));
    document.getElementById("source-list-header").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.toggleFileList();
      };
    })(this));
    this.app.appui.setAction("create-source-button", (function(_this) {
      return function() {
        _this.createSource();
        return _this.toggleFileList(false);
      };
    })(this));
    document.querySelector("#code-search").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.editor.execCommand("find");
      };
    })(this));
    this.font_size = 14;
    this.MIN_FONT_SIZE = 8;
    this.MAX_FONT_SIZE = 30;
    f = localStorage.getItem("code_editor_font_size");
    if (f != null) {
      try {
        f = parseInt(f);
        if (f >= this.MIN_FONT_SIZE && f < this.MAX_FONT_SIZE) {
          this.font_size = f;
          this.editor.setOptions({
            fontSize: this.font_size
          });
        }
      } catch (error) {}
    }
    document.querySelector("#code-font-minus").addEventListener("click", (function(_this) {
      return function(event) {
        _this.font_size = Math.max(_this.MIN_FONT_SIZE, _this.font_size - 1);
        _this.editor.setOptions({
          fontSize: _this.font_size
        });
        return localStorage.setItem("code_editor_font_size", _this.font_size);
      };
    })(this));
    document.querySelector("#code-font-plus").addEventListener("click", (function(_this) {
      return function(event) {
        _this.font_size = Math.min(_this.MAX_FONT_SIZE, _this.font_size + 1);
        _this.editor.setOptions({
          fontSize: _this.font_size
        });
        return localStorage.setItem("code_editor_font_size", _this.font_size);
      };
    })(this));
  }

  Editor.prototype.toggleFileList = function(close) {
    var list, view;
    view = document.getElementById("editor-view");
    list = document.getElementById("source-list-panel");
    if (close == null) {
      close = list.clientWidth > 100;
    }
    if (close) {
      list.style.width = "40px";
      view.style.left = "40px";
      document.querySelector(".source-list-header i").classList.remove("fa-chevron-circle-left");
      document.querySelector(".source-list-header i").classList.add("fa-chevron-circle-right");
      document.getElementById("code-toolbar").style["padding-left"] = "50px";
      return setTimeout(((function(_this) {
        return function() {
          return _this.editor.resize();
        };
      })(this)), 600);
    } else {
      list.style.width = "180px";
      view.style.left = "180px";
      document.querySelector(".source-list-header i").classList.add("fa-chevron-circle-left");
      document.querySelector(".source-list-header i").classList.remove("fa-chevron-circle-right");
      document.getElementById("code-toolbar").style["padding-left"] = "190px";
      return setTimeout(((function(_this) {
        return function() {
          return _this.editor.resize();
        };
      })(this)), 600);
    }
  };

  Editor.prototype.editorContentsChanged = function() {
    var source, src;
    if (this.ignore_changes) {
      return;
    }
    src = this.editor.getValue();
    this.update_time = Date.now();
    this.save_time = Date.now();
    this.app.project.addPendingChange(this);
    if (this.selected_source != null) {
      this.app.project.lockFile("ms/" + this.selected_source + ".ms");
      source = this.app.project.getSource(this.selected_source);
      if (source != null) {
        source.content = this.getCode();
      }
    }
    if (this.value_tool == null) {
      return this.drawHelper();
    }
  };

  Editor.prototype.check = function() {
    var p, parser;
    if (this.update_time > 0 && (this.value_tool || Date.now() > this.update_time + this.update_delay)) {
      this.update_time = 0;
      parser = new Parser(this.editor.getValue());
      p = parser.parse();
      if (parser.error_info == null) {
        return this.app.runwindow.updateCode(this.selected_source + ".ms", this.getCode());
      }
    }
  };

  Editor.prototype.getCurrentLine = function() {
    var range, row;
    range = this.editor.getSelectionRange();
    row = range.start.row;
    return this.editor.session.getLine(row);
  };

  Editor.prototype.checkSave = function(immediate, callback) {
    if (immediate == null) {
      immediate = false;
    }
    if (this.save_time > 0 && (immediate || Date.now() > this.save_time + this.save_delay)) {
      this.saveCode(callback);
      return this.save_time = 0;
    }
  };

  Editor.prototype.forceSave = function(callback) {
    return this.checkSave(true, callback);
  };

  Editor.prototype.saveCode = function(callback) {
    var saved, source;
    source = this.app.project.getSource(this.selected_source);
    saved = false;
    this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: "ms/" + this.selected_source + ".ms",
      content: this.getCode()
    }, (function(_this) {
      return function(msg) {
        saved = true;
        if (_this.save_time === 0) {
          _this.app.project.removePendingChange(_this);
        }
        if (source) {
          source.size = msg.size;
        }
        if (callback != null) {
          return callback();
        }
      };
    })(this));
    return setTimeout(((function(_this) {
      return function() {
        if (!saved) {
          _this.save_time = Date.now();
          return console.info("retrying code save...");
        }
      };
    })(this)), 10000);
  };

  Editor.prototype.getCode = function() {
    return this.editor.getValue();
  };

  Editor.prototype.setCode = function(code) {
    this.ignore_changes = true;
    this.editor.setValue(code, -1);
    this.editor.getSession().setUndoManager(new ace.UndoManager());
    return this.ignore_changes = false;
  };

  Editor.prototype.addDocButton = function(pointer) {
    var button, content;
    content = document.querySelector("#help-window .content");
    button = document.createElement("div");
    button.classList.add("see-doc-button");
    button.innerHTML = "<i class='fa fa-book-open'></i> " + this.app.translator.get("View doc");
    button.addEventListener("click", (function(_this) {
      return function(event) {
        var element;
        event.stopPropagation();
        _this.app.appui.setMainSection("help", true);
        element = document.getElementById(pointer);
        if (element != null) {
          return element.scrollIntoView();
        }
      };
    })(this));
    return content.insertBefore(button, content.firstChild);
  };

  Editor.prototype.liveHelp = function() {
    var column, content, help, j, len, line, md, res, suggest;
    if (!this.show_help) {
      return;
    }
    line = this.getCurrentLine();
    column = this.editor.getSelectionRange().start.column;
    suggest = this.app.documentation.findSuggestMatch(line, column);
    content = document.querySelector("#help-window .content");
    if (suggest.length === 0) {
      help = this.app.documentation.findHelpMatch(line);
      if (help.length > 0) {
        content.innerHTML = DOMPurify.sanitize(marked(help[0].value));
        content.style.display = "block";
        document.querySelector("#help-window").classList.add("showing");
        return this.addDocButton(help[0].pointer);
      } else {
        content.innerHTML = "";
        return content.style.display = "none";
      }
    } else if (suggest.length === 1) {
      content.innerHTML = DOMPurify.sanitize(marked(suggest[0].value));
      content.style.display = "block";
      document.querySelector("#help-window").classList.add("showing");
      return this.addDocButton(suggest[0].pointer);
    } else {
      md = "";
      for (j = 0, len = suggest.length; j < len; j++) {
        res = suggest[j];
        md += res.ref + "\n\n";
      }
      content.innerHTML = DOMPurify.sanitize(marked(md));
      content.style.display = "block";
      document.querySelector("#help-window").classList.add("showing");
      return this.addDocButton(suggest[0].pointer);
    }
  };

  Editor.prototype.tokenizeLine = function(line) {
    var err, index, list, token, tokenizer;
    tokenizer = new Tokenizer(line);
    index = 0;
    list = [];
    try {
      while (true) {
        token = tokenizer.next();
        if (token == null) {
          break;
        }
        list.push({
          token: token,
          start: index,
          end: tokenizer.index
        });
        index = tokenizer.index;
      }
    } catch (error) {
      err = error;
    }
    return list;
  };

  Editor.prototype.checkValueToolButtons = function() {
    var column, index, j, len, line, list, range, ref, row, token;
    range = this.editor.getSelectionRange();
    row = range.start.row;
    column = range.start.column;
    line = this.editor.session.getLine(row);
    list = this.tokenizeLine(line);
    for (index = j = 0, len = list.length; j < len; index = ++j) {
      token = list[index];
      if (column >= token.start && column <= token.end && ((ref = token.token.type) === Token.TYPE_NUMBER || ref === Token.TYPE_STRING)) {
        break;
      }
      if (column >= token.start && column <= token.end && token.token.type === Token.TYPE_MINUS && index < list.length - 1) {
        if (list[index + 1].token.type === Token.TYPE_NUMBER) {
          index += 1;
          token = list[index];
          break;
        }
      }
    }
    if (token != null) {
      switch (token.token.type) {
        case Token.TYPE_NUMBER:
          this.color_tool_button.style.display = "none";
          this.number_tool_button.style.display = "inline-block";
          return;
        case Token.TYPE_STRING:
          if (RegexLib.csscolor.test(token.token.value)) {
            this.color_tool_button.style.display = "inline-block";
            this.number_tool_button.style.display = "none";
            return;
          }
      }
    }
    this.color_tool_button.style.display = "none";
    return this.number_tool_button.style.display = "none";
  };

  Editor.prototype.hideValueToolButtons = function() {
    this.color_tool_button.style.display = "none";
    return this.number_tool_button.style.display = "none";
  };

  Editor.prototype.showValueTool = function() {
    var column, end, endcolumn, index, j, len, line, list, pos, range, ref, ref1, row, start, start_token, token, value;
    if (this.value_tool != null) {
      return;
    }
    this.cancelValueTool();
    range = this.editor.getSelectionRange();
    row = range.start.row;
    if (range.end.row !== range.start.row) {
      return;
    }
    column = range.start.column;
    endcolumn = range.end.column;
    line = this.editor.session.getLine(row);
    list = this.tokenizeLine(line);
    for (index = j = 0, len = list.length; j < len; index = ++j) {
      token = list[index];
      if (column >= token.start && column <= token.end && ((ref = token.token.type) === Token.TYPE_NUMBER || ref === Token.TYPE_STRING)) {
        start = token.start;
        end = token.end;
        break;
      }
      if (column >= token.start && column <= token.end && token.token.type === Token.TYPE_MINUS && index < list.length - 1) {
        if (list[index + 1].token.type === Token.TYPE_NUMBER) {
          start = token.start;
          index += 1;
          token = list[index];
          end = token.end;
          break;
        }
      }
    }
    if ((token != null) && column >= start && endcolumn <= end) {
      switch (token.token.type) {
        case Token.TYPE_NUMBER:
          value = token.token.value;
          start_token = token;
          if (index > 0 && list[index - 1].token.type === Token.TYPE_MINUS && (index < 2 || ((ref1 = list[index - 2].token.type) !== Token.TYPE_NUMBER && ref1 !== Token.TYPE_IDENTIFIER && ref1 !== Token.TYPE_CLOSED_BRACE && ref1 !== Token.TYPE_CLOSED_BRACKET))) {
            value = -value;
            start_token = list[index - 1];
          }
          start = line.substring(0, start_token.start);
          end = line.substring(token.end, line.length);
          pos = this.editor.renderer.$cursorLayer.getPixelPosition(range.start, true);
          this.editor.blur();
          this.value_tool = new ValueTool(this, pos.left, pos.top, value, (function(_this) {
            return function(value) {
              console.info(value);
              _this.editor.session.replace({
                start: {
                  row: row,
                  column: 0
                },
                end: {
                  row: row,
                  column: Number.MAX_VALUE
                }
              }, start + value + end);
              _this.editor.selection.setRange(new ace.Range(row, start_token.start, row, start_token.start + ("" + value).length), true);
              return _this.drawHelper(row, column);
            };
          })(this));
          return true;
        case Token.TYPE_STRING:
          if (RegexLib.csscolor.test(token.token.value)) {
            start = line.substring(0, token.start);
            end = line.substring(token.end, line.length);
            pos = this.editor.renderer.$cursorLayer.getPixelPosition(range.start, true);
            this.editor.blur();
            this.value_tool = new ColorValueTool(this, pos.left, pos.top, token.token.value, (function(_this) {
              return function(value) {
                value = "\"" + value + "\"";
                return _this.editor.session.replace({
                  start: {
                    row: row,
                    column: 0
                  },
                  end: {
                    row: row,
                    column: Number.MAX_VALUE
                  }
                }, start + value + end);
              };
            })(this));
            return true;
          }
      }
    }
    return false;
  };

  Editor.prototype.cancelValueTool = function() {
    if (this.value_tool) {
      this.value_tool.dispose();
      this.value_tool = null;
      this.app.runwindow.rulercanvas.hide();
      return this.editor.focus();
    }
  };

  Editor.prototype.drawHelper = function(row, column) {
    var args, err, funk, res;
    try {
      res = this.analyzeLine(row, column);
      if (res != null) {
        if (res["function"].indexOf("Polygon") > 0 || res["function"] === "drawLine") {
          args = [];
          funk = (function(_this) {
            return function(i) {
              return _this.app.runwindow.runCommand(res.args[i], function(v) {
                args[i] = v;
                if (i < res.args.length - 1) {
                  return funk(i + 1);
                } else {
                  return _this.app.runwindow.rulercanvas.showPolygon(args, res.arg);
                }
              });
            };
          })(this);
          return funk(0);
        } else {
          return this.app.runwindow.runCommand(res.args[0], (function(_this) {
            return function(v1) {
              return _this.app.runwindow.runCommand(res.args[1], function(v2) {
                return _this.app.runwindow.runCommand(res.args[2], function(v3) {
                  return _this.app.runwindow.runCommand(res.args[3], function(v4) {
                    switch (res.arg) {
                      case 0:
                        return _this.app.runwindow.rulercanvas.showX(v1, v2, v3, v4);
                      case 1:
                        return _this.app.runwindow.rulercanvas.showY(v1, v2, v3, v4);
                      case 2:
                        return _this.app.runwindow.rulercanvas.showW(v1, v2, v3, v4);
                      case 3:
                        return _this.app.runwindow.rulercanvas.showH(v1, v2, v3, v4);
                      default:
                        return _this.app.runwindow.rulercanvas.showBox(v1, v2, v3, v4);
                    }
                  });
                });
              });
            };
          })(this));
        }
      } else {
        return this.app.runwindow.rulercanvas.hide();
      }
    } catch (error) {
      err = error;
      return console.error(err);
    }
  };

  Editor.prototype.analyzeLine = function(row, column) {
    var a, arg, arg_value, args, f, i, j, len, line, p, parser, range, ref, ref1, ref2;
    range = this.editor.getSelectionRange();
    if ((row == null) || (column == null)) {
      row = range.start.row;
      column = range.start.column;
    }
    line = this.editor.session.getLine(row);
    parser = new Parser(line + " ");
    p = parser.parse();
    if (parser.last_function_call != null) {
      f = parser.last_function_call;
      if ((f.expression.expression != null) && f.expression.expression.identifier === "screen" && (f.expression.chain != null) && (f.expression.chain[0] != null) && (ref = f.expression.chain[0].value, indexOf.call(this.RULER_FUNCTIONS, ref) >= 0)) {
        arg = -1;
        args = ["0", "0", "20", "20"];
        ref1 = f.argslimits;
        for (i = j = 0, len = ref1.length; j < len; i = ++j) {
          a = ref1[i];
          if (column >= a.start && column <= a.end) {
            arg = i;
          }
          arg_value = line.substring(a.start, a.end);
          if (arg_value.trim().length > 0) {
            args[i] = arg_value;
          }
        }
        if ((ref2 = f.expression.chain[0].value) === "drawSprite" || ref2 === "drawMap" || ref2 === "drawText") {
          args.splice(0, 1);
          arg -= 1;
          if (f.argslimits.length < 5 && f.expression.chain[0].value !== "drawText") {
            args[3] = args[2];
          }
        }
        if (f.expression.chain[0].value === "drawText") {
          args[3] = args[2];
          args[2] = args[2] * 4 + "";
          if (arg >= 2) {
            arg += 1;
          }
        }
        if (f.expression.chain[0].value.indexOf("Polygon") > 0 || f.expression.chain[0].value === "drawLine") {
          while (args.length > Math.max(2, f.argslimits.length)) {
            args.splice(args.length - 1, 1);
          }
        }
        return {
          "function": f.expression.chain[0].value,
          arg: arg,
          value: arg_value,
          args: args
        };
      }
    }
    return null;
  };

  Editor.prototype.setSelectedSource = function(name) {
    var different, e, j, k, len, len1, list, source;
    this.checkSave(true);
    if (this.selected_source != null) {
      this.sessions[this.selected_source] = {
        range: this.editor.getSelectionRange()
      };
    }
    different = name !== this.selected_source;
    this.selected_source = name;
    list = document.getElementById("source-list").childNodes;
    if (this.selected_source != null) {
      document.getElementById("code-toolbar").innerHTML = "<i class='fa fa-file'></i> " + this.selected_source;
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        if (e.getAttribute("id") === ("source-list-item-" + name)) {
          e.classList.add("selected");
        } else {
          e.classList.remove("selected");
        }
      }
    } else {
      for (k = 0, len1 = list.length; k < len1; k++) {
        e = list[k];
        e.classList.remove("selected");
      }
    }
    if (this.selected_source != null) {
      source = this.app.project.getSource(this.selected_source);
      this.setCode(source.content);
      this.updateCurrentFileLock();
      this.updateAnnotations();
      if (this.sessions[this.selected_source] && different) {
        this.editor.selection.setRange(this.sessions[this.selected_source].range);
        this.editor.revealRange(this.sessions[this.selected_source].range);
        return this.editor.focus();
      }
    } else {
      return this.setCode("");
    }
  };

  Editor.prototype.projectOpened = function() {
    this.sessions = {};
    this.app.project.addListener(this);
    this.app.runwindow.resetButtons();
    this.app.runwindow.windowResized();
    this.setSelectedSource(null);
    return this.updateRunLink();
  };

  Editor.prototype.projectUpdate = function(change) {
    if (change === "sourcelist") {
      return this.rebuildSourceList();
    } else if (change instanceof ProjectSource) {
      if (this.selected_source != null) {
        if (change === this.app.project.getSource(this.selected_source)) {
          return this.setCode(change.content);
        }
      }
    } else if (change === "locks") {
      this.updateCurrentFileLock();
      return this.updateActiveUsers();
    } else if (change === "code" || change === "public" || change === "slug") {
      return this.updateRunLink();
    } else if (change === "annotations") {
      return this.updateAnnotations();
    }
  };

  Editor.prototype.updateAnnotations = function() {
    var source;
    if (this.selected_source != null) {
      source = this.app.project.getSource(this.selected_source);
      if (source != null) {
        return this.editor.session.setAnnotations(source.annotations || []);
      }
    }
  };

  Editor.prototype.updateCurrentFileLock = function() {
    var lock, user;
    if (this.selected_source != null) {
      this.editor.setReadOnly(this.app.project.isLocked("ms/" + this.selected_source + ".ms"));
    }
    lock = document.getElementById("editor-locked");
    if ((this.selected_source != null) && this.app.project.isLocked("ms/" + this.selected_source + ".ms")) {
      user = this.app.project.isLocked("ms/" + this.selected_source + ".ms").user;
      lock.style = "display: block; background: " + (this.app.appui.createFriendColor(user));
      return lock.innerHTML = "<i class='fa fa-user'></i> Locked by " + user;
    } else {
      return lock.style = "display: none";
    }
  };

  Editor.prototype.rebuildSourceList = function() {
    var element, j, len, list, ref, s;
    list = document.getElementById("source-list");
    list.innerHTML = "";
    ref = this.app.project.source_list;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      element = this.createSourceBox(s);
      list.appendChild(element);
    }
    if ((this.selected_source == null) || (this.app.project.getSource(this.selected_source) == null)) {
      if (this.app.project.source_list.length > 0) {
        this.setSelectedSource(this.app.project.source_list[0].name);
      }
    }
    this.updateActiveUsers();
  };

  Editor.prototype.updateActiveUsers = function() {
    var e, file, j, len, list, lock;
    list = document.getElementById("source-list").childNodes;
    for (j = 0, len = list.length; j < len; j++) {
      e = list[j];
      file = e.id.split("-")[3];
      lock = this.app.project.isLocked("ms/" + file + ".ms");
      if ((lock != null) && Date.now() < lock.time) {
        e.querySelector(".active-user").style = "display: block; background: " + (this.app.appui.createFriendColor(lock.user)) + ";";
      } else {
        e.querySelector(".active-user").style = "display: none;";
      }
    }
  };

  Editor.prototype.createSourceBox = function(source) {
    var activeuser, element, i, input, span, tools, trash;
    element = document.createElement("div");
    element.classList.add("source-list-item");
    element.setAttribute("id", "source-list-item-" + source.name);
    element.title = source.name;
    element.addEventListener("click", (function(_this) {
      return function() {
        return _this.setSelectedSource(source.name);
      };
    })(this));
    if (source.name === this.selected_source) {
      element.classList.add("selected");
    }
    tools = document.createElement("div");
    tools.classList.add("source-tools");
    element.appendChild(tools);
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-file");
    element.appendChild(i);
    span = document.createElement("div");
    span.classList.add("filename");
    span.innerText = source.name;
    element.appendChild(span);
    input = document.createElement("input");
    span.addEventListener("dblclick", (function(_this) {
      return function() {
        if (_this.app.project.isLocked("ms/" + source.name + ".ms")) {
          return;
        }
        _this.app.project.lockFile("ms/" + source.name + ".ms");
        span.parentNode.replaceChild(input, span);
        input.value = source.name;
        return input.focus();
      };
    })(this));
    input.addEventListener("blur", (function(_this) {
      return function() {
        var old, value;
        input.parentNode.replaceChild(span, input);
        value = RegexLib.fixFilename(input.value);
        if (value !== source.name) {
          if (RegexLib.filename.test(value)) {
            if (_this.app.project.getSource(value) == null) {
              if (_this.selected_source === source.name) {
                _this.app.project.lockFile("ms/" + value + ".ms");
                _this.selected_source = value;
                old = source.name;
                return _this.saveCode(function() {
                  return _this.app.client.sendRequest({
                    name: "delete_project_file",
                    project: _this.app.project.id,
                    file: "ms/" + old + ".ms"
                  }, function(msg) {
                    return _this.app.project.updateSourceList();
                  });
                });
              }
            }
          }
        }
      };
    })(this));
    input.addEventListener("keydown", (function(_this) {
      return function(event) {
        _this.app.project.lockFile("ms/" + source.name + ".ms");
        if (event.key === "Enter") {
          event.preventDefault();
          input.blur();
          return false;
        } else {
          return true;
        }
      };
    })(this));
    trash = document.createElement("i");
    trash.classList.add("fa");
    trash.classList.add("fa-trash");
    trash.title = this.app.translator.get("Delete file");
    tools.appendChild(trash);
    trash.addEventListener("click", (function(_this) {
      return function() {
        if (confirm("Really delete " + source.name + "?")) {
          return _this.app.client.sendRequest({
            name: "delete_project_file",
            project: _this.app.project.id,
            file: "ms/" + source.name + ".ms"
          }, function(msg) {
            return _this.app.project.updateSourceList();
          });
        }
      };
    })(this));
    activeuser = document.createElement("i");
    activeuser.classList.add("active-user");
    activeuser.classList.add("fa");
    activeuser.classList.add("fa-user");
    element.appendChild(activeuser);
    return element;
  };

  Editor.prototype.createSource = function() {
    var source;
    this.checkSave(true);
    source = this.app.project.createSource();
    this.rebuildSourceList();
    this.setSelectedSource(source.name);
    return this.saveCode();
  };

  Editor.prototype.updateRunLink = function() {
    var element, iframe, url;
    element = document.getElementById("run-link");
    if (this.app.project != null) {
      url = location.origin.replace(".dev", ".io") + "/";
      url += this.app.project.owner.nick + "/";
      url += this.app.project.slug + "/";
      if (!this.app.project["public"]) {
        url += this.app.project.code + "/";
      }
      element.innerText = url;
      element.href = url;
      element.title = url;
      iframe = document.querySelector("#device iframe");
      if (iframe != null) {
        return iframe.src = url;
      }
    }
  };

  return Editor;

})();
