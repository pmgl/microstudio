this.Synth = (function() {
  function Synth(app) {
    var f, i, j, k, knobs, l, len, len1, len2, len3, len4, m, n, o, q, r, ref, ref1, ref2, s, sliders, u;
    this.app = app;
    this.synth_window = new FloatingWindow(this.app, "synth-window", this, {
      fixed_size: true
    });
    this.knobs = [];
    this.sliders = [];
    knobs = document.getElementsByClassName("knob");
    for (l = 0, len = knobs.length; l < len; l++) {
      k = knobs[l];
      this.knobs.push(new Knob(k, null, this));
    }
    sliders = document.getElementsByClassName("synth-slider");
    for (m = 0, len1 = sliders.length; m < len1; m++) {
      s = sliders[m];
      this.sliders.push(new Slider(s, null, this));
    }
    this.waveforms = ["saw", "square", "sine"];
    for (i = n = 1; n <= 2; i = ++n) {
      ref = this.waveforms;
      for (o = 0, len2 = ref.length; o < len2; o++) {
        j = ref[o];
        new WaveFormButton("osc" + i, j, this);
      }
    }
    this.filtertypes = ["lowpass", "bandpass", "highpass"];
    ref1 = this.filtertypes;
    for (q = 0, len3 = ref1.length; q < len3; q++) {
      f = ref1[q];
      new FilterTypeButton(f, this);
    }
    this.polyphony = ["poly", "mono"];
    new PolyphonyButton("poly", this);
    new PolyphonyButton("mono", this);
    new FilterSlopeButton(this);
    this.sync_button = new TextToggleButton("sync", "SYNC", (function(_this) {
      return function(s) {
        return _this.syncChanged(s);
      };
    })(this));
    this.lfo1_audio = new TextToggleButton("lfo1-audio", "AUDIO", (function(_this) {
      return function(s) {
        return _this.lfoAudioChanged("lfo1", s);
      };
    })(this));
    this.lfo2_audio = new TextToggleButton("lfo2-audio", "AUDIO", (function(_this) {
      return function(s) {
        return _this.lfoAudioChanged("lfo2", s);
      };
    })(this));
    this.lfowaveforms = ["saw", "square", "sine", "triangle", "random", "randomstep", "invsaw"];
    for (i = r = 1; r <= 2; i = ++r) {
      ref2 = this.lfowaveforms;
      for (u = 0, len4 = ref2.length; u < len4; u++) {
        j = ref2[u];
        new WaveFormButton("lfo" + i, j, this);
      }
    }
    this.keyboard = new SynthKeyboard(document.getElementById("synth-keyboard"), 5, {
      noteOn: function() {},
      noteOff: function() {}
    });
    this.mod_wheel = new SynthWheel(document.getElementById("synth-modwheel"));
    this.pitch_wheel = new SynthWheel(document.getElementById("synth-pitchwheel"));
    this.velocity_outputs = ["OFF", "Mod", "Cutoff", "Resonance", "Osc1 Mod", "Osc1 Amp", "Osc2 Mod", "Osc2 Amp", "Noise Amp", "Noise Color", "Env1 Attack", "Env2 Attack", "Env2 Amt", "LFO1 Amt", "LFO1 Rate", "LFO2 Amt", "LFO2 Rate"];
    this.modulation_outputs = ["OFF", "Amp", "Mod", "Osc1 Amp", "Osc1 Mod", "Osc2 Amp", "Osc2 Mod", "Noise Amp", "Noise Color", "Cutoff", "Resonance", "LFO 1 Amt", "LFO 1 Rate", "LFO 2 Amt", "LFO 2 Rate"];
    this.lfo1_outputs = ["OFF", "Pitch", "Mod", "Amp", "Osc1 Pitch", "Osc1 Mod", "Osc1 Amp", "Osc2 Pitch", "Osc2 Mod", "Osc2 Amp", "Noise Amp", "Noise Color", "Cutoff", "Resonance", "LFO 2 Amt", "LFO 2 Rate"];
    this.lfo2_outputs = ["OFF", "Pitch", "Mod", "Amp", "Osc1 Pitch", "Osc1 Mod", "Osc1 Amp", "Osc2 Pitch", "Osc2 Mod", "Osc2 Amp", "Noise Amp", "Noise Color", "Cutoff", "Resonance"];
    this.env2_outputs = ["OFF", "Cutoff", "Resonance", "Pitch", "Mod", "Amp", "Osc1 Pitch", "Osc1 Mod", "Osc1 Amp", "Osc2 Pitch", "Osc2 Mod", "Osc2 Amp", "Noise Amp", "Noise Color", "LFO1 Amt", "LFO1 Rate", "LFO2 Amt", "LFO2 Rate"];
    this.fx1_types = ["None", "Distortion", "Bit Crusher", "Chorus", "Flanger", "Phaser", "Delay"];
    this.fx2_types = ["None", "Delay", "Reverb", "Chorus", "Flanger", "Phaser"];
    new SynthSelector("lfo1-out", this.lfo1_outputs, (function(_this) {
      return function(index) {
        return _this.app.audio_controller.sendParam("lfo1.out", index - 1);
      };
    })(this));
    new SynthSelector("lfo2-out", this.lfo2_outputs, (function(_this) {
      return function(index) {
        return _this.app.audio_controller.sendParam("lfo2.out", index - 1);
      };
    })(this));
    new SynthSelector("env2-out", this.env2_outputs, (function(_this) {
      return function(index) {
        return _this.app.audio_controller.sendParam("env2.out", index - 1);
      };
    })(this));
    new SynthSelector("velocity-out", this.velocity_outputs, (function(_this) {
      return function(index) {
        return _this.app.audio_controller.sendParam("velocity.out", index - 1);
      };
    })(this));
    new SynthSelector("modulation-out", this.modulation_outputs, (function(_this) {
      return function(index) {
        return _this.app.audio_controller.sendParam("modulation.out", index - 1);
      };
    })(this));
    new SynthSelector("fx1-type", this.fx1_types, (function(_this) {
      return function(index) {
        return _this.app.audio_controller.sendParam("fx1.type", index - 1);
      };
    })(this));
    new SynthSelector("fx2-type", this.fx2_types, (function(_this) {
      return function(index) {
        return _this.app.audio_controller.sendParam("fx2.type", index - 1);
      };
    })(this));
    this.combine_modes = ["+", "×", "~"];
    this.combine = 0;
    document.getElementById("combine-button").addEventListener("click", (function(_this) {
      return function() {
        _this.combine = (_this.combine + 1) % _this.combine_modes.length;
        document.getElementById("combine-button").innerText = _this.combine_modes[_this.combine];
        return _this.app.audio_controller.sendParam("combine", _this.combine);
      };
    })(this));
  }

  Synth.prototype.knobChange = function(id, value) {
    return this.app.audio_controller.sendParam(id.replace("-", "."), value);
  };

  Synth.prototype.waveFormChange = function(osc, form) {
    var c, f, l, len, wf;
    wf = osc.startsWith("lfo") ? this.lfowaveforms : this.waveforms;
    for (l = 0, len = wf.length; l < len; l++) {
      f = wf[l];
      c = document.getElementById(osc + "-" + f);
      if (f === form) {
        c.classList.add("selected");
      } else {
        c.classList.remove("selected");
      }
    }
    return this.app.audio_controller.sendParam(osc + ".type", wf.indexOf(form));
  };

  Synth.prototype.filterTypeChange = function(type) {
    var c, l, len, ref, t;
    ref = this.filtertypes;
    for (l = 0, len = ref.length; l < len; l++) {
      t = ref[l];
      c = document.getElementById("filter-" + t);
      if (t === type) {
        c.classList.add("selected");
      } else {
        c.classList.remove("selected");
      }
    }
    return this.app.audio_controller.sendParam("filter.type", this.filtertypes.indexOf(type));
  };

  Synth.prototype.polyphonyTypeChange = function(poly) {
    var c, l, len, p, ref;
    ref = this.polyphony;
    for (l = 0, len = ref.length; l < len; l++) {
      p = ref[l];
      c = document.getElementById("polyphony-" + p);
      if (p === poly) {
        c.classList.add("selected");
      } else {
        c.classList.remove("selected");
      }
    }
    return this.app.audio_controller.sendParam("polyphony", this.polyphony.indexOf(poly));
  };

  Synth.prototype.filterSlopeChanged = function(selected) {
    document.getElementById("filter-slope").classList[selected ? "add" : "remove"]("selected");
    return this.app.audio_controller.sendParam("filter.slope", selected ? 1 : 0);
  };

  Synth.prototype.syncChanged = function(selected) {
    document.getElementById("sync").classList[selected ? "add" : "remove"]("selected");
    return this.app.audio_controller.sendParam("sync", selected ? 1 : 0);
  };

  Synth.prototype.lfoAudioChanged = function(lfo, selected) {
    document.getElementById(lfo + "-audio").classList[selected ? "add" : "remove"]("selected");
    return this.app.audio_controller.sendParam(lfo + ".audio", selected ? 1 : 0);
  };

  return Synth;

})();

