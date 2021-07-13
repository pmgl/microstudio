this.MIDI = (function() {
  function MIDI(callback) {
    this.callback = callback;
    this.scan();
  }

  MIDI.prototype.scan = function() {
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

  MIDI.prototype.midiAccess = function(midi) {
    return midi.inputs.forEach((function(_this) {
      return function(port) {
        return port.onmidimessage = function(message) {
          return _this.onMidiMessage(message);
        };
      };
    })(this));
  };

  MIDI.prototype.onMidiMessage = function(message) {
    console.info(message.data);
    return this.callback(message.data);
  };

  return MIDI;

})();
