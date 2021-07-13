var FX1, FX2, Instrument, Layer;

Instrument = (function() {
  function Instrument(engine) {
    this.engine = engine;
    this.layers = [];
    this.layers.push(new Layer(this));
    this.modulation = 0;
    this.pitch_bend = .5;
  }

  Instrument.prototype.noteOn = function(key, velocity) {
    var j, l, len, ref;
    ref = this.layers;
    for (j = 0, len = ref.length; j < len; j++) {
      l = ref[j];
      l.noteOn(key, velocity);
    }
  };

  Instrument.prototype.noteOff = function(key) {
    var j, l, len, ref;
    ref = this.layers;
    for (j = 0, len = ref.length; j < len; j++) {
      l = ref[j];
      l.noteOff(key);
    }
  };

  Instrument.prototype.setModulation = function(modulation) {
    this.modulation = modulation;
  };

  Instrument.prototype.setPitchBend = function(pitch_bend) {
    this.pitch_bend = pitch_bend;
  };

  Instrument.prototype.process = function(length) {
    var i, j, k, l, left, len, len1, m, ref, ref1, ref2, right;
    if (false) {
      this.layers[0].process(length);
      return this.output = this.layers[0].output;
    } else {
      if ((this.output == null) || this.output[0].length < length) {
        this.output = [new Float64Array(length), new Float64Array(length)];
      }
      ref = this.layers;
      for (j = 0, len = ref.length; j < len; j++) {
        l = ref[j];
        l.process(length);
      }
      for (i = k = 0, ref1 = length - 1; k <= ref1; i = k += 1) {
        left = 0;
        right = 0;
        ref2 = this.layers;
        for (m = 0, len1 = ref2.length; m < len1; m++) {
          l = ref2[m];
          left += l.output[0][i];
          right += l.output[1][i];
        }
        this.output[0][i] = left;
        this.output[1][i] = right;
      }
    }
  };

  return Instrument;

})();

FX1 = [Distortion, BitCrusher, Chorus, Flanger, Phaser, Delay];

FX2 = [Delay, Reverb, Chorus, Flanger, Phaser];

Layer = (function() {
  function Layer(instrument) {
    this.instrument = instrument;
    this.engine = this.instrument.engine;
    this.voices = [];
    this.eq = new EQ(this.engine);
    this.spatializer = new Spatializer(this.engine);
    this.inputs = {
      osc1: {
        type: 0,
        tune: .5,
        coarse: .5,
        amp: .5,
        mod: 0
      },
      osc2: {
        type: 0,
        tune: .5,
        coarse: .5,
        amp: .5,
        mod: 0
      },
      combine: 0,
      noise: {
        amp: 0,
        mod: 0
      },
      filter: {
        cutoff: 1,
        resonance: 0,
        type: 0,
        slope: 1,
        follow: 0
      },
      disto: {
        wet: 0,
        drive: 0
      },
      bitcrusher: {
        wet: 0,
        drive: 0,
        crush: 0
      },
      env1: {
        a: 0,
        d: 0,
        s: 1,
        r: 0
      },
      env2: {
        a: .1,
        d: .1,
        s: .5,
        r: .1,
        out: 0,
        amount: .5
      },
      lfo1: {
        type: 0,
        amount: 0,
        rate: .5,
        out: 0
      },
      lfo2: {
        type: 0,
        amount: 0,
        rate: .5,
        out: 0
      },
      fx1: {
        type: -1,
        amount: 0,
        rate: 0
      },
      fx2: {
        type: -1,
        amount: 0,
        rate: 0
      },
      eq: {
        low: .5,
        mid: .5,
        high: .5
      },
      spatialize: .5,
      pan: .5,
      polyphony: 1,
      glide: .5,
      sync: 1,
      velocity: {
        out: 0,
        amount: .5,
        amp: .5
      },
      modulation: {
        out: 0,
        amount: .5
      }
    };
  }

  Layer.prototype.noteOn = function(key, velocity) {
    var voice;
    if (this.inputs.polyphony === 1 && (this.last_voice != null) && this.last_voice.on) {
      voice = this.last_voice;
      voice.noteOn(this, key, velocity, true);
      this.voices.push(voice);
    } else {
      voice = this.engine.getVoice();
      voice.noteOn(this, key, velocity);
      this.voices.push(voice);
      this.last_voice = voice;
    }
    return this.last_key = key;
  };

  Layer.prototype.removeVoice = function(voice) {
    var index;
    index = this.voices.indexOf(voice);
    if (index >= 0) {
      return this.voices.splice(index, 1);
    }
  };

  Layer.prototype.noteOff = function(key) {
    var j, len, ref, v;
    ref = this.voices;
    for (j = 0, len = ref.length; j < len; j++) {
      v = ref[j];
      if (v.key === key) {
        v.noteOff();
      }
    }
  };

  Layer.prototype.update = function() {
    if (this.inputs.fx1.type >= 0) {
      if ((this.fx1 == null) || !(this.fx1 instanceof FX1[this.inputs.fx1.type])) {
        this.fx1 = new FX1[this.inputs.fx1.type](this.engine);
      }
    } else {
      this.fx1 = null;
    }
    if (this.inputs.fx2.type >= 0) {
      if ((this.fx2 == null) || !(this.fx2 instanceof FX2[this.inputs.fx2.type])) {
        this.fx2 = new FX2[this.inputs.fx2.type](this.engine);
      }
    } else {
      this.fx2 = null;
    }
    if (this.fx1 != null) {
      this.fx1.update(this.inputs.fx1);
    }
    if (this.fx2 != null) {
      this.fx2.update(this.inputs.fx2);
    }
    return this.eq.update(this.inputs.eq);
  };

  Layer.prototype.process = function(length) {
    var i, j, k, len, m, ref, ref1, ref2, sig, v;
    if ((this.output == null) || this.output[0].length < length) {
      this.output = [new Float64Array(length), new Float64Array(length)];
    }
    for (i = j = ref = this.voices.length - 1; j >= 0; i = j += -1) {
      v = this.voices[i];
      if (!v.on && v.env1.sig < .00001) {
        v.env1.sig = 0;
        this.removeVoice(v);
      }
    }
    for (i = k = 0, ref1 = length - 1; k <= ref1; i = k += 1) {
      sig = 0;
      ref2 = this.voices;
      for (m = 0, len = ref2.length; m < len; m++) {
        v = ref2[m];
        sig += v.process();
      }
      this.output[0][i] = sig;
      this.output[1][i] = sig;
    }
    this.spatializer.process(this.output, length, this.inputs.spatialize, this.inputs.pan);
    if (this.fx1 != null) {
      this.fx1.process(this.output, length);
    }
    if (this.fx2 != null) {
      this.fx2.process(this.output, length);
    }
    this.eq.process(this.output, length);
  };

  return Layer;

})();