this.WaveFormButton = (function() {
  function WaveFormButton(osc1, form1, listener) {
    this.osc = osc1;
    this.form = form1;
    this.listener = listener;
    this.canvas = document.getElementById(this.osc + "-" + this.form);
    this.canvas.width = 30;
    this.canvas.height = 15;
    this.update();
    this.canvas.addEventListener("click", (function(_this) {
      return function() {
        return _this.listener.waveFormChange(_this.osc, _this.form);
      };
    })(this));
  }

  WaveFormButton.prototype.update = function() {
    var a, context, h, i, l, level, m, margin, n, random, w, wmargin, ww;
    w = this.canvas.width;
    h = this.canvas.height;
    margin = 3;
    wmargin = 6;
    context = this.canvas.getContext("2d");
    context.beginPath();
    context.strokeStyle = "#000";
    context.lineWidth = 1;
    switch (this.form) {
      case "saw":
        context.moveTo(wmargin, h - margin);
        context.lineTo(wmargin, margin);
        context.lineTo(w - wmargin, h - margin);
        context.lineTo(w - wmargin, margin);
        break;
      case "square":
        context.moveTo(wmargin, h - margin);
        context.lineTo(wmargin, margin);
        context.lineTo(w / 2, margin);
        context.lineTo(w / 2, h - margin);
        context.lineTo(w - wmargin, h - margin);
        context.lineTo(w - wmargin, margin);
        break;
      case "sine":
        context.moveTo(wmargin, h / 2);
        for (i = l = 0; l <= 40; i = l += 1) {
          a = i / 40 * Math.PI * 2;
          context.lineTo(wmargin + (w - 2 * wmargin) * i / 40, h / 2 + (h / 2 - margin) * Math.sin(a));
        }
        break;
      case "triangle":
        ww = w - 2 * wmargin;
        context.moveTo(wmargin, h / 2);
        context.lineTo(w / 2 - ww / 4, margin);
        context.lineTo(w / 2 + ww / 4, h - margin);
        context.lineTo(w - wmargin, h / 2);
        break;
      case "random":
        random = new Random(1);
        context.moveTo(wmargin, h / 2);
        for (i = m = 0; m <= 20; i = m += 1) {
          context.lineTo(wmargin + (w - 2 * wmargin) * i / 20, h / 2 + (h / 2 - margin) * (random.next() * 2 - 1));
        }
        break;
      case "randomstep":
        random = new Random(1);
        context.moveTo(wmargin, h / 2);
        level = 0;
        for (i = n = 0; n <= 5; i = n += 1) {
          context.lineTo(wmargin + (w - 2 * wmargin) * i / 5, h / 2 + (h / 2 - margin) * level);
          level = random.next() * 2 - 1;
          context.lineTo(wmargin + (w - 2 * wmargin) * i / 5, h / 2 + (h / 2 - margin) * level);
        }
    }
    return context.stroke();
  };

  return WaveFormButton;

})();

