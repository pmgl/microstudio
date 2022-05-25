this.PluginView = (function() {
  function PluginView(app, data1) {
    this.app = app;
    this.data = data1;
    this.access = new ProjectAccess(this.app, this.data.folder, this);
  }

  PluginView.prototype.createElement = function() {
    this.element = document.createElement("div");
    this.element.classList.add("plugin-view");
    this.element.style.display = "none";
    document.getElementById("section-container").appendChild(this.element);
    this.element.innerHTML = "<div class=\"plugin-view-container\"><iframe allow='autoplay;gamepad' src='" + this.data.url + "?debug'></iframe></div>";
    this.message_listener = (function(_this) {
      return function(msg) {
        if (msg.source === _this.element.querySelector("iframe").contentWindow) {
          return _this.messageReceived(JSON.parse(msg.data));
        }
      };
    })(this);
    return window.addEventListener("message", this.message_listener);
  };

  PluginView.prototype.show = function() {
    if (this.element == null) {
      this.createElement();
    }
    return this.element.style.display = "block";
  };

  PluginView.prototype.hide = function() {
    if (this.element != null) {
      return this.element.style.display = "none";
    }
  };

  PluginView.prototype.setFolder = function(folder) {
    return this.access.setFolder(folder);
  };

  PluginView.prototype.messageReceived = function(msg) {
    return this.access.messageReceived(msg);
  };

  PluginView.prototype.postMessage = function(data) {
    if (this.element != null) {
      return this.element.querySelector("iframe").contentWindow.postMessage(JSON.stringify(data), "*");
    }
  };

  PluginView.prototype.close = function() {
    if (this.message_listener != null) {
      window.removeEventListener("message", this.message_listener);
    }
    if (this.element != null) {
      return document.getElementById("section-container").removeChild(this.element);
    }
  };

  return PluginView;

})();
