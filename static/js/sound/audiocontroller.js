this.AudioController = (function() {
  function AudioController(app) {
    this.app = app;
  }

  AudioController.prototype.init = function() {
    var funk;
    this.midiScan();
    funk = (function(_this) {
      return function() {
        _this.start();
        return document.body.removeEventListener("click", funk);
      };
    })(this);
    return document.body.addEventListener("click", funk);
  };

  AudioController.prototype.start = function() {
    var url;
    this.context = new (window.AudioContext || window.webkitAudioContext);
    if (this.context.audioWorklet != null) {
      url = "/audioengine.js";
      return this.context.audioWorklet.addModule(url).then((function(_this) {
        return function() {
          _this.node = new AudioWorkletNode(_this.context, "my-worklet-processor", {
            outputChannelCount: [2]
          });
          return _this.node.connect(_this.context.destination);
        };
      })(this));
    }
  };

  AudioController.prototype.sendParam = function(id, value) {
    return this.node.port.postMessage(JSON.stringify({
      name: "param",
      id: id,
      value: value
    }));
  };

  AudioController.prototype.sendNote = function(data) {
    return this.node.port.postMessage(JSON.stringify({
      name: "note",
      data: data
    }));
  };

  AudioController.prototype.midiScan = function() {
    if (navigator.requestMIDIAccess != null) {
      return navigator.requestMIDIAccess().then(((function(_this) {
        return function(midi) {
          return _this.midiAccess(midi);
        };
      })(this)), ((function(_this) {
        return function() {};
      })(this)));
    }
  };

  AudioController.prototype.midiAccess = function(midi) {
    midi.inputs.forEach((function(_this) {
      return function(port) {
        return port.onmidimessage = function(message) {
          return _this.onMidiMessage(message);
        };
      };
    })(this));
    return true;
  };

  AudioController.prototype.onMidiMessage = function(message) {
    console.info(message.data);
    return this.sendNote(message.data);
  };

  return AudioController;

})();