this.FilterTypeButton = (function() {
  function FilterTypeButton(type1, listener) {
    this.type = type1;
    this.listener = listener;
    this.canvas = document.getElementById("filter-" + this.type);
    this.canvas.width = 30;
    this.canvas.height = 15;
    this.update();
    this.canvas.addEventListener("click", (function(_this) {
      return function() {
        return _this.listener.filterTypeChange(_this.type);
      };
    })(this));
  }

  FilterTypeButton.prototype.update = function() {
    var context, h, margin, w, wmargin;
    w = this.canvas.width;
    h = this.canvas.height;
    margin = 3;
    wmargin = 6;
    context = this.canvas.getContext("2d");
    context.fillStyle = "#000";
    context.font = "7pt Ubuntu";
    context.textAlign = "center";
    context.textBaseline = "middle";
    return context.fillText(this.type.substring(0, this.type.indexOf("pass")).toUpperCase(), w / 2, h / 2);
  };

  return FilterTypeButton;

})();

this.PolyphonyButton = (function() {
  function PolyphonyButton(type1, listener) {
    this.type = type1;
    this.listener = listener;
    this.canvas = document.getElementById("polyphony-" + this.type);
    this.canvas.width = 30;
    this.canvas.height = 15;
    this.update();
    this.canvas.addEventListener("click", (function(_this) {
      return function() {
        return _this.listener.polyphonyTypeChange(_this.type);
      };
    })(this));
  }

  PolyphonyButton.prototype.update = function() {
    var context, h, margin, w, wmargin;
    w = this.canvas.width;
    h = this.canvas.height;
    margin = 3;
    wmargin = 6;
    context = this.canvas.getContext("2d");
    context.fillStyle = "#000";
    context.font = "7pt Ubuntu";
    context.textAlign = "center";
    context.textBaseline = "middle";
    return context.fillText(this.type.toUpperCase(), w / 2, h / 2);
  };

  return PolyphonyButton;

})();

