this.PlayerClient = (function() {
  function PlayerClient(player) {
    var err;
    this.player = player;
    this.pending_requests = {};
    this.request_id = 0;
    this.version_checked = false;
    this.reconnect_delay = 1000;
    if (location.protocol.startsWith("http")) {
      try {
        this.connect();
      } catch (error) {
        err = error;
        console.error(err);
      }
      setInterval(((function(_this) {
        return function() {
          if (_this.socket != null) {
            return _this.sendRequest({
              name: "ping"
            });
          }
        };
      })(this)), 30000);
    }
  }

  PlayerClient.prototype.connect = function() {
    this.socket = new WebSocket(window.location.origin.replace("http", "ws"));
    this.socket.onmessage = (function(_this) {
      return function(msg) {
        var err;
        console.info("received: " + msg.data);
        try {
          msg = JSON.parse(msg.data);
          if (msg.request_id != null) {
            if (_this.pending_requests[msg.request_id] != null) {
              _this.pending_requests[msg.request_id](msg);
              delete _this.pending_requests[msg.request_id];
            }
          }
          if (msg.name === "project_file_updated") {
            _this.player.runtime.projectFileUpdated(msg.type, msg.file, msg.version, msg.data, msg.properties);
          }
          if (msg.name === "project_file_deleted") {
            _this.player.runtime.projectFileDeleted(msg.type, msg.file);
          }
          if (msg.name === "project_options_updated") {
            return _this.player.runtime.projectOptionsUpdated(msg);
          }
        } catch (error) {
          err = error;
          return console.error(err);
        }
      };
    })(this);
    this.socket.onopen = (function(_this) {
      return function() {
        var i, j, k, len, len1, len2, maps, project, ref, ref1, ref2, s, sources, sprites, user;
        _this.reconnect_delay = 1000;
        user = location.pathname.split("/")[1];
        project = location.pathname.split("/")[2];
        _this.send({
          name: "listen_to_project",
          user: user,
          project: project
        });
        if (!_this.version_checked) {
          _this.version_checked = true;
          sprites = {};
          maps = {};
          sources = {};
          ref = _this.player.resources.images;
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            sprites[s.file.split(".")[0]] = s.version;
          }
          ref1 = _this.player.resources.maps;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            s = ref1[j];
            maps[s.file.split(".")[0]] = s.version;
          }
          ref2 = _this.player.resources.sources;
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            s = ref2[k];
            sources[s.file.split(".")[0]] = s.version;
          }
          return _this.sendRequest({
            name: "get_file_versions",
            user: user,
            project: project
          }, function(msg) {
            var info, name, ref3, ref4, ref5, results, v;
            ref3 = msg.data.sources;
            for (name in ref3) {
              info = ref3[name];
              v = sources[name];
              if ((v == null) || v !== info.version) {
                _this.player.runtime.projectFileUpdated("ms", name, info.version, null, info.properties);
              }
            }
            ref4 = msg.data.sprites;
            for (name in ref4) {
              info = ref4[name];
              v = sprites[name];
              if ((v == null) || v !== info.version) {
                _this.player.runtime.projectFileUpdated("sprites", name, info.version, null, info.properties);
              }
            }
            ref5 = msg.data.maps;
            results = [];
            for (name in ref5) {
              info = ref5[name];
              v = maps[name];
              if ((v == null) || v !== info.version) {
                results.push(_this.player.runtime.projectFileUpdated("maps", name, info.version, null, info.properties));
              } else {
                results.push(void 0);
              }
            }
            return results;
          });
        }
      };
    })(this);
    return this.socket.onclose = (function(_this) {
      return function() {
        setTimeout((function() {
          return _this.connect();
        }), _this.reconnect_delay);
        return _this.reconnect_delay += 1000;
      };
    })(this);
  };

  PlayerClient.prototype.send = function(data) {
    return this.socket.send(JSON.stringify(data));
  };

  PlayerClient.prototype.sendRequest = function(msg, callback) {
    msg.request_id = this.request_id++;
    this.pending_requests[msg.request_id] = callback;
    return this.send(msg);
  };

  return PlayerClient;

})();
