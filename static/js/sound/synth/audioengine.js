
const TWOPI = 2*Math.PI
const SIN_TABLE = new Float64Array(10001)
const WHITE_NOISE = new Float64Array(100000)
const COLORED_NOISE = new Float64Array(100000)
;
var AllpassFilter, AmpEnvelope, AudioEngine, BitCrusher, Blip, Chorus, CombFilter, DBSCALE, Delay, Distortion, EQ, FX1, FX2, Filter, Flanger, Instrument, LFO, Layer, ModEnvelope, Noise, Phaser, Reverb, SawOscillator, SineOscillator, Spatializer, SquareOscillator, StringOscillator, Voice, VoiceOscillator;

(function() {
  var i, o, results;
  results = [];
  for (i = o = 0; o <= 10000; i = o += 1) {
    results.push(SIN_TABLE[i] = Math.sin(i / 10000 * Math.PI * 2));
  }
  return results;
})();


const BLIP_SIZE = 512
const BLIP = new Float64Array(BLIP_SIZE+1)
;

(function() {
  var i, norm, o, p, ref, ref1, results, u, x, y;
  for (p = o = 1; o <= 31; p = o += 2) {
    for (i = u = 0, ref = BLIP_SIZE; u <= ref; i = u += 1) {
      x = (i / BLIP_SIZE - .5) * .5;
      BLIP[i] += Math.sin(x * 2 * Math.PI * p) / p;
    }
  }
  norm = BLIP[BLIP_SIZE];
  results = [];
  for (i = y = 0, ref1 = BLIP_SIZE; y <= ref1; i = y += 1) {
    results.push(BLIP[i] /= norm);
  }
  return results;
})();

(function() {
  var b0, b1, b2, b3, b4, b5, b6, i, n, o, pink, results, white;
  n = 0;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0;
  results = [];
  for (i = o = 0; o <= 99999; i = o += 1) {
    white = Math.random() * 2 - 1;
    n = .99 * n + .01 * white;
    pink = n * 6;
    WHITE_NOISE[i] = white;
    results.push(COLORED_NOISE[i] = pink);
  }
  return results;
})();

DBSCALE = function(value, range) {
  return (Math.exp(value * range) / Math.exp(range) - 1 / Math.exp(range)) / (1 - 1 / Math.exp(range));
};

SquareOscillator = (function() {
  function SquareOscillator(voice1, osc) {
    this.voice = voice1;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.tune = 1;
    this.buffer = new Float64Array(32);
    if (osc != null) {
      this.init(osc);
    }
  }

  SquareOscillator.prototype.init = function(osc, sync1) {
    var i, o, ref;
    this.sync = sync1;
    this.phase = this.sync ? 0 : Math.random();
    this.sig = -1;
    this.index = 0;
    this.update(osc);
    for (i = o = 0, ref = this.buffer.length - 1; 0 <= ref ? o <= ref : o >= ref; i = 0 <= ref ? ++o : --o) {
      this.buffer[i] = 0;
    }
  };

  SquareOscillator.prototype.update = function(osc, sync1) {
    var c, fine;
    this.sync = sync1;
    c = Math.round(osc.coarse * 48) / 48;
    fine = osc.tune * 2 - 1;
    fine = fine * (1 + fine * fine) * .5;
    this.tune = 1 * Math.pow(2, c * 4) * .25 * Math.pow(Math.pow(2, 1 / 12), fine);
    return this.analog_tune = this.tune;
  };

  SquareOscillator.prototype.process = function(freq, mod) {
    var a, avg, dp, dpi, i, index, m, o, sig, u;
    dp = this.analog_tune * freq * this.invSampleRate;
    this.phase += dp;
    m = .5 - mod * .49;
    avg = 1 - 2 * m;
    if (this.sig < 0) {
      if (this.phase >= m) {
        this.sig = 1;
        dp = Math.max(0, Math.min(1, (this.phase - m) / dp));
        dp *= 16;
        dpi = Math.floor(dp);
        a = dp - dpi;
        index = this.index;
        for (i = o = 0; o <= 31; i = o += 1) {
          if (dpi >= 512) {
            break;
          }
          this.buffer[index] += -1 + BLIP[dpi] * (1 - a) + BLIP[dpi + 1] * a;
          dpi += 16;
          index = (index + 1) % this.buffer.length;
        }
      }
    } else {
      if (this.phase >= 1) {
        dp = Math.max(0, Math.min(1, (this.phase - 1) / dp));
        dp *= 16;
        dpi = Math.floor(dp);
        a = dp - dpi;
        index = this.index;
        this.sig = -1;
        this.phase -= 1;
        this.analog_tune = this.sync ? this.tune : this.tune * (1 + (Math.random() - .5) * .002);
        for (i = u = 0; u <= 31; i = u += 1) {
          if (dpi >= 512) {
            break;
          }
          this.buffer[index] += 1 - BLIP[dpi] * (1 - a) - BLIP[dpi + 1] * a;
          dpi += 16;
          index = (index + 1) % this.buffer.length;
        }
      }
    }
    sig = this.sig + this.buffer[this.index];
    this.buffer[this.index] = 0;
    this.index = (this.index + 1) % this.buffer.length;
    return sig - avg;
  };

  return SquareOscillator;

})();

SawOscillator = (function() {
  function SawOscillator(voice1, osc) {
    this.voice = voice1;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.tune = 1;
    this.buffer = new Float64Array(32);
    if (osc != null) {
      this.init(osc);
    }
  }

  SawOscillator.prototype.init = function(osc, sync1) {
    var i, o, ref;
    this.sync = sync1;
    this.phase = this.sync ? 0 : Math.random();
    this.sig = -1;
    this.index = 0;
    this.jumped = false;
    this.update(osc);
    for (i = o = 0, ref = this.buffer.length - 1; 0 <= ref ? o <= ref : o >= ref; i = 0 <= ref ? ++o : --o) {
      this.buffer[i] = 0;
    }
  };

  SawOscillator.prototype.update = function(osc, sync1) {
    var c, fine;
    this.sync = sync1;
    c = Math.round(osc.coarse * 48) / 48;
    fine = osc.tune * 2 - 1;
    fine = fine * (1 + fine * fine) * .5;
    this.tune = 1 * Math.pow(2, c * 4) * .25 * Math.pow(Math.pow(2, 1 / 12), fine);
    return this.analog_tune = this.tune;
  };

  SawOscillator.prototype.process = function(freq, mod) {
    var a, dp, dphase, dpi, i, index, o, offset, sig, slope, u;
    dphase = this.analog_tune * freq * this.invSampleRate;
    this.phase += dphase;
    slope = 1 + mod;
    if (!this.jumped) {
      sig = 1 - 2 * this.phase * slope;
      if (this.phase >= .5) {
        this.jumped = true;
        sig = mod - 2 * (this.phase - .5) * slope;
        dp = Math.max(0, Math.min(1, (this.phase - .5) / dphase));
        dp *= 16;
        dpi = Math.floor(dp);
        a = dp - dpi;
        index = this.index;
        if (mod > 0) {
          for (i = o = 0; o <= 31; i = o += 1) {
            if (dpi >= 512) {
              break;
            }
            this.buffer[index] += (-1 + BLIP[dpi] * (1 - a) + BLIP[dpi + 1] * a) * mod;
            dpi += 16;
            index = (index + 1) % this.buffer.length;
          }
        }
      }
    } else {
      sig = mod - 2 * (this.phase - .5) * slope;
      if (this.phase >= 1) {
        this.jumped = false;
        dp = Math.max(0, Math.min(1, (this.phase - 1) / dphase));
        dp *= 16;
        dpi = Math.floor(dp);
        a = dp - dpi;
        index = this.index;
        this.phase -= 1;
        sig = 1 - 2 * this.phase * slope;
        this.analog_tune = this.sync ? this.tune : this.tune * (1 + (Math.random() - .5) * .002);
        for (i = u = 0; u <= 31; i = u += 1) {
          if (dpi >= 512) {
            break;
          }
          this.buffer[index] += -1 + BLIP[dpi] * (1 - a) + BLIP[dpi + 1] * a;
          dpi += 16;
          index = (index + 1) % this.buffer.length;
        }
      }
    }
    sig += this.buffer[this.index];
    this.buffer[this.index] = 0;
    this.index = (this.index + 1) % this.buffer.length;
    offset = 16 * 2 * dphase * slope;
    return sig + offset;
  };

  return SawOscillator;

})();

