var AudioEngine;

AudioEngine = (function() {
  function AudioEngine(sampleRate) {
    var i, k, ref;
    this.sampleRate = sampleRate;
    this.voices = [];
    this.voice_index = 0;
    this.num_voices = 8;
    for (i = k = 0, ref = this.num_voices - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      this.voices[i] = new Voice(this);
    }
    this.instruments = [];
    this.instruments.push(new Instrument(this));
    this.avg = 0;
    this.samples = 0;
    this.time = 0;
    this.layer = {
      inputs: this.inputs
    };
    this.start = Date.now();
  }

  AudioEngine.prototype.event = function(data) {
    var v;
    if (data[0] === 144 && data[2] > 0) {
      this.instruments[0].noteOn(data[1], data[2]);
    } else if (data[0] === 128 || (data[0] === 144 && data[2] === 0)) {
      this.instruments[0].noteOff(data[1]);
    } else if (data[0] >= 176 && data[0] < 192 && data[1] === 1) {
      this.instruments[0].setModulation(data[2] / 127);
    } else if (data[0] >= 224 && data[0] < 240) {
      v = data[1] + 128 * data[2];
      console.info("PB value=" + v);
      if (v >= 8192) {
        v = (v - 8192) / (16383 - 8192);
        v = .5 + .5 * v;
      } else {
        v = .5 * v / 8192;
      }
      console.info("Pitch Bend = " + v);
      this.instruments[0].setPitchBend(v);
    }
  };

  AudioEngine.prototype.getTime = function() {
    return (Date.now() - this.start) / 1000;
  };

  AudioEngine.prototype.getVoice = function() {
    var best, i, k, ref, v;
    best = this.voices[0];
    for (i = k = 1, ref = this.voices.length - 1; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
      v = this.voices[i];
      if (best.on) {
        if (v.on) {
          if (v.noteon_time < best.noteon_time) {
            best = v;
          }
        } else {
          best = v;
        }
      } else {
        if (!v.on && v.env1.sig < best.env1.sig) {
          best = v;
        }
      }
    }
    return best;
  };

  AudioEngine.prototype.updateVoices = function() {
    var k, l, len, len1, m, ref, ref1, v;
    ref = this.voices;
    for (k = 0, len = ref.length; k < len; k++) {
      v = ref[k];
      v.update();
    }
    ref1 = this.instruments[0].layers;
    for (m = 0, len1 = ref1.length; m < len1; m++) {
      l = ref1[m];
      l.update();
    }
  };

  AudioEngine.prototype.process = function(inputs, outputs, parameters) {
    var channel, i, inst, j, k, len, len1, len2, m, n, o, output, ref, ref1, ref2, res, sig, time;
    output = outputs[0];
    time = Date.now();
    res = [0, 0];
    ref = this.instruments;
    for (k = 0, len = ref.length; k < len; k++) {
      inst = ref[k];
      inst.process(output[0].length);
    }
    for (i = m = 0, len1 = output.length; m < len1; i = ++m) {
      channel = output[i];
      if (i < 2) {
        for (j = n = 0, ref1 = channel.length - 1; n <= ref1; j = n += 1) {
          sig = 0;
          ref2 = this.instruments;
          for (o = 0, len2 = ref2.length; o < len2; o++) {
            inst = ref2[o];
            sig += inst.output[i][j];
          }
          sig *= .125;
          sig = sig < 0 ? -(1 - Math.exp(sig)) : 1 - Math.exp(-sig);
          channel[j] = sig;
        }
      }
    }
    this.time += Date.now() - time;
    this.samples += channel.length;
    if (this.samples >= this.sampleRate) {
      this.samples -= this.sampleRate;
      console.info(this.time + " ms ; buffer size = " + channel.length);
      this.time = 0;
    }
  };

  return AudioEngine;

})();


class MyWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.synth = new AudioEngine(sampleRate)
    this.port.onmessage = (e) => {
      console.info(e)
      var data = JSON.parse(e.data)
      if (data.name == "note")
        {
          this.synth.event(data.data)
        }
      else if (data.name == "param")
        {
          var value = data.value
          var s = data.id.split(".")
          data = this.synth.instruments[0].layers[0].inputs
          while (s.length>1)
            {
              data = data[s.splice(0,1)[0]]
            }
          data[s[0]] = value
          this.synth.updateVoices()
        }
    }
  }

  process(inputs, outputs, parameters) {
    this.synth.process(inputs,outputs,parameters)
    return true
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor)
;