this.FilterSlopeButton = (function() {
  function FilterSlopeButton(listener) {
    this.listener = listener;
    this.canvas = document.getElementById("filter-slope");
    this.canvas.width = 30;
    this.canvas.height = 15;
    this.update();
    this.selected = true;
    this.canvas.addEventListener("click", (function(_this) {
      return function() {
        _this.selected = !_this.selected;
        return _this.listener.filterSlopeChanged(_this.selected);
      };
    })(this));
  }

  FilterSlopeButton.prototype.update = function() {
    var context, h, margin, w, wmargin;
    w = this.canvas.width;
    h = this.canvas.height;
    margin = 3;
    wmargin = 6;
    context = this.canvas.getContext("2d");
    context.fillStyle = "#000";
    context.font = "7pt Ubuntu";
    context.textAlign = "center";
    context.textBaseline = "middle";
    return context.fillText("24 dB", w / 2, h / 2);
  };

  return FilterSlopeButton;

})();

this.TextToggleButton = (function() {
  function TextToggleButton(id1, text, callback) {
    this.id = id1;
    this.text = text;
    this.callback = callback;
    this.canvas = document.getElementById(this.id);
    this.canvas.width = 30;
    this.canvas.height = 15;
    this.update();
    this.selected = true;
    this.canvas.addEventListener("click", (function(_this) {
      return function() {
        _this.selected = !_this.selected;
        return _this.callback(_this.selected);
      };
    })(this));
  }

  TextToggleButton.prototype.update = function() {
    var context, h, margin, w, wmargin;
    w = this.canvas.width;
    h = this.canvas.height;
    margin = 3;
    wmargin = 6;
    context = this.canvas.getContext("2d");
    context.fillStyle = "#000";
    context.font = "7pt Ubuntu";
    context.textAlign = "center";
    context.textBaseline = "middle";
    return context.fillText(this.text, w / 2, h / 2);
  };

  return TextToggleButton;

})();

this.SynthSelector = (function() {
  function SynthSelector(id1, values, callback) {
    this.id = id1;
    this.values = values;
    this.callback = callback;
    this.element = document.getElementById(this.id);
    this.previous = document.querySelector("#" + this.id + " .fa-caret-left");
    this.next = document.querySelector("#" + this.id + " .fa-caret-right");
    this.screen = document.querySelector("#" + this.id + " .screen");
    this.previous.addEventListener("click", (function(_this) {
      return function() {
        return _this.doPrevious();
      };
    })(this));
    this.next.addEventListener("click", (function(_this) {
      return function() {
        return _this.doNext();
      };
    })(this));
    this.setIndex(0);
  }

  SynthSelector.prototype.setIndex = function(index1) {
    this.index = index1;
    return this.screen.innerText = this.values[this.index];
  };

  SynthSelector.prototype.doPrevious = function() {
    this.setIndex((this.index - 1 + this.values.length) % this.values.length);
    return this.callback(this.index);
  };

  SynthSelector.prototype.doNext = function() {
    this.setIndex((this.index + 1) % this.values.length);
    return this.callback(this.index);
  };

  return SynthSelector;

})();