SineOscillator = (function() {
  function SineOscillator(voice1, osc) {
    this.voice = voice1;
    this.sampleRate = this.voice.engine.sampleRate;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.maxRatio = this.sampleRate / Math.PI / 5 / (2 * Math.PI);
    this.tune = 1;
    if (osc != null) {
      this.init(osc);
    }
  }

  SineOscillator.prototype.init = function(osc, sync1) {
    this.sync = sync1;
    this.phase = this.sync ? .25 : Math.random();
    return this.update(osc);
  };

  SineOscillator.prototype.update = function(osc, sync1) {
    var c, fine;
    this.sync = sync1;
    c = Math.round(osc.coarse * 48) / 48;
    fine = osc.tune * 2 - 1;
    fine = fine * (1 + fine * fine) * .5;
    this.tune = 1 * Math.pow(2, c * 4) * .25 * Math.pow(Math.pow(2, 1 / 12), fine);
    this.modnorm = 25 / Math.sqrt(this.tune * this.voice.freq);
    return this.dphase = this.tune * this.invSampleRate;
  };

  SineOscillator.prototype.sinWave = function(x) {
    var ax, ix;
    x = (x - Math.floor(x)) * 10000;
    ix = Math.floor(x);
    ax = x - ix;
    return SIN_TABLE[ix] * (1 - ax) + SIN_TABLE[ix + 1] * ax;
  };

  SineOscillator.prototype.sinWave2 = function(x) {
    x = 2 * (x - Math.floor(x));
    if (x > 1) {
      x = 2 - x;
    }
    return x * x * (3 - 2 * x) * 2 - 1;
  };

  SineOscillator.prototype.process = function(freq, mod) {
    var m1, m2, p;
    this.phase = this.phase + freq * this.dphase;
    if (this.phase >= 1) {
      this.phase -= 1;
      this.analog_tune = this.sync ? this.tune : this.tune * (1 + (Math.random() - .5) * .002);
      this.dphase = this.analog_tune * this.invSampleRate;
    }
    m1 = mod * this.modnorm;
    m2 = mod * m1;
    p = this.phase;
    return this.sinWave2(p + m1 * this.sinWave2(p + m2 * this.sinWave2(p)));
  };

  return SineOscillator;

})();

VoiceOscillator = (function() {
  function VoiceOscillator(voice1, osc) {
    this.voice = voice1;
    this.sampleRate = this.voice.engine.sampleRate;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.tune = 1;
    if (osc != null) {
      this.init(osc);
    }
    this.f1 = [320, 500, 700, 1000, 500, 320, 700, 500, 320, 320];
    this.f2 = [800, 1000, 1150, 1400, 1500, 1650, 1800, 2300, 3200, 3200];
  }

  VoiceOscillator.prototype.init = function(osc) {
    this.phase = 0;
    this.grain1_p1 = .25;
    this.grain1_p2 = .25;
    this.grain2_p1 = .25;
    this.grain2_p2 = .25;
    return this.update(osc);
  };

  VoiceOscillator.prototype.update = function(osc) {
    var c, fine;
    c = Math.round(osc.coarse * 48) / 48;
    fine = osc.tune * 2 - 1;
    fine = fine * (1 + fine * fine) * .5;
    this.tune = 1 * Math.pow(2, c * 4) * .25 * Math.pow(Math.pow(2, 1 / 12), fine);
    this.modnorm = 25 / Math.sqrt(this.tune * this.voice.freq);
    return this.dphase = this.tune * this.invSampleRate;
  };

  VoiceOscillator.prototype.sinWave2 = function(x) {
    x = 2 * (x - Math.floor(x));
    if (x > 1) {
      x = 2 - x;
    }
    return x * x * (3 - 2 * x) * 2 - 1;
  };

  VoiceOscillator.prototype.process = function(freq, mod) {
    var am, f1, f2, im, m, p1, sig, vol, x;
    p1 = this.phase < 1;
    this.phase = this.phase + freq * this.dphase;
    m = mod * (this.f1.length - 2);
    im = Math.floor(m);
    am = m - im;
    f1 = this.f1[im] * (1 - am) + this.f1[im + 1] * am;
    f2 = this.f2[im] * (1 - am) + this.f2[im + 1] * am;
    if (p1 && this.phase >= 1) {
      this.grain2_p1 = .25;
      this.grain2_p2 = .25;
    }
    if (this.phase >= 2) {
      this.phase -= 2;
      this.grain1_p1 = .25;
      this.grain1_p2 = .25;
    }
    x = this.phase - 1;
    x *= x * x;
    vol = 1 - Math.abs(1 - this.phase);
    sig = vol * (this.sinWave2(this.grain1_p1) * .25 + .125 * this.sinWave2(this.grain1_p2));
    this.grain1_p1 += f1 * this.invSampleRate;
    this.grain1_p2 += f2 * this.invSampleRate;
    x = ((this.phase + 1) % 2) - 1;
    x *= x * x;
    vol = this.phase < 1 ? 1 - this.phase : this.phase - 1;
    sig += vol * (this.sinWave2(this.grain2_p1) * .25 + .125 * this.sinWave2(this.grain2_p2));
    sig += this.sinWave2(this.phase + .25);
    this.grain2_p1 += f1 * this.invSampleRate;
    this.grain2_p2 += f2 * this.invSampleRate;
    return sig;
  };

  return VoiceOscillator;

})();

StringOscillator = (function() {
  function StringOscillator(voice1, osc) {
    this.voice = voice1;
    this.sampleRate = this.voice.engine.sampleRate;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.maxRatio = this.sampleRate / Math.PI / 5 / (2 * Math.PI);
    this.tune = 1;
    if (osc != null) {
      this.init(osc);
    }
  }

  StringOscillator.prototype.init = function(osc) {
    this.index = 0;
    this.buffer = new Float64Array(this.sampleRate / 10);
    this.update(osc);
    this.prev = 0;
    return this.power = 1;
  };

  StringOscillator.prototype.update = function(osc) {
    var c, fine;
    c = Math.round(osc.coarse * 48) / 48;
    fine = osc.tune * 2 - 1;
    fine = fine * (1 + fine * fine) * .5;
    return this.tune = 1 * Math.pow(2, c * 4) * .25 * Math.pow(Math.pow(2, 1 / 12), fine);
  };

  StringOscillator.prototype.process = function(freq, mod) {
    var a, ix, m, n, period, r, reflection, sig, x;
    period = this.sampleRate / (freq * this.tune);
    x = (this.index - period + this.buffer.length) % this.buffer.length;
    ix = Math.floor(x);
    a = x - ix;
    reflection = this.buffer[ix] * (1 - a) + this.buffer[(ix + 1) % this.buffer.length] * a;
    m = Math.exp(Math.log(0.99) / freq);
    m = 1;
    r = reflection * m + this.prev * (1 - m);
    this.prev = r;
    n = Math.random() * 2 - 1;
    m = mod * .5;
    m = m * m * .999 + .001;
    sig = n * m + r;
    this.power = Math.max(Math.abs(sig) * .1 + this.power * .9, this.power * .999);
    sig /= this.power + .0001;
    this.buffer[this.index] = sig;
    this.index += 1;
    if (this.index >= this.buffer.length) {
      this.index = 0;
    }
    return sig;
  };

  StringOscillator.prototype.processOld = function(freq, mod) {
    var a, ix, m, period, r, reflection, sig, x;
    period = this.sampleRate / (freq * this.tune);
    x = (this.index - period + this.buffer.length) % this.buffer.length;
    ix = Math.floor(x);
    a = x - ix;
    reflection = this.buffer[ix] * (1 - a) + this.buffer[(ix + 1) % this.buffer.length] * a;
    m = mod;
    r = reflection * m + this.prev * (1 - m);
    this.prev = r;
    sig = (Math.random() * 2 - 1) * .01 + r * .99;
    this.buffer[this.index] = sig / this.power;
    this.power = Math.abs(sig) * .001 + this.power * .999;
    this.index += 1;
    if (this.index >= this.buffer.length) {
      this.index = 0;
    }
    return sig;
  };

  return StringOscillator;

})();

Noise = (function() {
  function Noise(voice1) {
    this.voice = voice1;
  }

  Noise.prototype.init = function() {
    this.phase = 0;
    this.seed = 1382;
    return this.n = 0;
  };

  Noise.prototype.process = function(mod) {
    var pink, white;
    this.seed = (this.seed * 13907 + 12345) & 0x7FFFFFFF;
    white = (this.seed / 0x80000000) * 2 - 1;
    this.n = this.n * .99 + white * .01;
    pink = this.n * 6;
    return white * (1 - mod) + pink * mod;
  };

  return Noise;

})();

