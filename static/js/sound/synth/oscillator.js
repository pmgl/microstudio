this.Oscillator = (function() {
  function Oscillator() {
    this.inputs = [
      {
        type: "select",
        options: ["saw", "square", "sine", "noise"],
        value: "saw"
      }, {
        type: "signal"
      }
    ];
  }

  Oscillator.prototype.getState = function() {
    return {
      phase: 0
    };
  };

  Oscillator.prototype.getProcessor = function() {
    return function(context, type, freq, state, output) {
      var i, j, k, ref, ref1, sr;
      switch (type) {
        case "saw":
          sr = context.sampleRate;
          for (i = j = 0, ref = output.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            output[i] = 1 - 2 * state.phase;
            state.phase += freq[i] / sr;
            if (state.phase >= 1) {
              state.phase -= 1;
            }
          }
          break;
        case "square":
          sr = context.sampleRate;
          for (i = k = 0, ref1 = output.length - 1; 0 <= ref1 ? k <= ref1 : k >= ref1; i = 0 <= ref1 ? ++k : --k) {
            output[i] = 1 - 2 * state.phase;
            state.phase += freq[i] / sr;
            if (state.phase >= 1) {
              state.phase -= 1;
            }
          }
      }
    };
  };

  return Oscillator;

})();
