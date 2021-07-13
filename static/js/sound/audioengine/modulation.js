var AmpEnvelope, LFO, ModEnvelope;

ModEnvelope = (function() {
  function ModEnvelope(voice) {
    this.voice = voice;
    this.sampleRate = this.voice.engine.sampleRate;
  }

  ModEnvelope.prototype.init = function(params) {
    this.params = params;
    this.phase = 0;
    return this.update();
  };

  ModEnvelope.prototype.update = function(a) {
    if (a == null) {
      a = this.params.a;
    }
    this.a = 1 / (this.sampleRate * 20 * Math.pow(a, 3) + 1);
    this.d = 1 / (this.sampleRate * 20 * Math.pow(this.params.d, 3) + 1);
    this.s = this.params.s;
    return this.r = 1 / (this.sampleRate * 20 * Math.pow(this.params.r, 3) + 1);
  };

  ModEnvelope.prototype.process = function(noteon) {
    var sig;
    if (this.phase < 1) {
      sig = this.sig = this.phase = Math.min(1, this.phase + this.a);
    } else if (this.phase < 2) {
      this.phase = Math.min(2, this.phase + this.d);
      sig = this.sig = 1 - (this.phase - 1) * (1 - this.s);
    } else if (this.phase < 3) {
      sig = this.sig = this.s;
    } else {
      this.phase = this.phase + this.r;
      sig = Math.max(0, this.sig * (1 - (this.phase - 3)));
    }
    if (this.phase < 3 && !noteon) {
      this.phase = 3;
    }
    return sig;
  };

  return ModEnvelope;

})();

AmpEnvelope = (function() {
  function AmpEnvelope(voice) {
    this.voice = voice;
    this.sampleRate = this.voice.engine.sampleRate;
    this.sig = 0;
  }

  AmpEnvelope.prototype.init = function(params) {
    this.params = params;
    this.phase = 0;
    this.sig = 0;
    return this.update();
  };

  AmpEnvelope.prototype.update = function(a) {
    if (a == null) {
      a = this.params.a;
    }
    this.a2 = 1 / (this.sampleRate * (20 * Math.pow(a, 3) + .00025));
    this.d = Math.exp(Math.log(0.5) / (this.sampleRate * (10 * Math.pow(this.params.d, 3) + 0.001)));
    this.s = DBSCALE(this.params.s, 2);
    console.info("sustain " + this.s);
    return this.r = Math.exp(Math.log(0.5) / (this.sampleRate * (10 * Math.pow(this.params.r, 3) + 0.001)));
  };

  AmpEnvelope.prototype.process = function(noteon) {
    var sig;
    if (this.phase < 1) {
      this.phase += this.a2;
      sig = this.sig = (this.phase * .75 + .25) * this.phase;
      if (this.phase >= 1) {
        sig = this.sig = 1;
        this.phase = 1;
      }
    } else if (this.phase === 1) {
      sig = this.sig = this.sig * this.d;
      if (sig <= this.s) {
        sig = this.sig = this.s;
        this.phase = 2;
      }
    } else if (this.phase < 3) {
      sig = this.sig = this.s;
    } else {
      sig = this.sig = this.sig * this.r;
    }
    if (this.phase < 3 && !noteon) {
      this.phase = 3;
    }
    return sig;
  };

  return AmpEnvelope;

})();

LFO = (function() {
  function LFO(voice) {
    this.voice = voice;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
  }

  LFO.prototype.init = function(params, sync) {
    var rate, t;
    this.params = params;
    if (sync) {
      rate = this.params.rate;
      rate = .1 + rate * rate * rate * (100 - .1);
      t = this.voice.engine.getTime() * rate;
      this.phase = t % 1;
    } else {
      this.phase = Math.random();
    }
    this.process = this.processSine;
    this.update();
    this.r1 = Math.random() * 2 - 1;
    this.r2 = Math.random() * 2 - 1;
    return this.out = 0;
  };

  LFO.prototype.update = function() {
    switch (this.params.type) {
      case 0:
        this.process = this.processSaw;
        break;
      case 1:
        this.process = this.processSquare;
        break;
      case 2:
        this.process = this.processSine;
        break;
      case 3:
        this.process = this.processTriangle;
        break;
      case 4:
        this.process = this.processRandom;
        break;
      case 5:
        this.process = this.processRandomStep;
        break;
      case 6:
        this.process = this.processSawInv;
    }
    return this.audio_freq = 440 * Math.pow(Math.pow(2, 1 / 12), this.voice.key - 57);
  };

  LFO.prototype.processSine = function(rate) {
    var p, r;
    if (this.params.audio) {
      r = 1 + rate * rate * 4;
      rate = this.audio_freq * r;
    } else {
      rate = .01 + rate * rate * 20;
    }
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
    }
    p = this.phase * 2;
    if (p < 1) {
      return p * p * (3 - 2 * p) * 2 - 1;
    } else {
      p -= 1;
      return 1 - p * p * (3 - 2 * p) * 2;
    }
  };

  LFO.prototype.processTriangle = function(rate) {
    if (this.params.audio) {
      rate = this.audio_freq * (1 + rate * rate * 4);
    } else {
      rate = .01 + rate * rate * 20;
    }
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
    }
    return 1 - 4 * Math.abs(this.phase - .5);
  };

  LFO.prototype.processSaw = function(rate) {
    var out;
    if (this.params.audio) {
      rate = this.audio_freq * (1 + rate * rate * 4);
    } else {
      rate = .01 + rate * rate * 20;
    }
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
    }
    out = 1 - this.phase * 2;
    return this.out = this.out * .97 + out * .03;
  };

  LFO.prototype.processSawInv = function(rate) {
    var out;
    if (this.params.audio) {
      rate = this.audio_freq * (1 + rate * rate * 4);
    } else {
      rate = .01 + rate * rate * 20;
    }
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
    }
    out = this.phase * 2 - 1;
    return this.out = this.out * .97 + out * .03;
  };

  LFO.prototype.processSquare = function(rate) {
    var out;
    if (this.params.audio) {
      rate = this.audio_freq * (1 + rate * rate * 4);
    } else {
      rate = .01 + rate * rate * 20;
    }
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
    }
    out = this.phase < .5 ? 1 : -1;
    return this.out = this.out * .97 + out * .03;
  };

  LFO.prototype.processRandom = function(rate) {
    if (this.params.audio) {
      rate = this.audio_freq * (1 + rate * rate * 4);
    } else {
      rate = .01 + rate * rate * 20;
    }
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
      this.r1 = this.r2;
      this.r2 = Math.random() * 2 - 1;
    }
    return this.r1 * (1 - this.phase) + this.r2 * this.phase;
  };

  LFO.prototype.processRandomStep = function(rate) {
    if (this.params.audio) {
      rate = this.audio_freq * (1 + rate * rate * 4);
    } else {
      rate = .01 + rate * rate * 20;
    }
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
      this.r1 = Math.random() * 2 - 1;
    }
    return this.out = this.out * .97 + this.r1 * .03;
  };

  return LFO;

})();