ModEnvelope = (function() {
  function ModEnvelope(voice1) {
    this.voice = voice1;
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
  function AmpEnvelope(voice1) {
    this.voice = voice1;
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
  function LFO(voice1) {
    this.voice = voice1;
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
    }
    return this.audio_freq = 440 * Math.pow(Math.pow(2, 1 / 12), this.voice.key - 57);
  };

  LFO.prototype.processSine = function(rate) {
    var p, r;
    if (this.params.audio) {
      r = rate < .5 ? .25 + rate * rate / .25 * .75 : rate * rate * 4;
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
    rate *= rate;
    rate *= rate;
    rate = .05 + rate * rate * 10000;
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
    }
    return 1 - 4 * Math.abs(this.phase - .5);
  };

  LFO.prototype.processSaw = function(rate) {
    var out;
    rate *= rate;
    rate *= rate;
    rate = .05 + rate * rate * 10000;
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
    }
    out = 1 - this.phase * 2;
    return this.out = this.out * .97 + out * .03;
  };

  LFO.prototype.processSquare = function(rate) {
    var out;
    rate *= rate;
    rate *= rate;
    rate = .05 + rate * rate * 10000;
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
    }
    out = this.phase < .5 ? 1 : -1;
    return this.out = this.out * .97 + out * .03;
  };

  LFO.prototype.processRandom = function(rate) {
    rate *= rate;
    rate *= rate;
    rate = .05 + rate * rate * 10000;
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
      this.r1 = this.r2;
      this.r2 = Math.random() * 2 - 1;
    }
    return this.r1 * (1 - this.phase) + this.r2 * this.phase;
  };

  LFO.prototype.processRandomStep = function(rate) {
    rate *= rate;
    rate *= rate;
    rate = .05 + rate * rate * 10000;
    this.phase = this.phase + rate * this.invSampleRate;
    if (this.phase >= 1) {
      this.phase -= 1;
      this.r1 = Math.random() * 2 - 1;
    }
    return this.out = this.out * .97 + this.r1 * .03;
  };

  LFO.prototype.processDiscreteRandom = function() {};

  LFO.prototype.processSmoothRandom = function() {};

  return LFO;

})();

Filter = (function() {
  function Filter(voice1) {
    this.voice = voice1;
    this.sampleRate = this.voice.engine.sampleRate;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.halfSampleRate = this.sampleRate * .5;
  }

  Filter.prototype.init = function(layer1) {
    this.layer = layer1;
    this.fm00 = 0;
    this.fm01 = 0;
    this.fm10 = 0;
    this.fm11 = 0;
    return this.update();
  };

  Filter.prototype.update = function() {
    switch (this.layer.inputs.filter.type) {
      case 0:
        return this.process = this.processLowPass;
      case 1:
        return this.process = this.processBandPass;
      case 2:
        return this.process = this.processHighPass;
    }
  };

  Filter.prototype.processHighPass = function(sig, cutoff, q) {
    var a0, a1, alpha, aw0, b0, b1, b2, cosw0, invOnePlusAlpha, iw0, onePlusCosw0, sinw0, w, w0;
    w0 = Math.max(0, Math.min(this.halfSampleRate, cutoff)) * this.invSampleRate;
    w0 *= 10000;
    iw0 = Math.floor(w0);
    aw0 = w0 - iw0;
    cosw0 = (1 - aw0) * SIN_TABLE[iw0 + 2500] + aw0 * SIN_TABLE[iw0 + 2501];
    sinw0 = (1 - aw0) * SIN_TABLE[iw0] + aw0 * SIN_TABLE[iw0 + 1];
    alpha = sinw0 / (2 * q);
    invOnePlusAlpha = 1 / (1 + alpha);
    a0 = (-2 * cosw0) * invOnePlusAlpha;
    a1 = (1 - alpha) * invOnePlusAlpha;
    onePlusCosw0 = 1 + cosw0;
    b0 = onePlusCosw0 * .5 * invOnePlusAlpha;
    b1 = -onePlusCosw0 * invOnePlusAlpha;
    b2 = b0;
    w = sig - a0 * this.fm00 - a1 * this.fm01;
    sig = b0 * w + b1 * this.fm00 + b2 * this.fm01;
    this.fm01 = this.fm00;
    this.fm00 = w;
    if (this.layer.inputs.filter.slope) {
      w = sig - a0 * this.fm10 - a1 * this.fm11;
      sig = b0 * w + b1 * this.fm10 + b2 * this.fm11;
      this.fm11 = this.fm10;
      this.fm10 = w;
    }
    return sig;
  };

  Filter.prototype.processBandPass = function(sig, cutoff, q) {
    var a0, a1, alpha, aw0, b0, b1, b2, cosw0, invOnePlusAlpha, iw0, oneLessCosw0, sinw0, w, w0;
    w0 = Math.max(0, Math.min(this.halfSampleRate, cutoff)) * this.invSampleRate;
    w0 *= 10000;
    iw0 = Math.floor(w0);
    aw0 = w0 - iw0;
    cosw0 = (1 - aw0) * SIN_TABLE[iw0 + 2500] + aw0 * SIN_TABLE[iw0 + 2501];
    sinw0 = (1 - aw0) * SIN_TABLE[iw0] + aw0 * SIN_TABLE[iw0 + 1];
    alpha = sinw0 / (2 * q);
    invOnePlusAlpha = 1 / (1 + alpha);
    oneLessCosw0 = 1 - cosw0;
    a0 = (-2 * cosw0) * invOnePlusAlpha;
    a1 = (1 - alpha) * invOnePlusAlpha;
    b0 = q * alpha * invOnePlusAlpha;
    b1 = 0;
    b2 = -b0;
    w = sig - a0 * this.fm00 - a1 * this.fm01;
    sig = b0 * w + b1 * this.fm00 + b2 * this.fm01;
    this.fm01 = this.fm00;
    this.fm00 = w;
    if (this.layer.inputs.filter.slope) {
      w = sig - a0 * this.fm10 - a1 * this.fm11;
      sig = b0 * w + b1 * this.fm10 + b2 * this.fm11;
      this.fm11 = this.fm10;
      this.fm10 = w;
    }
    return sig;
  };

  Filter.prototype.processLowPass = function(sig, cutoff, q) {
    var a0, a1, alpha, aw0, b0, b1, b2, cosw0, invOnePlusAlpha, iw0, oneLessCosw0, sinw0, w, w0;
    w0 = Math.max(0, Math.min(this.halfSampleRate, cutoff)) * this.invSampleRate;
    w0 *= 10000;
    iw0 = Math.floor(w0);
    aw0 = w0 - iw0;
    cosw0 = (1 - aw0) * SIN_TABLE[iw0 + 2500] + aw0 * SIN_TABLE[iw0 + 2501];
    sinw0 = (1 - aw0) * SIN_TABLE[iw0] + aw0 * SIN_TABLE[iw0 + 1];
    alpha = sinw0 / (2 * q);
    invOnePlusAlpha = 1 / (1 + alpha);
    oneLessCosw0 = 1 - cosw0;
    b1 = oneLessCosw0 * invOnePlusAlpha;
    b0 = b1 * .5;
    b2 = b0;
    a0 = (-2 * cosw0) * invOnePlusAlpha;
    a1 = (1 - alpha) * invOnePlusAlpha;
    w = sig - a0 * this.fm00 - a1 * this.fm01;
    sig = b0 * w + b1 * this.fm00 + b2 * this.fm01;
    this.fm01 = this.fm00;
    this.fm00 = w;
    if (this.layer.inputs.filter.slope) {
      w = sig - a0 * this.fm10 - a1 * this.fm11;
      sig = b0 * w + b1 * this.fm10 + b2 * this.fm11;
      this.fm11 = this.fm10;
      this.fm10 = w;
    }
    return sig;
  };

  return Filter;

})();

Distortion = (function() {
  function Distortion() {
    this.amount = .5;
    this.rate = .5;
  }

  Distortion.prototype.update = function(data) {
    this.amount = data.amount;
    return this.rate = data.rate;
  };

  Distortion.prototype.process = function(buffer, length) {
    var disto, i, o, ref, s, sig;
    for (i = o = 0, ref = length - 1; o <= ref; i = o += 1) {
      sig = buffer[0][i];
      s = sig * (1 + this.rate * this.rate * 99);
      disto = s < 0 ? -1 + Math.exp(s) : 1 - Math.exp(-s);
      buffer[0][i] = (1 - this.amount) * sig + this.amount * disto;
      sig = buffer[1][i];
      s = sig * (1 + this.rate * this.rate * 99);
      disto = s < 0 ? -1 + Math.exp(s) : 1 - Math.exp(-s);
      buffer[1][i] = (1 - this.amount) * sig + this.amount * disto;
    }
  };

  return Distortion;

})();

