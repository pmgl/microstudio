this.TimeMachine = class TimeMachine {
  constructor(runtime) {
    this.runtime = runtime;
    this.history = [];
    this.record_index = 0;
    this.replay_position = 0;
    this.recording = false;
    this.max_length = 60 * 30;
    this.record_length = 0;
    this.loop_length = 60 * 4;
  }

  step() {
    var end, err, histo, i, index, j, ref, ref1, start;
    if (this.recording) {
      try {
        if (this.replay_position !== 0) {
          histo = [];
          start = this.record_length;
          end = this.replay_position + 1;
          for (i = j = ref = start, ref1 = end; j >= ref1; i = j += -1) {
            index = (this.record_index - i + this.max_length) % this.max_length;
            histo.push(this.history[index]);
          }
          if (this.looping) {
            this.loop_start = this.loop_length;
          }
          this.history = histo;
          this.record_index = this.history.length;
          this.record_length = this.history.length;
          this.replay_position = 0;
        }
        this.history[this.record_index++] = this.storableHistory(this.runtime.vm.context.global);
        this.record_length = Math.min(this.record_length + 1, this.max_length);
        if (this.record_index >= this.max_length) {
          this.record_index = 0;
        }
        return this.sendStatus();
      } catch (error) {
        err = error;
        return console.error(err);
      }
    }
  }

  messageReceived(data) {
    var pos;
    switch (data.command) {
      case "start_recording":
        if (!this.recording) {
          this.recording = true;
          this.record_index = 0;
          this.replay_position = 0;
          this.record_length = 0;
          this.history = [];
          return this.sendStatus();
        }
        break;
      case "stop_recording":
        if (this.recording) {
          this.recording = false;
          return this.sendStatus();
        }
        break;
      case "step_backward":
        return this.stepBackward();
      case "step_forward":
        return this.stepForward();
      case "replay_position":
        pos = Math.round(data.position);
        this.replay_position = Math.max(2, Math.min(this.record_length - 1, pos));
        if (this.looping) {
          this.loop_start = this.replay_position;
          this.loop_index = 0;
        }
        this.replay();
        return this.sendStatus();
      case "start_looping":
        if (this.record_length === 0) {
          return;
        }
        this.looping = true;
        this.recording = false;
        this.loop_start = Math.max(this.replay_position, 1);
        this.loop_index = 0;
        return this.loop();
      case "stop_looping":
        return this.stopLooping();
    }
  }

  stopLooping() {
    if (this.looping) {
      this.looping = false;
      this.replay_position = this.loop_start;
      return this.sendStatus();
    }
  }

  loop() {
    if (!this.looping) {
      return;
    }
    requestAnimationFrame(() => {
      return this.loop();
    });
    if (this.loop_index === 0) {
      this.replay_position = this.loop_start;
      this.replay(true);
      this.loop_index += 1;
    } else {
      this.loop_index += 1;
      if (this.loop_index > this.loop_length) {
        this.loop_index = 0;
      }
      this.replay_position = this.loop_start - this.loop_index;
      this.replayControls();
      this.runtime.updateCall();
      this.runtime.drawCall();
      this.runtime.watchStep();
      this.resetControls();
    }
    return this.sendStatus();
  }

  stepBackward() {
    if (this.replay_position + 1 >= this.record_length) {
      return;
    }
    this.stopLooping();
    this.replay_position += 1;
    this.replay();
    return this.sendStatus();
  }

  stepForward() {
    if (this.replay_position <= 1) {
      return;
    }
    this.stopLooping();
    this.replay_position--;
    this.replay();
    return this.sendStatus();
  }

  replayControls() {
    var index;
    if (this.replay_position >= this.record_length) {
      return;
    }
    if (this.replay_position <= 0) {
      return;
    }
    index = (this.record_index - this.replay_position + this.max_length) % this.max_length;
    this.copyGlobal(this.history[index].keyboard, this.runtime.vm.context.global.keyboard);
    this.copyGlobal(this.history[index].gamepad, this.runtime.vm.context.global.gamepad);
    this.copyGlobal(this.history[index].touch, this.runtime.vm.context.global.touch);
    return this.copyGlobal(this.history[index].mouse, this.runtime.vm.context.global.mouse);
  }

  resetControls() {
    var mouse, touch;
    this.runtime.keyboard.reset();
    touch = this.runtime.vm.context.global.touch;
    touch.touching = 0;
    touch.touches = [];
    mouse = this.runtime.vm.context.global.mouse;
    mouse.pressed = 0;
    mouse.left = 0;
    mouse.right = 0;
    return mouse.middle = 0;
  }

  replay(clone = false) {
    var index;
    index = (this.record_index - this.replay_position + this.max_length) % this.max_length;
    this.copyGlobal((clone ? this.storableHistory(this.history[index]) : this.history[index]), this.runtime.vm.context.global);
    //@runtime.vm.context.global = if clone then @storableHistory(@history[index]) else @history[index]
    //@runtime.vm.context.meta.global = @runtime.vm.context.global
    //@runtime.vm.context.object = @runtime.vm.context.global
    //@runtime.vm.context.local = @runtime.vm.context.global
    this.runtime.vm.call("draw");
    if (this.runtime.vm.runner.tick != null) {
      this.runtime.vm.runner.tick();
    }
    return this.runtime.watchStep();
  }

  copyGlobal(source, dest) {
    var key, value;
    for (key in source) {
      value = source[key];
      if (key === "keyboard" || key === "gamepad" || key === "touch" || key === "mouse") {
        continue;
      }
      if (((typeof Routine === "undefined" || Routine === null) || !(value instanceof Routine)) && !(value instanceof Program.Function) && typeof value !== "function" && (value.classname == null)) {
        dest[key] = value;
      }
    }
    for (key in dest) {
      if (source[key] == null) {
        delete dest[key];
      }
    }
  }

  sendStatus() {
    return this.runtime.listener.postMessage({
      name: "time_machine",
      command: "status",
      length: this.record_length,
      head: this.record_length - this.replay_position,
      max: this.max_length
    });
  }

  storableHistory(value) {
    var clones, global, refs;
    global = this.runtime.vm.context.global;
    this.excluded = [
      global.screen,
      global.system,
      //global.keyboard
      global.audio,
      //global.gamepad
      //global.touch
      //global.mouse
      global.sprites,
      global.maps,
      global.sounds,
      global.music,
      global.assets,
      global.asset_manager,
      global.fonts,
      global.storage,
      window
    ];
    if (global.PIXI != null) {
      // for key,value of window
      //   @excluded.push value
      this.excluded.push(global.PIXI);
    }
    if (global.BABYLON != null) {
      this.excluded.push(global.BABYLON);
    }
    if (global.M2D != null) {
      this.excluded.push(global.M2D);
    }
    if (global.M3D != null) {
      this.excluded.push(global.M3D);
    }
    if (global.Matter != null) {
      this.excluded.push(global.Matter);
    }
    if (global.CANNON != null) {
      this.excluded.push(global.CANNON);
    }
    if (global.Object != null) {
      this.excluded.push(global.Object);
    }
    if (global.List != null) {
      this.excluded.push(global.List);
    }
    if (global.String != null) {
      this.excluded.push(global.String);
    }
    if (global.Number != null) {
      this.excluded.push(global.Number);
    }
    if (global.Function != null) {
      this.excluded.push(global.Function);
    }
    if (global.random != null) {
      this.excluded.push(global.random);
    }
    refs = [];
    clones = [];
    return this.makeStorableObject(value, refs, clones);
  }

  makeStorableObject(value, refs, clones) {
    var i, index, j, key, len, res, v;
    if (value == null) {
      return value;
    }
    if (typeof value === "function" || value instanceof Program.Function || (typeof Routine !== "undefined" && Routine !== null) && value instanceof Routine) {
      return value;
    } else if (typeof value === "object") {
      if (this.excluded.indexOf(value) >= 0) {
        return value;
      }
      if (value instanceof Sprite || value instanceof MicroMap || value instanceof msImage || value instanceof MicroSound) {
        return value;
      }
      if (value.classname != null) {
        return value;
      }
      index = refs.indexOf(value);
      if (index >= 0) {
        return clones[index];
      }
      if (Array.isArray(value)) {
        res = [];
        refs.push(value);
        clones.push(res);
        for (i = j = 0, len = value.length; j < len; i = ++j) {
          v = value[i];
          v = this.makeStorableObject(v, refs, clones);
          if (v != null) {
            res[i] = v;
          }
        }
        return res;
      } else {
        res = {};
        refs.push(value);
        clones.push(res);
        for (key in value) {
          v = value[key];
          v = this.makeStorableObject(v, refs, clones);
          if (v != null) {
            res[key] = v;
          }
        }
        return res;
      }
    } else {
      return value;
    }
  }

};
