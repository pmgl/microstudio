this.TabManager = (function() {
  class TabManager {
    constructor(app) {
      this.app = app;
      this.initProjectTabSelection();
      this.known_plugins = {};
      this.plugin_views = {};
    }

    projectOpened() {
      this.updateProjectTabSelection();
      return this.updatePluginSelection();
    }

    isTabActive(t) {
      var p, tabs;
      p = this.app.project;
      if (!p) {
        return false;
      }
      tabs = p.tabs || {};
      if (tabs[t] != null) {
        return tabs[t];
      } else {
        return TabManager.DEFAULT_TABS[t];
      }
    }

    setTabActive(t, active) {
      var p;
      p = this.app.project;
      if (p.tabs == null) {
        p.tabs = {};
      }
      p.tabs[t] = active;
      this.updateProjectTabs();
      return this.app.client.sendRequest({
        name: "set_project_option",
        project: this.app.project.id,
        option: "tabs",
        value: p.tabs
      }, (msg) => {});
    }

    updateProjectTabSelection() {
      var element, tab;
      for (tab in TabManager.DEFAULT_TABS) {
        element = document.getElementById(`project-option-active-tab-${tab}`);
        if (element != null) {
          element.checked = this.isTabActive(tab);
        }
      }
    }

    updateProjectTabs() {
      var element, i, id, len, list, plugins, tab, value;
      for (tab in TabManager.DEFAULT_TABS) {
        element = document.getElementById(`menuitem-${tab}`);
        if (element != null) {
          element.style.display = this.isTabActive(tab) ? "block" : "none";
        }
      }
      plugins = this.app.project.plugins || {};
      list = document.querySelectorAll(".menuitem-plugin");
      for (i = 0, len = list.length; i < len; i++) {
        element = list[i];
        id = element.id.split("-")[1] * 1;
        if (plugins[id] == null) {
          element.parentNode.removeChild(element);
          if (this.plugin_views[id] != null) {
            this.plugin_views[id].close();
            delete this.plugin_views[id];
          }
          this.app.documentation.removePlugin(id);
        }
      }
      for (id in plugins) {
        value = plugins[id];
        element = document.getElementById(`menuitem-${id}`);
        if (!element) {
          this.createPluginUI(id);
        }
      }
    }

    initProjectTabSelection() {
      var tab;
      for (tab in TabManager.DEFAULT_TABS) {
        ((tab) => {
          var element;
          element = document.getElementById(`project-option-active-tab-${tab}`);
          return element.addEventListener("change", () => {
            return this.setTabActive(tab, !this.isTabActive(tab));
          });
        })(tab);
      }
    }

    createPluginBox(project) {
      var desc, div, e, i, id, len, list, nick, path, plugins, user;
      console.info(project);
      nick = typeof project.owner === "string" ? project.owner : project.owner.nick;
      id = project.id;
      path = `/${nick}/${project.slug}`;
      if (project.code != null) {
        path += `/${project.code}`;
      }
      this.known_plugins[id] = {
        nick: nick,
        slug: project.slug,
        title: project.title,
        code: project.code,
        url: `${location.origin}${path}/`
      };
      div = document.createElement("div");
      div.classList.add("plugin-box");
      div.dataset.id = id;
      desc = project.description;
      if (desc.length > 300) {
        desc = desc.substring(0, 300) + " (...)";
      }
      div.innerHTML = `<img class="pixelated icon" src="${location.origin}${path}/sprites/icon.png"/>\n<div class="description md dark">\n  <div class="plugin-author"></div>\n  <h4>${project.title}</h4>\n  <p>${DOMPurify.sanitize(marked(desc))}</p>\n  <div class="plugin-folder">\n    <label for="plugin-folder-${id}">Working folder</label><br/>\n    <input id="plugin-folder-${id}" type="text" value="${project.slug}"></input><br/>\n    This plugin file access will be restricted to the specified folder (or to the root folder if left blank).\n  </div>\n  <i class="fa fa-check check"></i>\n</div>`;
      list = div.getElementsByTagName("a");
      for (i = 0, len = list.length; i < len; i++) {
        e = list[i];
        e.target = "_blank";
      }
      if (project.owner_info) {
        user = this.app.appui.createUserTag(nick, project.owner_info.tier, project.owner_info.profile_image, 20);
      } else if (project.owner.nick === this.app.user.nick) {
        user = this.app.appui.createUserTag(this.app.user.nick, this.app.user.flags.tier || "", this.app.user.flags.profile_image, 20);
      } else {
        user = this.app.appui.createUserTag(project.owner.nick, "", false, 20);
      }
      div.querySelector(".plugin-author").appendChild(user);
      div.id = `plugin-box-${id}`;
      plugins = this.app.project.plugins || {};
      if ((plugins[id] != null) && (plugins[id].folder != null)) {
        div.querySelector("input").value = plugins[id].folder;
      }
      div.querySelector("input").addEventListener("keydown", (event) => {
        var prop;
        if (event.key === "Enter") {
          prop = `input_validation_${id}`;
          if (this[prop]) {
            clearTimeout(this[prop]);
          }
          this.updatePluginFolder(id);
          return div.querySelector("input").blur();
        }
      });
      div.querySelector("input").addEventListener("input", () => {
        var prop;
        prop = `input_validation_${id}`;
        if (this[prop]) {
          clearTimeout(this[prop]);
        }
        return this[prop] = setTimeout((() => {
          this.updatePluginFolder(id);
          return div.querySelector("input").blur();
        }), 2000);
      });
      div.addEventListener("click", () => {
        if (div.querySelector("input") !== document.activeElement) {
          return this.togglePlugin(id);
        }
      });
      return div;
    }

    togglePlugin(id) {
      var folder;
      if (this.isPluginActive(id)) {
        return this.setPluginActive(id, false);
      } else {
        folder = RegexLib.fixFilePath(document.querySelector(`#plugin-box-${id} input`).value);
        return this.setPluginActive(id, true, folder);
      }
    }

    updatePluginFolder(id) {
      var e;
      if (this.isPluginActive(id)) {
        e = document.querySelector(`#plugin-box-${id} input`);
        e.value = RegexLib.fixFilePath(e.value);
        this.setPluginActive(id, true, e.value);
        if (this.plugin_views[id] != null) {
          return this.plugin_views[id].setFolder(e.value);
        }
      }
    }

    resetPlugins() {
      return this.plugins_fetched = false;
    }

    fetchAvailablePlugins(callback) {
      var box, i, len, p, ref, your_list, your_plugins;
      if (this.plugins_fetched) {
        return callback();
      }
      this.plugins_fetched = true;
      your_plugins = document.querySelector("#project-tabs-your-plugins");
      your_list = document.querySelector("#project-tabs-your-plugins .plugin-list");
      your_list.innerHTML = "";
      ref = this.app.projects;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (p.type === "plugin") {
          box = this.createPluginBox(p);
          your_list.appendChild(box);
        }
      }
      if (your_list.childNodes.length === 0) {
        your_plugins.style.display = "none";
      } else {
        your_plugins.style.display = "block";
      }
      return this.app.client.sendRequest({
        name: "get_public_plugins"
      }, (msg) => {
        var j, len1, public_list, public_plugins, ref1;
        console.info(msg.list);
        public_plugins = document.querySelector("#project-tabs-public-plugins");
        public_list = document.querySelector("#project-tabs-public-plugins .plugin-list");
        ref1 = msg.list;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          p = ref1[j];
          if (this.known_plugins[p.id] == null) {
            box = this.createPluginBox(p);
            public_list.appendChild(box);
          }
        }
        if (public_list.childNodes.length === 0) {
          public_plugins.style.display = "none";
        } else {
          public_plugins.style.display = "block";
        }
        return callback();
      });
    }

    updatePluginSelection() {
      return this.fetchAvailablePlugins(() => {
        var e, i, len, list, plugins;
        list = document.querySelectorAll(".plugin-box");
        plugins = this.app.project.plugins || {};
        for (i = 0, len = list.length; i < len; i++) {
          e = list[i];
          if (plugins[e.dataset.id]) {
            e.classList.add("selected");
          } else {
            e.classList.remove("selected");
          }
        }
        this.updateProjectTabs();
      });
    }

    isPluginActive(id) {
      var p, plugins;
      p = this.app.project;
      if (!p) {
        return false;
      }
      plugins = p.plugins || {};
      return plugins[id] != null;
    }

    setPluginActive(id, active, folder = "plugin") {
      var p;
      p = this.app.project;
      if (p.plugins == null) {
        p.plugins = {};
      }
      if (active) {
        p.plugins[id] = {
          folder: folder
        };
      } else {
        delete p.plugins[id];
      }
      this.updatePluginSelection();
      this.updateProjectTabs();
      return this.app.client.sendRequest({
        name: "set_project_option",
        project: this.app.project.id,
        option: "plugins",
        value: p.plugins
      }, (msg) => {});
    }

    createPluginUI(id) {
      var data, doc_url, last, li, parent, path;
      data = this.known_plugins[id];
      if (data == null) {
        return;
      }
      if (data.code != null) {
        path = `${data.nick}/${data.slug}/${data.code}`;
      } else {
        path = `${data.nick}/${data.slug}`;
      }
      li = document.createElement("li");
      li.classList.add("menuitem-plugin");
      li.id = `menuitem-${id}`;
      li.innerHTML = `<img class="pixelated" src="/${path}/sprites/icon.png" />\n<br>\n<span>${data.title}</span>`;
      parent = document.querySelector("#sidemenu ul");
      last = document.getElementById("menuitem-tabs");
      li.addEventListener("click", () => {
        return this.app.appui.setSection(id);
      });
      parent.insertBefore(li, last);
      doc_url = `${location.origin}/${path}/doc/doc.md`;
      return this.app.documentation.addPlugin(id, data.title, doc_url);
    }

    setTabView(id) {
      var data, ref, settings, view, viewid;
      ref = this.plugin_views;
      for (viewid in ref) {
        view = ref[viewid];
        if (viewid !== id) {
          view.hide();
        }
      }
      view = this.plugin_views[id];
      if (view == null) {
        data = this.known_plugins[id];
        if (data == null) {
          return;
        }
        settings = this.app.project.plugins[id];
        if (settings == null) {
          return;
        }
        data.folder = settings.folder;
        this.plugin_views[id] = view = new PluginView(this.app, data);
      }
      return view.show();
    }

    projectClosed() {
      var element, i, id, len, list, ref, view;
      ref = this.plugin_views;
      for (id in ref) {
        view = ref[id];
        view.close();
      }
      list = document.querySelectorAll(".menuitem-plugin");
      for (i = 0, len = list.length; i < len; i++) {
        element = list[i];
        element.parentNode.removeChild(element);
      }
      this.plugin_views = {};
      this.app.documentation.removeAllPlugins();
    }

  };

  TabManager.DEFAULT_TABS = {
    code: true,
    sprites: true,
    maps: true,
    sounds: true,
    music: true,
    assets: false,
    sync: false,
    doc: true,
    publish: true
  };

  return TabManager;

}).call(this);