BitCrusher = (function() {
  function BitCrusher() {
    this.phase = 0;
    this.left = 0;
    this.right = 0;
  }

  BitCrusher.prototype.update = function(data) {
    this.amount = Math.pow(2, data.amount * 8);
    return this.rate = Math.pow(2, (1 - data.rate) * 16) * 2;
  };

  BitCrusher.prototype.process = function(buffer, length) {
    var crush, i, left, o, r, ref, right;
    r = 1 - this.rate;
    crush = 1 + 15 * r * r;
    for (i = o = 0, ref = length - 1; o <= ref; i = o += 1) {
      left = buffer[0][i];
      right = buffer[1][i];
      this.phase += 1;
      if (this.phase > this.amount) {
        this.phase -= this.amount;
        this.left = left > 0 ? Math.ceil(left * this.rate) / this.rate : Math.floor(left * this.rate) / this.rate;
        this.right = right > 0 ? Math.ceil(right * this.rate) / this.rate : Math.floor(right * this.rate) / this.rate;
      }
      buffer[0][i] = this.left;
      buffer[1][i] = this.right;
    }
  };

  return BitCrusher;

})();

Chorus = (function() {
  function Chorus(engine) {
    this.engine = engine;
    this.sampleRate = this.engine.sampleRate;
    this.left_buffer = new Float64Array(this.sampleRate);
    this.right_buffer = new Float64Array(this.sampleRate);
    this.phase1 = Math.random();
    this.phase2 = Math.random();
    this.phase3 = Math.random();
    this.f1 = 1.031 / this.sampleRate;
    this.f2 = 1.2713 / this.sampleRate;
    this.f3 = 0.9317 / this.sampleRate;
    this.index = 0;
  }

  Chorus.prototype.update = function(data) {
    this.amount = Math.pow(data.amount, .5);
    return this.rate = data.rate;
  };

  Chorus.prototype.read = function(buffer, pos) {
    var a, i;
    if (pos < 0) {
      pos += buffer.length;
    }
    i = Math.floor(pos);
    a = pos - i;
    return buffer[i] * (1 - a) + buffer[(i + 1) % buffer.length] * a;
  };

  Chorus.prototype.process = function(buffer, length) {
    var i, left, o, p1, p2, p3, pleft, pright, ref, right, s1, s2, s3;
    for (i = o = 0, ref = length - 1; o <= ref; i = o += 1) {
      left = this.left_buffer[this.index] = buffer[0][i];
      right = this.right_buffer[this.index] = buffer[1][i];
      this.phase1 += this.f1 * (.5 + .5 * this.rate);
      this.phase2 += this.f2 * (.5 + .5 * this.rate);
      this.phase3 += this.f3 * (.5 + .5 * this.rate);
      p1 = (1 + Math.sin(this.phase1 * Math.PI * 2)) * this.left_buffer.length * .002;
      p2 = (1 + Math.sin(this.phase2 * Math.PI * 2)) * this.left_buffer.length * .002;
      p3 = (1 + Math.sin(this.phase3 * Math.PI * 2)) * this.left_buffer.length * .002;
      if (this.phase1 >= 1) {
        this.phase1 -= 1;
      }
      if (this.phase2 >= 1) {
        this.phase2 -= 1;
      }
      if (this.phase3 >= 1) {
        this.phase3 -= 1;
      }
      s1 = this.read(this.left_buffer, this.index - p1);
      s2 = this.read(this.right_buffer, this.index - p2);
      s3 = this.read(this.right_buffer, this.index - p3);
      pleft = this.amount * (s1 * .2 + s2 * .7 + s3 * .1);
      pright = this.amount * (s1 * .6 + s2 * .2 + s3 * .2);
      left += pleft;
      right += pright;
      this.left_buffer[this.index] += pleft * .5 * this.amount;
      this.right_buffer[this.index] += pleft * .5 * this.amount;
      this.index += 1;
      if (this.index >= this.left_buffer.length) {
        this.index = 0;
      }
      buffer[0][i] = left;
      buffer[1][i] = right;
    }
  };

  return Chorus;

})();

Phaser = (function() {
  function Phaser(engine) {
    this.engine = engine;
    this.sampleRate = this.engine.sampleRate;
    this.left_buffer = new Float64Array(this.sampleRate);
    this.right_buffer = new Float64Array(this.sampleRate);
    this.phase1 = Math.random();
    this.phase2 = Math.random();
    this.f1 = .0573 / this.sampleRate;
    this.f2 = .0497 / this.sampleRate;
    this.index = 0;
  }

  Phaser.prototype.update = function(data) {
    this.amount = data.amount;
    return this.rate = data.rate;
  };

  Phaser.prototype.read = function(buffer, pos) {
    var a, i;
    if (pos < 0) {
      pos += buffer.length;
    }
    i = Math.floor(pos);
    a = pos - i;
    return buffer[i] * (1 - a) + buffer[(i + 1) % buffer.length] * a;
  };

  Phaser.prototype.process = function(buffer, length) {
    var i, left, o, o1, o2, p1, p2, ref, right, s1, s2;
    for (i = o = 0, ref = length - 1; o <= ref; i = o += 1) {
      left = buffer[0][i];
      right = buffer[1][i];
      this.phase1 += this.f1 * (.5 + .5 * this.rate);
      this.phase2 += this.f2 * (.5 + .5 * this.rate);
      o1 = (1 + Math.sin(this.phase1 * Math.PI * 2)) / 2;
      p1 = this.sampleRate * (.0001 + .05 * o1);
      o2 = (1 + Math.sin(this.phase2 * Math.PI * 2)) / 2;
      p2 = this.sampleRate * (.0001 + .05 * o2);
      if (this.phase1 >= 1) {
        this.phase1 -= 1;
      }
      if (this.phase2 >= 1) {
        this.phase2 -= 1;
      }
      this.left_buffer[this.index] = left;
      this.right_buffer[this.index] = right;
      s1 = this.read(this.left_buffer, this.index - p1);
      s2 = this.read(this.right_buffer, this.index - p2);
      this.left_buffer[this.index] += s1 * this.rate * .9;
      this.right_buffer[this.index] += s2 * this.rate * .9;
      buffer[0][i] = s1 * this.amount - left;
      buffer[1][i] = s2 * this.amount - right;
      this.index += 1;
      if (this.index >= this.left_buffer.length) {
        this.index = 0;
      }
    }
  };

  return Phaser;

})();

Flanger = (function() {
  function Flanger(engine) {
    this.engine = engine;
    this.sampleRate = this.engine.sampleRate;
    this.left_buffer = new Float64Array(this.sampleRate);
    this.right_buffer = new Float64Array(this.sampleRate);
    this.phase1 = 0;
    this.phase2 = 0;
    this.f1 = .0573 / this.sampleRate;
    this.f2 = .0497 / this.sampleRate;
    this.index = 0;
  }

  Flanger.prototype.update = function(data) {
    this.amount = data.amount;
    return this.rate = data.rate;
  };

  Flanger.prototype.read = function(buffer, pos) {
    var a, i;
    if (pos < 0) {
      pos += buffer.length;
    }
    i = Math.floor(pos);
    a = pos - i;
    return buffer[i] * (1 - a) + buffer[(i + 1) % buffer.length] * a;
  };

  Flanger.prototype.process = function(buffer, length) {
    var i, left, o, o1, o2, p1, p2, ref, right, s1, s2;
    for (i = o = 0, ref = length - 1; o <= ref; i = o += 1) {
      left = buffer[0][i];
      right = buffer[1][i];
      this.phase1 += this.f1;
      this.phase2 += this.f2;
      o1 = (1 + Math.sin(this.phase1 * Math.PI * 2)) / 2;
      p1 = this.sampleRate * (.0001 + .05 * o1);
      o2 = (1 + Math.sin(this.phase2 * Math.PI * 2)) / 2;
      p2 = this.sampleRate * (.0001 + .05 * o2);
      if (this.phase1 >= 1) {
        this.phase1 -= 1;
      }
      if (this.phase2 >= 1) {
        this.phase2 -= 1;
      }
      this.left_buffer[this.index] = left;
      this.right_buffer[this.index] = right;
      s1 = this.read(this.left_buffer, this.index - p1);
      s2 = this.read(this.right_buffer, this.index - p2);
      this.left_buffer[this.index] += s1 * this.rate * .9;
      this.right_buffer[this.index] += s2 * this.rate * .9;
      buffer[0][i] = s1 * this.amount + left;
      buffer[1][i] = s2 * this.amount + right;
      this.index += 1;
      if (this.index >= this.left_buffer.length) {
        this.index = 0;
      }
    }
  };

  return Flanger;

})();

