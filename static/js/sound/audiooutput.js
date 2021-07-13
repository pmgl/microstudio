this.AudioOutput = (function() {
  function AudioOutput() {}

  AudioOutput.prototype.start = function() {
    var url;
    this.context = new (window.AudioContext || window.webkitAudioContext);
    if (this.context.audioWorklet != null) {
      url = "synth/audioengine.js";
      this.context.audioWorklet.addModule(url).then((function(_this) {
        return function() {
          _this.node = new AudioWorkletNode(_this.context, "my-worklet-processor", {
            outputChannelCount: [2]
          });
          return _this.node.connect(_this.context.destination);
        };
      })(this));
    }
    this.addParam("Osc1 coarse", "osc1_coarse");
    this.addParam("Osc1 tune", "osc1_tune");
    this.addParam("Osc1 amp", "osc1_amp");
    this.addParam("Osc1 mod", "osc1_mod");
    this.addParam("Osc2 coarse", "osc2_coarse");
    this.addParam("Osc2 tune", "osc2_tune");
    this.addParam("Osc2 amp", "osc2_amp");
    this.addParam("Osc2 mod", "osc2_mod");
    this.addParam("Noise", "noise");
    this.addParam("Noise mod", "noise_mod");
    this.addParam("Env1 A", "env1.a");
    this.addParam("Env1 D", "env1.d");
    this.addParam("Env1 S", "env1.s");
    this.addParam("Env1 R", "env1.r");
    this.addParam("Slope", "filter_slope");
    this.addParam("Type", "filter_type");
    this.addParam("Cutoff", "filter_cutoff");
    this.addParam("Resonance", "filter_resonance");
    this.addParam("Env", "filter_env_amount");
    this.addParam("Env2 A", "env2.a");
    this.addParam("Env2 D", "env2.d");
    this.addParam("Env2 S", "env2.s");
    this.addParam("Env2 R", "env2.r");
    this.addParam("LFO1 form", "lfo1.form");
    this.addParam("LFO1 rate", "lfo1.rate");
    this.addParam("LFO1 amp", "lfo1.amp");
    this.addParam("Disto Wet", "disto.wet");
    this.addParam("Disto Drive", "disto.drive");
    this.addParam("Bitcrusher Wet", "bitcrusher.wet");
    this.addParam("Bitcrusher Drive", "bitcrusher.drive");
    return this.addParam("Bitcrusher Crush", "bitcrusher.crush");
  };

  AudioOutput.prototype.addParam = function(name, id) {
    var h, input;
    h = document.createElement("h4");
    h.innerText = name;
    document.body.appendChild(h);
    input = document.createElement("input");
    input.id = id;
    input.type = "range";
    document.body.appendChild(input);
    return input.addEventListener("input", (function(_this) {
      return function() {
        return _this.sendParam(id, input.value / 100);
      };
    })(this));
  };

  AudioOutput.prototype.sendParam = function(id, value) {
    return this.node.port.postMessage(JSON.stringify({
      name: "param",
      id: id,
      value: value
    }));
  };

  AudioOutput.prototype.sendNote = function(data) {
    return this.node.port.postMessage(JSON.stringify({
      name: "note",
      data: data
    }));
  };

  return AudioOutput;

})();
