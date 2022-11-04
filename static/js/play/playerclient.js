this.PlayerClient = class PlayerClient {
  constructor(player) {
    var err;
    this.player = player;
    this.pending_requests = {};
    this.request_id = 0;
    this.version_checked = false;
    this.reconnect_delay = 1000;
    if (location.protocol.startsWith("http") && !window.exported_project) {
      try {
        this.connect();
      } catch (error) {
        err = error;
        console.error(err);
      }
      setInterval((() => {
        if (this.socket != null) {
          return this.sendRequest({
            name: "ping"
          });
        }
      }), 30000);
    }
  }

  connect() {
    this.socket = new WebSocket(window.location.origin.replace("http", "ws"));
    this.socket.onmessage = (msg) => {
      var err;
      console.info("received: " + msg.data);
      try {
        msg = JSON.parse(msg.data);
        if (msg.request_id != null) {
          if (this.pending_requests[msg.request_id] != null) {
            this.pending_requests[msg.request_id](msg);
            delete this.pending_requests[msg.request_id];
          }
        }
        //if msg.name == "code_updated"
        //  @player.runtime.updateSource(msg.file,msg.code,true)

        //if msg.name == "sprite_updated"
        //  @player.runtime.updateSprite(msg.sprite)
        if (msg.name === "project_file_updated") {
          this.player.runtime.projectFileUpdated(msg.type, msg.file, msg.version, msg.data, msg.properties);
        }
        if (msg.name === "project_file_deleted") {
          this.player.runtime.projectFileDeleted(msg.type, msg.file);
        }
        if (msg.name === "project_options_updated") {
          return this.player.runtime.projectOptionsUpdated(msg);
        }
      } catch (error) {
        err = error;
        return console.error(err);
      }
    };
    this.socket.onopen = () => {
      var i, j, k, l, len, len1, len2, len3, m, maps, project, ref, ref1, ref2, ref3, s, sources, sprites, user;
      //console.info "socket opened"
      this.reconnect_delay = 1000;
      user = location.pathname.split("/")[1];
      project = location.pathname.split("/")[2];
      if (this.buffer != null) {
        ref = this.buffer;
        for (i = 0, len = ref.length; i < len; i++) {
          m = ref[i];
          this.send(m);
        }
        delete this.buffer;
      }
      this.send({
        name: "listen_to_project",
        user: user,
        project: project
      });
      if (!this.version_checked) {
        this.version_checked = true;
        sprites = {};
        maps = {};
        sources = {};
        ref1 = this.player.resources.images;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          s = ref1[j];
          sprites[s.file.split(".")[0]] = s.version;
        }
        ref2 = this.player.resources.maps;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          s = ref2[k];
          maps[s.file.split(".")[0]] = s.version;
        }
        ref3 = this.player.resources.sources;
        for (l = 0, len3 = ref3.length; l < len3; l++) {
          s = ref3[l];
          sources[s.file.split(".")[0]] = s.version;
        }
        return this.sendRequest({
          name: "get_file_versions",
          user: user,
          project: project
        }, (msg) => {
          var info, name, ref4, ref5, ref6, results, v;
          ref4 = msg.data.sources;
          for (name in ref4) {
            info = ref4[name];
            v = sources[name];
            if ((v == null) || v !== info.version) {
              //console.info "updating #{name} to version #{version}"
              this.player.runtime.projectFileUpdated("ms", name, info.version, null, info.properties);
            }
          }
          ref5 = msg.data.sprites;
          for (name in ref5) {
            info = ref5[name];
            v = sprites[name];
            if ((v == null) || v !== info.version) {
              //console.info "updating #{name} to version #{version}"
              this.player.runtime.projectFileUpdated("sprites", name, info.version, null, info.properties);
            }
          }
          ref6 = msg.data.maps;
          results = [];
          for (name in ref6) {
            info = ref6[name];
            v = maps[name];
            if ((v == null) || v !== info.version) {
              //console.info "updating #{name} to version #{version}"
              results.push(this.player.runtime.projectFileUpdated("maps", name, info.version, null, info.properties));
            } else {
              results.push(void 0);
            }
          }
          return results;
        });
      }
    };
    return this.socket.onclose = () => {
      //console.info "socket closed"
      setTimeout((() => {
        return this.connect();
      }), this.reconnect_delay);
      return this.reconnect_delay += 1000;
    };
  }

  send(data) {
    if (this.socket.readyState !== 1) {
      if (this.buffer == null) {
        this.buffer = [];
      }
      return this.buffer.push(data);
    } else {
      return this.socket.send(JSON.stringify(data));
    }
  }

  sendRequest(msg, callback) {
    msg.request_id = this.request_id++;
    this.pending_requests[msg.request_id] = callback;
    return this.send(msg);
  }

};