Delay = (function() {
  function Delay(engine) {
    this.engine = engine;
    this.sampleRate = this.engine.sampleRate;
    this.left_buffer = new Float64Array(this.sampleRate * 3);
    this.right_buffer = new Float64Array(this.sampleRate * 3);
    this.index = 0;
  }

  Delay.prototype.update = function(data) {
    var tempo, tick;
    this.amount = data.amount;
    this.rate = data.rate;
    tempo = (30 + Math.pow(this.rate, 2) * 170 * 4) * 4;
    tick = this.sampleRate / (tempo / 60);
    this.L = Math.round(tick * 4);
    this.R = Math.round(tick * 4 + this.sampleRate * 0.00075);
    return this.fb = this.amount * .95;
  };

  Delay.prototype.process = function(buffer, length) {
    var i, left, o, ref, right;
    for (i = o = 0, ref = length - 1; o <= ref; i = o += 1) {
      left = buffer[0][i];
      right = buffer[1][i];
      left += this.right_buffer[(this.index + this.left_buffer.length - this.L) % this.left_buffer.length] * this.fb;
      right += this.left_buffer[(this.index + this.right_buffer.length - this.R) % this.right_buffer.length] * this.fb;
      buffer[0][i] = this.left_buffer[this.index] = left;
      buffer[1][i] = this.right_buffer[this.index] = right;
      this.index += 1;
      if (this.index >= this.left_buffer.length) {
        this.index = 0;
      }
    }
  };

  return Delay;

})();

Spatializer = (function() {
  function Spatializer(engine) {
    this.engine = engine;
    this.sampleRate = this.engine.sampleRate;
    this.left_buffer = new Float64Array(this.sampleRate / 10);
    this.right_buffer = new Float64Array(this.sampleRate / 10);
    this.index = 0;
    this.left_delay1 = 0;
    this.left_delay2 = 0;
    this.right_delay1 = 0;
    this.right_delay2 = 0;
    this.left = 0;
    this.right = 0;
    this.left_delay1 = Math.round(this.sampleRate * 9.7913 / 340);
    this.right_delay1 = Math.round(this.sampleRate * 11.1379 / 340);
    this.left_delay2 = Math.round(this.sampleRate * 11.3179 / 340);
    this.right_delay2 = Math.round(this.sampleRate * 12.7913 / 340);
  }

  Spatializer.prototype.process = function(buffer, length, spatialize, pan) {
    var i, left, left_buffer, left_pan, mnt, mnt2, o, ref, right, right_buffer, right_pan;
    mnt = spatialize;
    mnt2 = mnt * mnt;
    left_pan = Math.cos(pan * Math.PI / 2) / (1 + spatialize);
    right_pan = Math.sin(pan * Math.PI / 2) / (1 + spatialize);
    left_buffer = buffer[0];
    right_buffer = buffer[1];
    for (i = o = 0, ref = length - 1; o <= ref; i = o += 1) {
      left = left_buffer[i];
      right = right_buffer[i];
      this.left = left * .5 + this.left * .5;
      this.right = right * .5 + this.right * .5;
      this.left_buffer[this.index] = this.left;
      this.right_buffer[this.index] = this.right;
      left_buffer[i] = (left - mnt * this.right_buffer[(this.index + this.right_buffer.length - this.left_delay1) % this.right_buffer.length]) * left_pan;
      right_buffer[i] = (right - mnt * this.left_buffer[(this.index + this.right_buffer.length - this.right_delay1) % this.right_buffer.length]) * right_pan;
      this.index += 1;
      if (this.index >= this.left_buffer.length) {
        this.index = 0;
      }
    }
  };

  return Spatializer;

})();

EQ = (function() {
  function EQ(engine) {
    var alpha, cosw0, invOnePlusAlpha, oneLessCosw0, q, sinw0, w0;
    this.engine = engine;
    this.sampleRate = this.engine.sampleRate;
    this.mid = 900;
    q = .5;
    w0 = 2 * Math.PI * this.mid / this.sampleRate;
    cosw0 = Math.cos(w0);
    sinw0 = Math.sin(w0);
    alpha = sinw0 / (2 * q);
    invOnePlusAlpha = 1 / (1 + alpha);
    oneLessCosw0 = 1 - cosw0;
    this.a0 = (-2 * cosw0) * invOnePlusAlpha;
    this.a1 = (1 - alpha) * invOnePlusAlpha;
    this.b0 = q * alpha * invOnePlusAlpha;
    this.b1 = 0;
    this.b2 = -this.b0;
    this.llow = 0;
    this.rlow = 0;
    this.lfm0 = 0;
    this.lfm1 = 0;
    this.rfm0 = 0;
    this.rfm1 = 0;
    this.low = 1;
    this.mid = 1;
    this.high = 1;
  }

  EQ.prototype.update = function(data) {
    this.low = data.low * 2;
    this.mid = data.mid * 2;
    return this.high = data.high * 2;
  };

  EQ.prototype.processBandPass = function(sig, cutoff, q) {
    var w;
    w = sig - a0 * this.fm0 - a1 * this.fm1;
    sig = b0 * w + b1 * this.fm0 + b2 * this.fm1;
    this.fm1 = this.fm0;
    this.fm0 = w;
    return sig;
  };

  EQ.prototype.process = function(buffer, length) {
    var i, left, lhigh, lmid, lw, o, ref, rhigh, right, rmid, rw;
    for (i = o = 0, ref = length - 1; o <= ref; i = o += 1) {
      left = buffer[0][i];
      right = buffer[1][i];
      lw = left - this.a0 * this.lfm0 - this.a1 * this.lfm1;
      lmid = this.b0 * lw + this.b1 * this.lfm0 + this.b2 * this.lfm1;
      this.lfm1 = this.lfm0;
      this.lfm0 = lw;
      left -= lmid;
      this.llow = left * .1 + this.llow * .9;
      lhigh = left - this.llow;
      buffer[0][i] = this.llow * this.low + lmid * this.mid + lhigh * this.high;
      rw = right - this.a0 * this.rfm0 - this.a1 * this.rfm1;
      rmid = this.b0 * rw + this.b1 * this.rfm0 + this.b2 * this.rfm1;
      this.rfm1 = this.rfm0;
      this.rfm0 = rw;
      right -= rmid;
      this.rlow = right * .1 + this.rlow * .9;
      rhigh = right - this.rlow;
      buffer[1][i] = this.rlow * this.low + rmid * this.mid + rhigh * this.high;
    }
  };

  return EQ;

})();

CombFilter = (function() {
  function CombFilter(length1, feedback1) {
    this.length = length1;
    this.feedback = feedback1 != null ? feedback1 : .5;
    this.buffer = new Float64Array(this.length);
    this.index = 0;
    this.store = 0;
    this.damp = .2;
  }

  CombFilter.prototype.process = function(input) {
    var output;
    output = this.buffer[this.index];
    this.store = output * (1 - this.damp) + this.store * this.damp;
    this.buffer[this.index++] = input + this.store * this.feedback;
    if (this.index >= this.length) {
      this.index = 0;
    }
    return output;
  };

  return CombFilter;

})();

AllpassFilter = (function() {
  function AllpassFilter(length1, feedback1) {
    this.length = length1;
    this.feedback = feedback1 != null ? feedback1 : .5;
    this.buffer = new Float64Array(this.length);
    this.index = 0;
  }

  AllpassFilter.prototype.process = function(input) {
    var bufout, output;
    bufout = this.buffer[this.index];
    output = -input + bufout;
    this.buffer[this.index++] = input + bufout * this.feedback;
    if (this.index >= this.length) {
      this.index = 0;
    }
    return output;
  };

  return AllpassFilter;

})();

