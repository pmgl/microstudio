var indexOf = [].indexOf;

this.Editor = class Editor extends Manager {
  constructor(app) {
    var f;
    super(app);
    this.language = this.app.languages.microscript;
    this.folder = "ms";
    this.item = "source";
    this.main_splitpanel = "code-editor";
    this.list_change_event = "sourcelist";
    this.get_item = "getSource";
    this.use_thumbnails = false;
    this.extensions = ["ms"];
    this.update_list = "updateSourceList";
    this.file_icon = "fa fa-file";
    this.init();
    this.editor = ace.edit("editor-view");
    this.editor.$blockScrolling = 2e308;
    this.editor.setTheme("ace/theme/tomorrow_night_bright");
    this.editor.getSession().setMode(this.language.ace_mode);
    this.editor.setFontSize("14px");
    this.editor.getSession().setOptions({
      tabSize: 2,
      useSoftTabs: true,
      useWorker: false // disables lua autocorrection ; preserves syntax coloring
    });
    //enableBasicAutocompletion: true
    //enableSnippets: true
    //enableLiveAutocompletion: true
    this.update_delay = 50;
    this.update_time = 0;
    setInterval((() => {
      return this.check();
    }), this.update_delay / 2);
    this.save_delay = 3000;
    this.save_time = 0;
    setInterval((() => {
      return this.checkSave();
    }), this.save_delay / 2);
    this.keydown_count = 0;
    this.lines_of_code = 0;
    this.editor.getSession().on("change", () => {
      return this.editorContentsChanged();
    });
    this.editor.on("blur", () => {
      this.app.runwindow.rulercanvas.hide();
      return document.getElementById("help-window").classList.add("disabled");
    });
    this.editor.on("focus", () => {
      this.checkValueToolButtons();
      this.cancelValueTool();
      if (this.show_help) {
        document.getElementById("help-window").classList.remove("disabled");
        return this.liveHelp();
      }
    });
    this.RULER_FUNCTIONS = ["fillRect", "fillRound", "fillRoundRect", "drawRect", "drawRound", "drawRoundRect", "drawSprite", "drawMap", "drawText", "drawLine", "drawPolygon", "fillPolygon"];
    this.number_tool_button = document.getElementById("number-value-tool-button");
    this.color_tool_button = document.getElementById("color-value-tool-button");
    this.number_tool_button.addEventListener("click", (event) => {
      event.preventDefault();
      if (this.value_tool) {
        return this.cancelValueTool();
      } else {
        return this.showValueTool();
      }
    });
    this.color_tool_button.addEventListener("click", (event) => {
      event.preventDefault();
      if (this.value_tool) {
        return this.cancelValueTool();
      } else {
        return this.showValueTool();
      }
    });
    this.editor.selection.on("changeCursor", () => {
      this.liveHelp();
      if (this.value_tool == null) {
        this.drawHelper();
      }
      return this.checkValueToolButtons();
    });
    this.show_help = true;
    document.querySelector("#help-window-content").addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.show_help = !this.show_help;
      event.preventDefault();
      if (!this.show_help) {
        document.querySelector("#help-window").classList.add("disabled");
        return document.querySelector("#help-window-content").classList.remove("displaycontent");
      } else {
        document.querySelector("#help-window").classList.remove("disabled");
        this.liveHelp();
        return this.editor.focus();
      }
    });
    document.addEventListener("keydown", (event) => {
      var err;
      try {
        if (event.keyCode === 13 && this.editor.getSelectionRange().start.column > 1) {
          this.lines_of_code += 1;
        } else if (event.keyCode !== 13) {
          this.keydown_count += 1;
        }
      } catch (error) {
        err = error;
        console.error(err);
      }
      if (event.keyCode !== 17 && event.ctrlKey) {
        this.cancelValueTool();
        this.ignore_ctrl_up = true;
      }
    });
    document.addEventListener("keyup", (event) => {
      if (document.getElementById("editor-view").offsetParent == null) {
        return;
      }
      if (event.keyCode === 17 && !event.altKey) {
        if (this.ignore_ctrl_up) {
          this.ignore_ctrl_up = false;
          return;
        }
        if (this.value_tool) {
          this.cancelValueTool();
        } else {
          this.showValueTool();
        }
      }
    });
    document.querySelector("#code-search").addEventListener("click", (event) => {
      return this.editor.execCommand("find");
    });
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
    document.querySelector("#code-font-minus").addEventListener("click", (event) => {
      this.font_size = Math.max(this.MIN_FONT_SIZE, this.font_size - 1);
      this.editor.setOptions({
        fontSize: this.font_size
      });
      return localStorage.setItem("code_editor_font_size", this.font_size);
    });
    document.querySelector("#code-font-plus").addEventListener("click", (event) => {
      this.font_size = Math.min(this.MAX_FONT_SIZE, this.font_size + 1);
      this.editor.setOptions({
        fontSize: this.font_size
      });
      return localStorage.setItem("code_editor_font_size", this.font_size);
    });
    this.lib_manager_button = document.querySelector("#manage-libs-button");
    this.lib_manager = document.querySelector(".lib-manager-container");
    this.editor_view = document.querySelector("#editor-view");
    this.lib_manager_button.addEventListener("click", () => {
      return this.toggleLibManager();
    });
  }

  updateLanguage() {
    if (this.app.project) {
      switch (this.app.project.language) {
        case "python":
          this.language = this.app.languages.python;
          break;
        case "javascript":
          this.language = this.app.languages.javascript;
          break;
        case "lua":
          this.language = this.app.languages.lua;
          break;
        case "microscript_v2":
          this.language = this.app.languages.microscript2;
          break;
        default:
          this.language = this.app.languages.microscript;
      }
    }
    this.editor.getSession().setMode(this.language.ace_mode);
    return this.updateSourceLanguage();
  }

  checkEmbeddedJavaScript(src) {
    if (this.app.project.language === "microscript_v2") {
      if (/^\s*\/\/\s*javascript\s*\n/.test(src)) {
        if (this.language !== this.app.languages.javascript) {
          this.language = this.app.languages.javascript;
          return this.editor.getSession().setMode(this.language.ace_mode);
        }
      } else {
        if (this.language !== this.app.languages.microscript2) {
          this.language = this.app.languages.microscript2;
          return this.editor.getSession().setMode(this.language.ace_mode);
        }
      }
    }
  }

  editorContentsChanged() {
    var source, src;
    if (this.ignore_changes) {
      return;
    }
    src = this.editor.getValue();
    this.checkEmbeddedJavaScript(src);
    this.update_time = Date.now();
    this.save_time = Date.now();
    this.app.project.addPendingChange(this);
    if (this.selected_source != null) {
      this.app.project.lockFile(`ms/${this.selected_source}.ms`);
      source = this.app.project.getSource(this.selected_source);
      if (source != null) {
        source.content = this.getCode();
      }
    }
    if (this.value_tool == null) {
      return this.drawHelper();
    }
  }

  check() {
    var p, parser;
    if (this.update_time > 0 && (this.value_tool || Date.now() > this.update_time + this.update_delay)) {
      this.update_time = 0;
      if (this.language.parser) {
        parser = new this.language.parser(this.editor.getValue());
        p = parser.parse();
        if (parser.error_info == null) {
          return this.app.runwindow.updateCode(this.selected_source + ".ms", this.getCode());
        }
      } else {
        return this.app.runwindow.updateCode(this.selected_source + ".ms", this.getCode());
      }
    }
  }

  getCurrentLine() {
    var range, row;
    range = this.editor.getSelectionRange();
    row = range.start.row;
    return this.editor.session.getLine(row);
  }

  checkSave(immediate = false, callback) {
    if (this.save_time > 0 && (immediate || Date.now() > this.save_time + this.save_delay)) {
      this.saveCode(callback);
      return this.save_time = 0;
    }
  }

  forceSave(callback) {
    return this.checkSave(true, callback);
  }

  saveCode(callback) {
    var keycount, lines, saved, source;
    source = this.app.project.getSource(this.selected_source);
    saved = false;
    lines = this.lines_of_code;
    keycount = this.keydown_count;
    this.keydown_count = 0;
    this.lines_of_code = 0;
    this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: `ms/${this.selected_source}.ms`,
      characters: keycount,
      lines: lines,
      content: this.getCode()
    }, (msg) => {
      saved = true;
      if (this.save_time === 0) {
        this.app.project.removePendingChange(this);
      }
      if (source) {
        source.size = msg.size;
      }
      if (callback != null) {
        return callback();
      }
    });
    return setTimeout((() => {
      if (!saved) {
        this.save_time = Date.now();
        return console.info("retrying code save...");
      }
    }), 10000);
  }

  getCode() {
    return this.editor.getValue();
  }

  setCode(code) {
    this.ignore_changes = true;
    this.editor.setValue(code, -1);
    this.editor.getSession().setUndoManager(new ace.UndoManager());
    this.ignore_changes = false;
    this.updateCurrentFileLock();
    return this.checkEmbeddedJavaScript(code);
  }

  addDocButton(pointer, section) {
    var button, content;
    content = document.querySelector("#help-window .content");
    button = document.createElement("div");
    button.classList.add("see-doc-button");
    button.innerHTML = "<i class='fa fa-book-open'></i> " + this.app.translator.get("View doc");
    button.addEventListener("mousedown", (event) => {
      var element;
      event.stopPropagation();
      this.app.documentation.setSection(section || "API");
      this.app.appui.setMainSection("help", true);
      element = document.getElementById(pointer);
      if (element != null) {
        return element.scrollIntoView();
      }
    });
    return content.insertBefore(button, content.firstChild);
  }

  liveHelp() {
    var c, column, content, help, j, len, line, md, res, suggest;
    if (!this.show_help) {
      return;
    }
    line = this.getCurrentLine().replace(":", ".");
    column = this.editor.getSelectionRange().start.column;
    suggest = this.app.documentation.findSuggestMatch(line, column);
    content = document.querySelector("#help-window .content");
    if (suggest.length === 0) {
      help = this.app.documentation.findHelpMatch(line);
      if (help.length > 0) {
        content.innerHTML = DOMPurify.sanitize(marked(help[0].value));
        document.querySelector("#help-window").classList.add("showing");
        this.addDocButton(help[0].pointer, help[0].section);
      } else {
        content.innerHTML = "";
        c = document.querySelector("#help-window-content");
        c.classList.remove("displaycontent");
        return;
      }
    } else if (suggest.length === 1) {
      content.innerHTML = DOMPurify.sanitize(marked(suggest[0].value));
      document.querySelector("#help-window").classList.add("showing");
      this.addDocButton(suggest[0].pointer, suggest[0].section);
    } else {
      md = "";
      for (j = 0, len = suggest.length; j < len; j++) {
        res = suggest[j];
        md += res.ref + "\n\n";
      }
      content.innerHTML = DOMPurify.sanitize(marked(md));
      document.querySelector("#help-window").classList.add("showing");
      this.addDocButton(suggest[0].pointer, suggest[0].section);
    }
    c = document.querySelector("#help-window-content");
    if (window.innerWidth < 800) {
      c.style["max-width"] = (window.innerWidth - 120) + "px";
    } else {
      c.style["max-width"] = "unset";
    }
    if (this.app.appui.code_splitbar.type === "vertical") {
      c.classList.add("displaycontent");
      return c.classList.add("vertical");
    } else {
      c.classList.add("displaycontent");
      return c.classList.remove("vertical");
    }
  }

  tokenizeLine(line) {
    var err, index, list, token, tokenizer;
    tokenizer = new Tokenizer(line.replace(":", "."));
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
  }

  checkValueToolButtons() {
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
  }

  hideValueToolButtons() {
    this.color_tool_button.style.display = "none";
    return this.number_tool_button.style.display = "none";
  }

  showValueTool() {
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
          //@editor.selection.setRange(new ace.Range(row,start_token.start,row,token.end),true)
          this.editor.blur();
          this.value_tool = new ValueTool(this, pos.left, pos.top, value, (value) => {
            this.editor.session.replace({
              start: {
                row: row,
                column: 0
              },
              end: {
                row: row,
                column: Number.MAX_VALUE
              }
            }, start + value + end);
            this.editor.selection.setRange(new ace.Range(row, start_token.start, row, start_token.start + ("" + value).length), true);
            return this.drawHelper(row, column);
          });
          return true;
        case Token.TYPE_STRING:
          if (RegexLib.csscolor.test(token.token.value)) {
            start = line.substring(0, token.start);
            end = line.substring(token.end, line.length);
            pos = this.editor.renderer.$cursorLayer.getPixelPosition(range.start, true);
            this.editor.blur();
            this.value_tool = new ColorValueTool(this, pos.left, pos.top, token.token.value, (value) => {
              value = `"${value}"`;
              return this.editor.session.replace({
                start: {
                  row: row,
                  column: 0
                },
                end: {
                  row: row,
                  column: Number.MAX_VALUE
                }
              }, start + value + end);
            });
            return true;
          }
      }
    }
    return false;
  }

  cancelValueTool() {
    if (this.value_tool) {
      this.value_tool.dispose();
      this.value_tool = null;
      this.app.runwindow.rulercanvas.hide();
      return this.editor.focus();
    }
  }

  evalArg(arg, callback) {
    if (document.getElementById("runiframe") != null) {
      return this.app.runwindow.runCommand(arg, callback);
    } else {
      return callback(isFinite(arg) ? arg * 1 : 0);
    }
  }

  drawHelper(row, column) {
    var args, err, funk, i, j, ref, res;
    try {
      res = this.analyzeLine(row, column);
      if (res != null) {
        if (this.app.project.language.startsWith("microscript")) {
          if (res.function.indexOf("Polygon") > 0 || res.function === "drawLine") {
            args = [];
            funk = (i) => {
              return this.evalArg(res.args[i], (v) => {
                args[i] = v;
                if (i < res.args.length - 1) {
                  return funk(i + 1);
                } else {
                  return this.app.runwindow.rulercanvas.showPolygon(args, res.arg);
                }
              });
            };
            return funk(0);
          } else {
            return this.evalArg(res.args[0], (v1) => {
              return this.evalArg(res.args[1], (v2) => {
                return this.evalArg(res.args[2], (v3) => {
                  return this.evalArg(res.args[3], (v4) => {
                    switch (res.arg) {
                      case 0:
                        return this.app.runwindow.rulercanvas.showX(v1, v2, v3, v4);
                      case 1:
                        return this.app.runwindow.rulercanvas.showY(v1, v2, v3, v4);
                      case 2:
                        return this.app.runwindow.rulercanvas.showW(v1, v2, v3, v4);
                      case 3:
                        return this.app.runwindow.rulercanvas.showH(v1, v2, v3, v4);
                      default:
                        return this.app.runwindow.rulercanvas.showBox(v1, v2, v3, v4);
                    }
                  });
                });
              });
            });
          }
        } else {
          if (res.function.indexOf("Polygon") > 0 || res.function === "drawLine") {
            args = res.args;
            return this.app.runwindow.rulercanvas.showPolygon(args, res.arg);
          } else {
            args = res.args;
            for (i = j = 0, ref = args.length - 1; j <= ref; i = j += 1) {
              args[i] = args[i] | 0;
            }
            switch (res.arg) {
              case 0:
                return this.app.runwindow.rulercanvas.showX(args[0], args[1], args[2], args[3]);
              case 1:
                return this.app.runwindow.rulercanvas.showY(args[0], args[1], args[2], args[3]);
              case 2:
                return this.app.runwindow.rulercanvas.showW(args[0], args[1], args[2], args[3]);
              case 3:
                return this.app.runwindow.rulercanvas.showH(args[0], args[1], args[2], args[3]);
              default:
                return this.app.runwindow.rulercanvas.showBox(args[0], args[1], args[2], args[3]);
            }
          }
        }
      } else {
        return this.app.runwindow.rulercanvas.hide();
      }
    } catch (error) {
      err = error;
      return console.error(err);
    }
  }

  analyzeLine(row, column) {
    var a, arg, arg_value, args, f, i, j, len, line, p, parser, range, ref, ref1, ref2;
    range = this.editor.getSelectionRange();
    if ((row == null) || (column == null)) {
      row = range.start.row;
      column = range.start.column;
    }
    line = this.editor.session.getLine(row);
    parser = new Parser(line.replace(":", ".") + " ");
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
          function: f.expression.chain[0].value,
          arg: arg,
          value: arg_value,
          args: args
        };
      }
    }
    return null;
  }

  updateSourceLanguage() {
    var element, lang;
    lang = this.app.project.language.split("_")[0];
    element = document.querySelector("#source-asset-bar .language");
    element.innerText = lang;
    element.className = "";
    element.classList.add(lang);
    return element.classList.add("language");
  }

  // document.getElementById("code-toolbar").innerHTML += "<span class='language #{lang}'>#{lang}</span>"
  setSelectedItem(name) {
    this.setSelectedSource(name);
    return super.setSelectedItem(name);
  }

  setSelectedSource(name) {
    var different, source;
    this.toggleLibManager(false);
    this.checkSave(true);
    if (this.selected_source != null) {
      this.sessions[this.selected_source] = {
        range: this.editor.getSelectionRange()
      };
    }
    different = name !== this.selected_source;
    this.selected_source = name;
    if (this.selected_source != null) {
      this.updateSourceLanguage();
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
  }

  projectOpened() {
    super.projectOpened();
    this.sessions = {};
    this.app.project.addListener(this);
    this.app.runwindow.resetButtons();
    this.app.runwindow.windowResized();
    this.setSelectedItem(null);
    this.updateRunLink();
    this.updateLanguage();
    return this.update();
  }

  projectUpdate(change) {
    super.projectUpdate(change);
    if (change instanceof ProjectSource) {
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
  }

  updateAnnotations() {
    var source;
    if (this.selected_source != null) {
      source = this.app.project.getSource(this.selected_source);
      if (source != null) {
        return this.editor.session.setAnnotations(source.annotations || []);
      }
    }
  }

  updateCurrentFileLock() {
    var lock, source, user;
    lock = document.getElementById("editor-locked");
    if (this.selected_source != null) {
      if (this.app.project.isLocked(`ms/${this.selected_source}.ms`)) {
        this.editor.setReadOnly(true);
        user = this.app.project.isLocked(`ms/${this.selected_source}.ms`).user;
        return this.showLock(`<i class='fa fa-user'></i> Locked by ${user}`, this.app.appui.createFriendColor(user));
      } else {
        source = this.app.project.getSource(this.selected_source);
        if ((source != null) && !source.fetched) {
          this.editor.setReadOnly(true);
          return this.showLock("<i class=\"fas fa-spinner fa-spin\"></i> " + this.app.translator.get("Loading..."), "hsl(200,50%,50%)");
        } else {
          this.hideLock();
          return this.editor.setReadOnly(false);
        }
      }
    } else {
      this.hideLock();
      return this.editor.setReadOnly(true);
    }
  }

  showLock(html, color) {
    var lock;
    lock = document.getElementById("editor-locked");
    this.lock_shown = true;
    lock.style = `display: block; background: ${color}; opacity: 1`;
    lock.innerHTML = html;
    return document.getElementById("editor-view").style.opacity = .5;
  }

  hideLock() {
    var lock;
    lock = document.getElementById("editor-locked");
    this.lock_shown = false;
    lock.style.opacity = 0;
    document.getElementById("editor-view").style.opacity = 1;
    return setTimeout((() => {
      if (!this.lock_shown) {
        return lock.style.display = "none";
      }
    }), 1000);
  }

  selectedItemRenamed() {
    return this.selected_source = this.selected_item;
  }

  rebuildList() {
    super.rebuildList();
    if ((this.selected_source == null) || (this.app.project.getSource(this.selected_source) == null)) {
      if (this.app.project.source_list.length > 0) {
        return this.setSelectedItem(this.app.project.source_list[0].name);
      }
    }
  }

  fileDropped(file, folder) {
    var reader;
    console.info(`processing ${file.name}`);
    console.info("folder: " + folder);
    reader = new FileReader();
    reader.addEventListener("load", () => {
      var name;
      console.info("file read, size = " + reader.result.length);
      if (reader.result.length > 1000000) {
        return;
      }
      name = file.name.split(".")[0];
      name = RegexLib.fixFilename(name);
      console.info(reader.result);
      return this.createAsset(folder, name, reader.result);
    });
    return reader.readAsText(file);
  }

  createAsset(folder, name = "source", content = "") {
    var source;
    this.checkSave(true);
    if (folder != null) {
      name = folder.getFullDashPath() + `-${name}`;
      folder.setOpen(true);
    }
    source = this.app.project.createSource(name);
    source.content = content;
    name = source.name;
    return this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: `ms/${name}.ms`,
      properties: {},
      content: content
    }, (msg) => {
      console.info(msg);
      this.app.project.updateSourceList();
      return this.setSelectedItem(name);
    });
  }

  updateRunLink() {
    var element, iframe, qrcode, url;
    element = document.getElementById("run-link");
    if (this.app.project != null) {
      url = location.origin.replace(".dev", ".io") + "/";
      url += this.app.project.owner.nick + "/";
      url += this.app.project.slug + "/";
      if (!this.app.project.public) {
        url += this.app.project.code + "/";
      }
      element.innerText = url;
      element.href = url;
      element.title = url;
      iframe = document.querySelector("#device iframe");
      if (iframe != null) {
        iframe.src = url;
      }
      return qrcode = QRCode.toDataURL(url, {
        margin: 0
      }, (err, url) => {
        var img;
        if ((err == null) && (url != null)) {
          img = new Image;
          img.src = url;
          document.getElementById("qrcode-button").innerHTML = "";
          return document.getElementById("qrcode-button").appendChild(img);
        }
      });
    }
  }

  toggleLibManager(view = this.editor_view.style.display !== "none") {
    if (view) {
      this.lib_manager.style.display = "block";
      this.editor_view.style.display = "none";
      return this.lib_manager_button.classList.add("selected");
    } else {
      this.lib_manager.style.display = "none";
      this.editor_view.style.display = "block";
      return this.lib_manager_button.classList.remove("selected");
    }
  }

};
