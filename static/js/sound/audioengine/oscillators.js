var Noise, SawOscillator, SineOscillator, SquareOscillator, StringOscillator, VoiceOscillator;

SquareOscillator = (function() {
  function SquareOscillator(voice, osc) {
    this.voice = voice;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.tune = 1;
    this.buffer = new Float64Array(32);
    if (osc != null) {
      this.init(osc);
    }
  }

  SquareOscillator.prototype.init = function(osc, sync, antialias) {
    var i, j, ref;
    this.sync = sync;
    this.phase = this.sync ? 0 : Math.random();
    this.sig = -1;
    this.index = 0;
    this.update(osc, this.sync, antialias);
    for (i = j = 0, ref = this.buffer.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      this.buffer[i] = 0;
    }
  };

  SquareOscillator.prototype.update = function(osc, sync, antialias) {
    var c, fine;
    this.sync = sync;
    c = Math.round(osc.coarse * 48) / 48;
    fine = osc.tune * 2 - 1;
    fine = fine * (1 + fine * fine) * .5;
    this.tune = 1 * Math.pow(2, c * 4) * .25 * Math.pow(Math.pow(2, 1 / 12), fine);
    this.analog_tune = this.tune;
    return this.process = antialias ? this.processAntialias : this.processFM;
  };

  SquareOscillator.prototype.processFM = function(freq, mod) {
    var avg, dphase, m;
    m = .5 - mod * .49;
    avg = 1 - 2 * m;
    dphase = this.analog_tune * freq * this.invSampleRate;
    this.phase += dphase;
    while (this.phase < 0) {
      this.phase += 1;
    }
    while (this.phase >= 1) {
      this.phase -= 1;
    }
    return (this.phase < m ? 1 : -1) - avg;
  };

  SquareOscillator.prototype.processAntialias = function(freq, mod) {
    var a, avg, dp, dpi, i, index, j, k, m, sig;
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
        for (i = j = 0; j <= 31; i = j += 1) {
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
        for (i = k = 0; k <= 31; i = k += 1) {
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
  function SawOscillator(voice, osc) {
    this.voice = voice;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.tune = 1;
    this.buffer = new Float64Array(32);
    if (osc != null) {
      this.init(osc);
    }
  }

  SawOscillator.prototype.init = function(osc, sync, antialias) {
    var i, j, ref;
    this.sync = sync;
    this.phase = this.sync ? 0 : Math.random();
    this.sig = -1;
    this.index = 0;
    this.jumped = false;
    this.update(osc, this.sync, antialias);
    for (i = j = 0, ref = this.buffer.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      this.buffer[i] = 0;
    }
  };

  SawOscillator.prototype.update = function(osc, sync, antialias) {
    var c, fine;
    this.sync = sync;
    c = Math.round(osc.coarse * 48) / 48;
    fine = osc.tune * 2 - 1;
    fine = fine * (1 + fine * fine) * .5;
    this.tune = 1 * Math.pow(2, c * 4) * .25 * Math.pow(Math.pow(2, 1 / 12), fine);
    this.analog_tune = this.tune;
    return this.process = antialias ? this.processAntialias : this.processFM;
  };

  SawOscillator.prototype.processFM = function(freq, mod) {
    var dphase;
    dphase = this.analog_tune * freq * this.invSampleRate;
    this.phase += dphase;
    while (this.phase < 0) {
      this.phase += 1;
    }
    while (this.phase >= 1) {
      this.phase -= 1;
    }
    return (1 - mod) * (1 - 2 * this.phase) + mod * (1 - 4 * (this.phase % 0.5));
  };

  SawOscillator.prototype.processAntialias = function(freq, mod) {
    var a, dp, dphase, dpi, i, index, j, k, offset, sig, slope;
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
          for (i = j = 0; j <= 31; i = j += 1) {
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
        for (i = k = 0; k <= 31; i = k += 1) {
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
  function SineOscillator(voice, osc) {
    this.voice = voice;
    this.sampleRate = this.voice.engine.sampleRate;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.maxRatio = this.sampleRate / Math.PI / 5 / (2 * Math.PI);
    this.tune = 1;
    if (osc != null) {
      this.init(osc);
    }
  }

  SineOscillator.prototype.init = function(osc, sync) {
    this.sync = sync;
    this.phase = this.sync ? .25 : Math.random();
    return this.update(osc);
  };

  SineOscillator.prototype.update = function(osc, sync) {
    var c, fine;
    this.sync = sync;
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
    while (this.phase < 0) {
      this.phase += 1;
    }
    while (this.phase >= 1) {
      this.phase -= 1;
      this.analog_tune = this.sync ? this.tune : this.tune * (1 + (Math.random() - .5) * .002);
      this.dphase = this.analog_tune * this.invSampleRate;
    }
    m1 = mod * mod * this.modnorm * 4;
    m2 = mod * m1;
    p = this.phase;
    return this.sinWave2(p + m1 * this.sinWave2(p));
  };

  return SineOscillator;

})();

VoiceOscillator = (function() {
  function VoiceOscillator(voice, osc) {
    this.voice = voice;
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
  function StringOscillator(voice, osc) {
    this.voice = voice;
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
  function Noise(voice) {
    this.voice = voice;
  }

  Noise.prototype.init = function() {
    this.phase = 0;
    this.seed = 1382;
    return this.n = 0;
  };

  Noise.prototype.process = function(mod) {
    var high, low, white;
    this.seed = (this.seed * 13907 + 12345) & 0x7FFFFFFF;
    white = (this.seed / 0x80000000) * 2 - 1;
    this.n = this.n * .9 + white * .1;
    low = this.n;
    high = white - low;
    return 2 * (low * (1 - mod) + high * mod);
  };

  return Noise;

})();