Reverb = (function() {
  function Reverb(engine) {
    var a, allpasstuning, c, combtuning, len, len1, o, stereospread, u;
    this.engine = engine;
    this.sampleRate = this.engine.sampleRate;
    combtuning = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
    allpasstuning = [556, 441, 341, 225];
    stereospread = 23;
    this.left_combs = [];
    this.right_combs = [];
    this.left_allpass = [];
    this.right_allpass = [];
    this.res = [0, 0];
    this.spread = .25;
    this.wet = .025;
    for (o = 0, len = combtuning.length; o < len; o++) {
      c = combtuning[o];
      this.left_combs.push(new CombFilter(c, .9));
      this.right_combs.push(new CombFilter(c + stereospread, .9));
    }
    for (u = 0, len1 = allpasstuning.length; u < len1; u++) {
      a = allpasstuning[u];
      this.left_allpass.push(new AllpassFilter(a, .5));
      this.right_allpass.push(new AllpassFilter(a + stereospread, .5));
    }
  }

  Reverb.prototype.update = function(data) {
    var damp, feedback, i, o, ref;
    this.wet = data.amount * .05;
    feedback = .7 + Math.pow(data.rate, .25) * .29;
    damp = .2;
    for (i = o = 0, ref = this.left_combs.length - 1; o <= ref; i = o += 1) {
      this.left_combs[i].feedback = feedback;
      this.right_combs[i].feedback = feedback;
      this.left_combs[i].damp = damp;
      this.right_combs[i].damp = damp;
    }
    return this.spread = .5 - data.rate * .5;
  };

  Reverb.prototype.process = function(buffer, length) {
    var i, input, left, o, outL, outR, ref, ref1, ref2, right, s, u, y;
    for (s = o = 0, ref = length - 1; o <= ref; s = o += 1) {
      outL = 0;
      outR = 0;
      left = buffer[0][s];
      right = buffer[1][s];
      input = (left + right) * .5;
      for (i = u = 0, ref1 = this.left_combs.length - 1; 0 <= ref1 ? u <= ref1 : u >= ref1; i = 0 <= ref1 ? ++u : --u) {
        outL += this.left_combs[i].process(input);
        outR += this.right_combs[i].process(input);
      }
      for (i = y = 0, ref2 = this.left_allpass.length - 1; 0 <= ref2 ? y <= ref2 : y >= ref2; i = 0 <= ref2 ? ++y : --y) {
        outL = this.left_allpass[i].process(outL);
        outR = this.right_allpass[i].process(outR);
      }
      buffer[0][s] = (outL * (1 - this.spread) + outR * this.spread) * this.wet + left * (1 - this.wet);
      buffer[1][s] = (outR * (1 - this.spread) + outL * this.spread) * this.wet + right * (1 - this.wet);
    }
  };

  return Reverb;

})();

