this.TimeMachine = (function() {
  function TimeMachine(app) {
    this.app = app;
    document.getElementById("debug-timemachine-record").addEventListener("click", (function(_this) {
      return function() {
        return _this.toggleRecording();
      };
    })(this));
    document.getElementById("debug-timemachine-step-backward").addEventListener("click", (function(_this) {
      return function() {
        return _this.stepBackward();
      };
    })(this));
    document.getElementById("debug-timemachine-step-forward").addEventListener("click", (function(_this) {
      return function() {
        return _this.stepForward();
      };
    })(this));
    document.getElementById("debug-timemachine-backward").addEventListener("mousedown", (function(_this) {
      return function() {
        return _this.startBackward();
      };
    })(this));
    document.getElementById("debug-timemachine-forward").addEventListener("mousedown", (function(_this) {
      return function() {
        return _this.startForward();
      };
    })(this));
    document.getElementById("debug-timemachine-loop").addEventListener("click", (function(_this) {
      return function() {
        return _this.toggleLoop();
      };
    })(this));
    document.addEventListener("mouseup", (function(_this) {
      return function() {
        return _this.stopAll();
      };
    })(this));
    this.backwarding = false;
    this.forwarding = false;
    this.looping = false;
    this.app.runwindow.addListener((function(_this) {
      return function(event) {
        return _this.runtimeEvent(event);
      };
    })(this));
    document.getElementById("debug-timemachine-recorder-trail").addEventListener("mousedown", (function(_this) {
      return function(event) {
        _this.dragging = true;
        return _this.cursorAction(event);
      };
    })(this));
    document.addEventListener("mousemove", (function(_this) {
      return function(event) {
        if (_this.dragging) {
          return _this.cursorAction(event);
        }
      };
    })(this));
    document.addEventListener("mouseup", (function(_this) {
      return function() {
        return _this.dragging = false;
      };
    })(this));
    this.loop_length = 60 * 4;
  }

  TimeMachine.prototype.cursorAction = function(event) {
    var b, max, max_pos, replay_pos, x;
    if (this.record_status != null) {
      b = document.getElementById("debug-timemachine-recorder-trail").getBoundingClientRect();
      x = event.clientX - b.x;
      max = this.record_status.max + this.loop_length;
      max_pos = this.record_status.length / max * 160;
      replay_pos = (max_pos - x) / 160 * this.record_status.max;
      console.log(this.record_status);
      if (!this.app.runwindow.isPaused()) {
        this.app.runwindow.pause();
      }
      return this.app.runwindow.postMessage({
        name: "time_machine",
        command: "replay_position",
        position: replay_pos
      });
    }
  };

  TimeMachine.prototype.toggleRecording = function() {
    if (this.recording) {
      return this.stopRecording();
    } else {
      return this.startRecording();
    }
  };

  TimeMachine.prototype.startRecording = function() {
    this.stopLooping();
    this.app.runwindow.play();
    this.recording = true;
    this.app.runwindow.postMessage({
      name: "time_machine",
      command: "start_recording"
    });
    return document.getElementById("debug-timemachine-record").classList.add("recording");
  };

  TimeMachine.prototype.stopRecording = function() {
    this.recording = false;
    this.app.runwindow.postMessage({
      name: "time_machine",
      command: "stop_recording"
    });
    return document.getElementById("debug-timemachine-record").classList.remove("recording");
  };

  TimeMachine.prototype.toggleLoop = function() {
    if (!this.looping) {
      return this.startLooping();
    } else {
      return this.stopLooping();
    }
  };

  TimeMachine.prototype.startLooping = function() {
    if (!this.app.runwindow.isPaused()) {
      this.app.runwindow.pause();
    }
    this.stopRecording();
    this.looping = true;
    this.app.runwindow.postMessage({
      name: "time_machine",
      command: "start_looping"
    });
    return document.getElementById("debug-timemachine-loop").classList.add("looping");
  };

  TimeMachine.prototype.stopLooping = function() {
    if (this.looping) {
      this.looping = false;
      this.app.runwindow.postMessage({
        name: "time_machine",
        command: "stop_looping"
      });
      return document.getElementById("debug-timemachine-loop").classList.remove("looping");
    }
  };

  TimeMachine.prototype.stepBackward = function() {
    this.stopLooping();
    if (!this.app.runwindow.isPaused()) {
      this.app.runwindow.pause();
    }
    return this.app.runwindow.postMessage({
      name: "time_machine",
      command: "step_backward"
    });
  };

  TimeMachine.prototype.stepForward = function() {
    this.stopLooping();
    if (!this.app.runwindow.isPaused()) {
      this.app.runwindow.pause();
    }
    return this.app.runwindow.postMessage({
      name: "time_machine",
      command: "step_forward"
    });
  };

  TimeMachine.prototype.startBackward = function() {
    this.stopLooping();
    if (!this.app.runwindow.isPaused()) {
      this.app.runwindow.pause();
    }
    this.backwarding = true;
    return requestAnimationFrame((function(_this) {
      return function() {
        return _this.backward();
      };
    })(this));
  };

  TimeMachine.prototype.startForward = function() {
    this.stopLooping();
    if (!this.app.runwindow.isPaused()) {
      this.app.runwindow.pause();
    }
    this.forwarding = true;
    return requestAnimationFrame((function(_this) {
      return function() {
        return _this.forward();
      };
    })(this));
  };

  TimeMachine.prototype.backward = function() {
    if (!this.backwarding) {
      return;
    }
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.backward();
      };
    })(this));
    return this.app.runwindow.postMessage({
      name: "time_machine",
      command: "step_backward"
    });
  };

  TimeMachine.prototype.forward = function() {
    if (!this.forwarding) {
      return;
    }
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.forward();
      };
    })(this));
    return this.app.runwindow.postMessage({
      name: "time_machine",
      command: "step_forward"
    });
  };

  TimeMachine.prototype.stopAll = function() {
    this.backwarding = false;
    return this.forwarding = false;
  };

  TimeMachine.prototype.messageReceived = function(msg) {
    var head, length, max;
    switch (msg.command) {
      case "status":
        length = msg.length;
        head = msg.head;
        max = msg.max;
        this.setPosition(length, head, max);
        return this.record_status = msg;
    }
  };

  TimeMachine.prototype.setPosition = function(length, head, max) {
    var percent;
    max += this.loop_length;
    percent = 100 * length / max;
    document.getElementById("debug-timemachine-recorder-trail").style.background = "linear-gradient(90deg, hsl(180,100%,20%) 0%, hsl(180,100%,10%) " + percent + "%,rgba(0,0,0,.1) " + percent + "%,rgba(0,0,0,.1) 100%)";
    document.getElementById("debug-timemachine-recorder-head").style.left = (head / max * 160 - 5) + "px";
    if (this.recording && !this.app.runwindow.isPaused()) {
      return document.getElementById("debug-timemachine-recorder-head").style.transform = "scale(" + (1 + Math.sin(Date.now() / 200) * .1) + ",1)";
    } else {
      return document.getElementById("debug-timemachine-recorder-head").style.transform = "scale(1,1)";
    }
  };

  TimeMachine.prototype.reset = function() {
    this.stopLooping();
    return setTimeout(((function(_this) {
      return function() {
        return _this.setPosition(0, 0, 1000);
      };
    })(this)), 16);
  };

  TimeMachine.prototype.closed = function() {
    this.reset();
    this.stopRecording();
    return this.stopAll();
  };

  TimeMachine.prototype.runtimeEvent = function(event) {
    switch (event) {
      case "play":
      case "reload":
        return this.reset();
      case "resume":
        return this.stopLooping();
      case "started":
        if (this.recording) {
          return this.startRecording();
        }
        break;
      case "exit":
        return this.reset();
    }
  };

  return TimeMachine;

})();