Voice = (function() {
  Voice.oscillators = [SawOscillator, SquareOscillator, SineOscillator, VoiceOscillator, StringOscillator];

  function Voice(engine) {
    this.engine = engine;
    this.osc1 = new SineOscillator(this);
    this.osc2 = new SineOscillator(this);
    this.noise = new Noise(this);
    this.lfo1 = new LFO(this);
    this.lfo2 = new LFO(this);
    this.filter = new Filter(this);
    this.env1 = new AmpEnvelope(this);
    this.env2 = new ModEnvelope(this);
    this.filter_increment = 0.0005 * 44100 / this.engine.sampleRate;
    this.modulation = 0;
    this.noteon_time = 0;
  }

  Voice.prototype.init = function(layer) {
    if (!(this.osc1 instanceof Voice.oscillators[layer.inputs.osc1.type])) {
      this.osc1 = new Voice.oscillators[layer.inputs.osc1.type](this);
    }
    if (!(this.osc2 instanceof Voice.oscillators[layer.inputs.osc2.type])) {
      this.osc2 = new Voice.oscillators[layer.inputs.osc2.type](this);
    }
    this.osc1.init(layer.inputs.osc1, layer.inputs.sync);
    this.osc2.init(layer.inputs.osc2, layer.inputs.sync);
    this.noise.init(layer, layer.inputs.sync);
    this.lfo1.init(layer.inputs.lfo1, layer.inputs.sync);
    this.lfo2.init(layer.inputs.lfo2, layer.inputs.sync);
    this.filter.init(layer);
    this.env1.init(layer.inputs.env1);
    this.env2.init(layer.inputs.env2);
    return this.updateConstantMods();
  };

  Voice.prototype.update = function() {
    if (this.layer == null) {
      return;
    }
    if (!(this.osc1 instanceof Voice.oscillators[this.layer.inputs.osc1.type])) {
      this.osc1 = new Voice.oscillators[this.layer.inputs.osc1.type](this, this.layer.inputs.osc1);
    }
    if (!(this.osc2 instanceof Voice.oscillators[this.layer.inputs.osc2.type])) {
      this.osc2 = new Voice.oscillators[this.layer.inputs.osc2.type](this, this.layer.inputs.osc2);
    }
    this.osc1.update(this.layer.inputs.osc1, this.layer.inputs.sync);
    this.osc2.update(this.layer.inputs.osc2, this.layer.inputs.sync);
    this.env1.update();
    this.env2.update();
    this.lfo1.update();
    this.lfo2.update();
    this.filter.update();
    return this.updateConstantMods();
  };

  Voice.prototype.updateConstantMods = function() {
    var a, amp, c, mod, norm, p;
    this.osc1_amp = DBSCALE(this.inputs.osc1.amp, 3);
    this.osc2_amp = DBSCALE(this.inputs.osc2.amp, 3);
    this.osc1_mod = this.inputs.osc1.mod;
    this.osc2_mod = this.inputs.osc2.mod;
    this.noise_amp = DBSCALE(this.inputs.noise.amp, 3);
    this.noise_mod = this.inputs.noise.mod;
    if (this.inputs.velocity.amp > 0) {
      p = this.inputs.velocity.amp;
      p *= p;
      p *= 4;
      norm = this.inputs.velocity.amp * 4;
      amp = Math.exp(this.velocity * norm) / Math.exp(norm);
    } else {
      amp = 1;
    }
    this.osc1_amp *= amp;
    this.osc2_amp *= amp;
    this.noise_amp *= amp;
    c = Math.log(1024 * this.freq / 22000) / (10 * Math.log(2));
    this.cutoff_keymod = (c - .5) * this.inputs.filter.follow;
    this.cutoff_base = this.inputs.filter.cutoff + this.cutoff_keymod;
    this.env2_amount = this.inputs.env2.amount;
    this.lfo1_rate = this.inputs.lfo1.rate;
    this.lfo1_amount = this.inputs.lfo1.amount;
    this.lfo2_rate = this.inputs.lfo2.rate;
    this.lfo2_amount = this.inputs.lfo2.amount;
    switch (this.inputs.velocity.out) {
      case 0:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.osc1_mod = Math.min(1, Math.max(0, this.osc1_mod + mod));
        this.osc2_mod = Math.min(1, Math.max(0, this.osc2_mod + mod));
        break;
      case 1:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.cutoff_base += mod;
        break;
      case 3:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.osc1_mod = Math.min(1, Math.max(0, this.osc1_mod + mod));
        break;
      case 4:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.osc1_amp = Math.max(0, this.osc1_amp + mod);
        break;
      case 5:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.osc2_mod = Math.min(1, Math.max(0, this.osc2_mod + mod));
        break;
      case 6:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.osc2_amp = Math.max(0, this.osc2_amp + mod);
        break;
      case 7:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.noise_amp = Math.max(0, this.noise_amp + mod);
        break;
      case 8:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.noise_mod = Math.min(1, Math.max(0, this.noise_mod + mod));
        break;
      case 9:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        a = Math.max(0, Math.min(this.inputs.env1.a + mod, 1));
        this.env1.update(a);
        break;
      case 10:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        a = Math.max(0, Math.min(this.inputs.env2.a + mod, 1));
        this.env2.update(a);
        break;
      case 11:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.env2_amount = Math.max(0, Math.min(1, this.env2_amount + mod));
        break;
      case 12:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.lfo1_amount = Math.max(0, this.lfo1_amount + mod);
        break;
      case 13:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.lfo1_rate = Math.min(1, Math.max(0, this.lfo1_rate + mod));
        break;
      case 14:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.lfo2_amount = Math.max(0, this.lfo2_amount + mod);
        break;
      case 15:
        mod = this.velocity * (this.inputs.velocity.amount - .5) * 2;
        this.lfo2_rate = Math.min(1, Math.max(0, this.lfo2_rate + mod));
    }
    if (this.freq != null) {
      c = Math.log(1024 * this.freq / 22000) / (10 * Math.log(2));
      return this.cutoff_keymod = (c - .5) * this.inputs.filter.follow;
    }
  };

  Voice.prototype.noteOn = function(layer, key1, velocity, legato) {
    var glide_time;
    this.key = key1;
    if (legato == null) {
      legato = false;
    }
    this.velocity = velocity / 127;
    if (this.layer != null) {
      this.layer.removeVoice(this);
    }
    this.layer = layer;
    this.inputs = this.layer.inputs;
    if (legato && this.on) {
      this.freq = 440 * Math.pow(Math.pow(2, 1 / 12), this.key - 57);
      if (layer.last_key != null) {
        this.glide_from = layer.last_key;
        this.glide = true;
        this.glide_phase = 0;
        glide_time = (this.inputs.glide * .025 + Math.pow(this.inputs.glide, 16) * .975) * 10;
        this.glide_inc = 1 / (glide_time * this.engine.sampleRate + 1);
      }
    } else {
      this.freq = 440 * Math.pow(Math.pow(2, 1 / 12), this.key - 57);
      this.init(this.layer);
      this.on = true;
      this.cutoff = 0;
      this.modulation = this.layer.instrument.modulation;
      this.pitch_bend = this.layer.instrument.pitch_bend;
      this.modulation_v = 0;
      this.pitch_bend_v = 0;
    }
    return this.noteon_time = Date.now();
  };

  Voice.prototype.noteOff = function() {
    return this.on = false;
  };

  Voice.prototype.process = function() {
    var cutoff, f, k, lfo1_amount, lfo1_rate, lfo2_amount, lfo2_rate, mod, noise_amp, noise_mod, osc1_amp, osc1_freq, osc1_mod, osc2_amp, osc2_freq, osc2_mod, p, q, s1, s2, sig;
    osc1_mod = this.osc1_mod;
    osc2_mod = this.osc2_mod;
    osc1_amp = this.osc1_amp;
    osc2_amp = this.osc2_amp;
    if (this.glide) {
      k = this.glide_from * (1 - this.glide_phase) + this.key * this.glide_phase;
      osc1_freq = osc2_freq = 440 * Math.pow(Math.pow(2, 1 / 12), k - 57);
      this.glide_phase += this.glide_inc;
      if (this.glide_phase >= 1) {
        this.glide = false;
      }
    } else {
      osc1_freq = osc2_freq = this.freq;
    }
    if (Math.abs(this.pitch_bend - this.layer.instrument.pitch_bend) > .0001) {
      this.pitch_bend_v += .001 * (this.layer.instrument.pitch_bend - this.pitch_bend);
      this.pitch_bend_v *= .5;
      this.pitch_bend += this.pitch_bend_v;
    }
    if (Math.abs(this.pitch_bend - .5) > .0001) {
      p = this.pitch_bend * 2 - 1;
      p *= 2;
      f = Math.pow(Math.pow(2, 1 / 12), p);
      osc1_freq *= f;
      osc2_freq *= f;
    }
    noise_amp = this.noise_amp;
    noise_mod = this.noise_mod;
    lfo1_rate = this.lfo1_rate;
    lfo1_amount = this.lfo1_amount;
    lfo2_rate = this.lfo2_rate;
    lfo2_amount = this.lfo2_amount;
    cutoff = this.cutoff_base;
    q = this.inputs.filter.resonance;
    if (Math.abs(this.modulation - this.layer.instrument.modulation) > .0001) {
      this.modulation_v += .001 * (this.layer.instrument.modulation - this.modulation);
      this.modulation_v *= .5;
      this.modulation += this.modulation_v;
    }
    switch (this.inputs.modulation.out) {
      case 0:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        osc1_amp = Math.max(0, osc1_amp + mod);
        osc2_amp = Math.max(0, osc2_amp + mod);
        noise_amp = Math.max(0, noise_amp * (1 + mod));
        break;
      case 1:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        osc1_mod = Math.min(1, Math.max(0, osc1_mod + mod));
        osc2_mod = Math.min(1, Math.max(0, osc2_mod + mod));
        break;
      case 2:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        osc1_amp = Math.max(0, osc1_amp + mod);
        break;
      case 3:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        osc1_mod = Math.min(1, Math.max(0, osc1_mod + mod));
        break;
      case 4:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        osc2_amp = Math.max(0, osc2_amp + mod);
        break;
      case 5:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        osc2_mod = Math.min(1, Math.max(0, osc2_mod + mod));
        break;
      case 6:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        noise_amp = Math.max(0, noise_amp + mod);
        break;
      case 7:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        noise_mod = Math.min(1, Math.max(0, noise_mod + mod));
        break;
      case 8:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        cutoff += mod;
        break;
      case 9:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        q = Math.max(0, Math.min(1, q + mod));
        break;
      case 10:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        lfo1_amount = Math.max(0, Math.min(1, lfo1_amount + mod));
        break;
      case 11:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        lfo1_rate = Math.max(0, Math.min(1, lfo1_rate + mod));
        break;
      case 12:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        lfo2_amount = Math.max(0, Math.min(1, lfo2_amount + mod));
        break;
      case 13:
        mod = (this.inputs.modulation.amount - .5) * 2 * this.modulation;
        lfo2_rate = Math.max(0, Math.min(1, lfo2_rate + mod));
    }
    switch (this.inputs.env2.out) {
      case 0:
        cutoff += this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        break;
      case 1:
        q = Math.max(0, Math.min(1, this.env2.process(this.on) * (this.env2_amount * 2 - 1)));
        break;
      case 2:
        mod = this.env2_amount * 2 - 1;
        mod *= this.env2.process(this.on);
        mod = 1 + mod;
        osc1_freq *= mod;
        osc2_freq *= mod;
        break;
      case 3:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        osc1_mod = Math.min(1, Math.max(0, osc1_mod + mod));
        osc2_mod = Math.min(1, Math.max(0, osc2_mod + mod));
        break;
      case 4:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        osc1_amp = Math.max(0, osc1_amp + mod);
        osc2_amp = Math.max(0, osc2_amp + mod);
        noise_amp = Math.max(0, noise_amp * (1 + mod));
        break;
      case 5:
        mod = this.env2_amount * 2 - 1;
        mod *= this.env2.process(this.on);
        osc1_freq *= 1 + mod;
        break;
      case 6:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        osc1_mod = Math.min(1, Math.max(0, osc1_mod + mod));
        break;
      case 7:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        osc1_amp = Math.max(0, osc1_amp + mod);
        break;
      case 8:
        mod = this.env2_amount * 2 - 1;
        mod *= this.env2.process(this.on);
        osc1_freq *= 1 + mod;
        break;
      case 9:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        osc2_mod = Math.min(1, Math.max(0, osc2_mod + mod));
        break;
      case 10:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        osc2_amp = Math.max(0, osc2_amp + mod);
        break;
      case 11:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        noise_amp = Math.max(0, noise_amp + mod);
        break;
      case 12:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        noise_mod = Math.min(1, Math.max(0, noise_mod + mod));
        break;
      case 13:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        lfo1_amount = Math.min(1, Math.max(0, lfo1_amount + mod));
        break;
      case 14:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        lfo1_rate = Math.min(1, Math.max(0, lfo1_rate + mod));
        break;
      case 15:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        lfo2_amount = Math.min(1, Math.max(0, lfo2_amount + mod));
        break;
      case 16:
        mod = this.env2.process(this.on) * (this.env2_amount * 2 - 1);
        lfo2_rate = Math.min(1, Math.max(0, lfo2_rate + mod));
    }
    switch (this.inputs.lfo1.out) {
      case 0:
        mod = lfo1_amount;
        if (this.inputs.lfo1.audio) {
          mod = 1 + mod * mod * this.lfo1.process(lfo1_rate) * 16;
        } else {
          mod = 1 + mod * mod * this.lfo1.process(lfo1_rate);
        }
        osc1_freq *= mod;
        osc2_freq *= mod;
        break;
      case 1:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        osc1_mod = Math.min(1, Math.max(0, osc1_mod + mod));
        osc2_mod = Math.min(1, Math.max(0, osc2_mod + mod));
        break;
      case 2:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        osc1_amp = Math.max(0, osc1_amp + mod);
        osc2_amp = Math.max(0, osc2_amp + mod);
        noise_amp = Math.max(0, noise_amp * (1 + mod));
        break;
      case 3:
        mod = lfo1_amount;
        mod = 1 + mod * mod * this.lfo1.process(lfo1_rate);
        osc1_freq *= mod;
        break;
      case 4:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        osc1_mod = Math.min(1, Math.max(0, osc1_mod + mod));
        break;
      case 5:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        osc1_amp = Math.max(0, osc1_amp + mod);
        break;
      case 6:
        mod = lfo1_amount;
        mod = 1 + mod * mod * this.lfo1.process(lfo1_rate);
        osc2_freq *= mod;
        break;
      case 7:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        osc2_mod = Math.min(1, Math.max(0, osc2_mod + mod));
        break;
      case 8:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        osc2_amp = Math.max(0, osc2_amp + mod);
        break;
      case 9:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        noise_amp = Math.max(0, noise_amp + mod);
        break;
      case 10:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        noise_mod = Math.min(1, Math.max(0, noise_mod + mod));
        break;
      case 11:
        cutoff += this.lfo1.process(lfo1_rate) * lfo1_amount;
        break;
      case 12:
        q = Math.max(0, Math.min(1, this.lfo1.process(lfo1_rate) * lfo1_amount));
        break;
      case 13:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        lfo2_amount = Math.min(1, Math.max(0, lfo2_amount + mod));
        break;
      case 14:
        mod = this.lfo1.process(lfo1_rate) * lfo1_amount;
        lfo2_rate = Math.min(1, Math.max(0, lfo2_rate + mod));
    }
    switch (this.inputs.lfo2.out) {
      case 0:
        mod = lfo2_amount;
        if (this.inputs.lfo2.audio) {
          mod = 1 + mod * mod * this.lfo2.process(lfo2_rate) * 16;
        } else {
          mod = 1 + mod * mod * this.lfo2.process(lfo2_rate);
        }
        osc1_freq *= mod;
        osc2_freq *= mod;
        break;
      case 1:
        mod = this.lfo2.process(lfo2_rate) * lfo2_amount;
        osc1_mod = Math.min(1, Math.max(0, osc1_mod + mod));
        osc2_mod = Math.min(1, Math.max(0, osc2_mod + mod));
        break;
      case 2:
        mod = this.lfo2.process(lfo2_rate) * lfo2_amount;
        osc1_amp = Math.max(0, osc1_amp + mod);
        osc2_amp = Math.max(0, osc2_amp + mod);
        noise_amp = Math.max(0, noise_amp * (1 + mod));
        break;
      case 3:
        mod = lfo2_amount;
        mod = 1 + mod * mod * this.lfo2.process(lfo2_rate);
        osc1_freq *= mod;
        break;
      case 4:
        mod = this.lfo2.process(lfo2_rate) * lfo2_amount;
        osc1_mod = Math.min(1, Math.max(0, osc1_mod + mod));
        break;
      case 5:
        mod = this.lfo2.process(lfo2_rate) * lfo2_amount;
        osc1_amp = Math.max(0, osc1_amp + mod);
        break;
      case 6:
        mod = lfo2_amount;
        mod = 1 + mod * mod * this.lfo2.process(lfo2_rate);
        osc2_freq *= mod;
        break;
      case 7:
        mod = this.lfo2.process(lfo2_rate) * lfo2_amount;
        osc2_mod = Math.min(1, Math.max(0, osc2_mod + mod));
        break;
      case 8:
        mod = this.lfo2.process(lfo2_rate) * lfo2_amount;
        osc2_amp = Math.max(0, osc2_amp + mod);
        break;
      case 9:
        mod = this.lfo2.process(lfo2_rate) * lfo2_amount;
        noise_amp = Math.max(0, noise_amp + mod);
        break;
      case 10:
        mod = this.lfo2.process(lfo2_rate) * lfo2_amount;
        noise_mod = Math.min(1, Math.max(0, noise_mod + mod));
        break;
      case 11:
        cutoff += this.lfo2.process(lfo2_rate) * lfo2_amount;
        break;
      case 12:
        q = Math.max(0, Math.min(1, this.lfo2.process(lfo2_rate) * lfo2_amount));
    }
    switch (this.inputs.combine) {
      case 1:
        s1 = this.osc1.process(osc1_freq, osc1_mod) * osc1_amp;
        s2 = this.osc2.process(osc2_freq, osc2_mod) * osc2_amp;
        sig = (s1 + s2) * (s1 + s2);
        break;
      case 2:
        sig = this.osc2.process(osc2_freq * Math.max(0, 1 - this.osc1.process(osc1_freq, osc1_mod) * osc1_amp), osc2_mod) * osc2_amp;
        break;
      default:
        sig = this.osc1.process(osc1_freq, osc1_mod) * osc1_amp + this.osc2.process(osc2_freq, osc2_mod) * osc2_amp;
    }
    if (noise_amp > 0) {
      sig += this.noise.process(noise_mod) * noise_amp;
    }
    mod = this.env2.process(this.on);
    if (!this.cutoff) {
      this.cutoff = cutoff;
    } else {
      if (this.cutoff < cutoff) {
        this.cutoff += Math.min(cutoff - this.cutoff, this.filter_increment);
      } else if (this.cutoff > cutoff) {
        this.cutoff += Math.max(cutoff - this.cutoff, -this.filter_increment);
      }
      cutoff = this.cutoff;
    }
    cutoff = Math.pow(2, Math.max(0, Math.min(cutoff, 1)) * 10) * 22000 / 1024;
    sig *= this.env1.process(this.on);
    return sig = this.filter.process(sig, cutoff, q * q * 9.5 + .5);
  };

  return Voice;

})();

Instrument = (function() {
  function Instrument(engine) {
    this.engine = engine;
    this.layers = [];
    this.layers.push(new Layer(this));
    this.modulation = 0;
    this.pitch_bend = .5;
  }

  Instrument.prototype.noteOn = function(key, velocity) {
    var l, len, o, ref;
    ref = this.layers;
    for (o = 0, len = ref.length; o < len; o++) {
      l = ref[o];
      l.noteOn(key, velocity);
    }
  };

  Instrument.prototype.noteOff = function(key) {
    var l, len, o, ref;
    ref = this.layers;
    for (o = 0, len = ref.length; o < len; o++) {
      l = ref[o];
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
    var i, l, left, len, len1, o, ref, ref1, ref2, right, u, y;
    if (false) {
      this.layers[0].process(length);
      return this.output = this.layers[0].output;
    } else {
      if ((this.output == null) || this.output[0].length < length) {
        this.output = [new Float64Array(length), new Float64Array(length)];
      }
      ref = this.layers;
      for (o = 0, len = ref.length; o < len; o++) {
        l = ref[o];
        l.process(length);
      }
      for (i = u = 0, ref1 = length - 1; u <= ref1; i = u += 1) {
        left = 0;
        right = 0;
        ref2 = this.layers;
        for (y = 0, len1 = ref2.length; y < len1; y++) {
          l = ref2[y];
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
    var len, o, ref, v;
    ref = this.voices;
    for (o = 0, len = ref.length; o < len; o++) {
      v = ref[o];
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
    var i, len, o, ref, ref1, ref2, sig, u, v, y;
    if ((this.output == null) || this.output[0].length < length) {
      this.output = [new Float64Array(length), new Float64Array(length)];
    }
    for (i = o = ref = this.voices.length - 1; o >= 0; i = o += -1) {
      v = this.voices[i];
      if (!v.on && v.env1.sig < .00001) {
        v.env1.sig = 0;
        this.removeVoice(v);
      }
    }
    for (i = u = 0, ref1 = length - 1; u <= ref1; i = u += 1) {
      sig = 0;
      ref2 = this.voices;
      for (y = 0, len = ref2.length; y < len; y++) {
        v = ref2[y];
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

AudioEngine = (function() {
  function AudioEngine(sampleRate) {
    var i, o, ref;
    this.sampleRate = sampleRate;
    this.voices = [];
    this.voice_index = 0;
    this.num_voices = 8;
    for (i = o = 0, ref = this.num_voices - 1; 0 <= ref ? o <= ref : o >= ref; i = 0 <= ref ? ++o : --o) {
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
    var best, i, o, ref, v;
    best = this.voices[0];
    for (i = o = 1, ref = this.voices.length - 1; 1 <= ref ? o <= ref : o >= ref; i = 1 <= ref ? ++o : --o) {
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
    var l, len, len1, o, ref, ref1, u, v;
    ref = this.voices;
    for (o = 0, len = ref.length; o < len; o++) {
      v = ref[o];
      v.update();
    }
    ref1 = this.instruments[0].layers;
    for (u = 0, len1 = ref1.length; u < len1; u++) {
      l = ref1[u];
      l.update();
    }
  };

  AudioEngine.prototype.process = function(inputs, outputs, parameters) {
    var channel, i, inst, j, len, len1, len2, o, output, ref, ref1, ref2, res, sig, time, u, y, z;
    output = outputs[0];
    time = Date.now();
    res = [0, 0];
    ref = this.instruments;
    for (o = 0, len = ref.length; o < len; o++) {
      inst = ref[o];
      inst.process(output[0].length);
    }
    for (i = u = 0, len1 = output.length; u < len1; i = ++u) {
      channel = output[i];
      if (i < 2) {
        for (j = y = 0, ref1 = channel.length - 1; y <= ref1; j = y += 1) {
          sig = 0;
          ref2 = this.instruments;
          for (z = 0, len2 = ref2.length; z < len2; z++) {
            inst = ref2[z];
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

Blip = (function() {
  function Blip() {
    var i, norm, o, p, ref, ref1, u, x, y;
    this.size = 512;
    this.samples = new Float64Array(this.size + 1);
    for (p = o = 1; o <= 31; p = o += 2) {
      for (i = u = 0, ref = this.size; u <= ref; i = u += 1) {
        x = (i / this.size - .5) * .5;
        this.samples[i] += Math.sin(x * 2 * Math.PI * p) / p;
      }
    }
    norm = this.samples[this.size];
    for (i = y = 0, ref1 = this.size; y <= ref1; i = y += 1) {
      this.samples[i] /= norm;
    }
  }

  return Blip;

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
