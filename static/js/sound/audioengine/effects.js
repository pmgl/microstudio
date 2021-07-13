var AllpassFilter, BitCrusher, Chorus, CombFilter, Delay, Distortion, EQ, Flanger, Phaser, Reverb, Spatializer;

Distortion = (function() {
  function Distortion() {
    this.amount = .5;
    this.rate = .5;
    this.left = this.right = 0;
  }

  Distortion.prototype.update = function(data) {
    this.amount = data.amount;
    return this.rate = data.rate;
  };

  Distortion.prototype.process = function(buffer, length) {
    var disto, i, j, ref, s, sig;
    for (i = j = 0, ref = length - 1; j <= ref; i = j += 1) {
      sig = buffer[0][i];
      sig = this.left = this.left * .5 + sig * .5;
      s = sig * (1 + this.rate * this.rate * 99);
      disto = s < 0 ? -1 + Math.exp(s) : 1 - Math.exp(-s);
      buffer[0][i] = (1 - this.amount) * sig + this.amount * disto;
      sig = buffer[1][i];
      sig = this.right = this.right * .5 + sig * .5;
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
    return this.rate = Math.pow(2, (1 - data.rate) * 8);
  };

  BitCrusher.prototype.process = function(buffer, length) {
    var i, j, left, ref, right;
    for (i = j = 0, ref = length - 1; j <= ref; i = j += 1) {
      this.phase += 1;
      if (this.phase > this.amount) {
        this.phase -= this.amount;
        left = buffer[0][i];
        right = buffer[1][i];
        this.left = Math.round(left * this.rate) / this.rate;
        this.right = Math.round(right * this.rate) / this.rate;
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
    var i, j, left, p1, p2, p3, pleft, pright, ref, right, s1, s2, s3;
    for (i = j = 0, ref = length - 1; j <= ref; i = j += 1) {
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
    var i, j, left, o1, o2, p1, p2, ref, right, s1, s2;
    for (i = j = 0, ref = length - 1; j <= ref; i = j += 1) {
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
    var i, j, left, o1, o2, p1, p2, ref, right, s1, s2;
    for (i = j = 0, ref = length - 1; j <= ref; i = j += 1) {
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
    this.ml = 0;
    this.mr = 0;
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
    var i, j, left, ref, right;
    for (i = j = 0, ref = length - 1; j <= ref; i = j += 1) {
      left = buffer[0][i];
      right = buffer[1][i];
      left += this.right_buffer[(this.index + this.left_buffer.length - this.L) % this.left_buffer.length] * this.fb;
      right += this.left_buffer[(this.index + this.right_buffer.length - this.R) % this.right_buffer.length] * this.fb;
      buffer[0][i] = left;
      buffer[1][i] = right;
      this.left_buffer[this.index] = this.ml = this.ml * .5 + left * .5;
      this.right_buffer[this.index] = this.mr = this.mr * .5 + right * .5;
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
    this.left_delay = 577;
    this.right_delay = 733;
  }

  Spatializer.prototype.process = function(buffer, length, spatialize, pan) {
    var i, j, left, left_buffer, left_pan, mnt, ref, right, right_buffer, right_pan;
    mnt = spatialize;
    left_pan = Math.cos(pan * Math.PI / 2) / (1 + spatialize);
    right_pan = Math.sin(pan * Math.PI / 2) / (1 + spatialize);
    left_buffer = buffer[0];
    right_buffer = buffer[1];
    for (i = j = 0, ref = length - 1; j <= ref; i = j += 1) {
      left = left_buffer[i];
      right = right_buffer[i];
      this.left = left * .1 + this.left * .9;
      this.right = right * .1 + this.right * .9;
      this.left_buffer[this.index] = this.left;
      this.right_buffer[this.index] = this.right;
      left_buffer[i] = (left + mnt * this.right_buffer[(this.index + this.right_buffer.length - this.left_delay) % this.right_buffer.length]) * left_pan;
      right_buffer[i] = (right + mnt * this.left_buffer[(this.index + this.right_buffer.length - this.right_delay) % this.right_buffer.length]) * right_pan;
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
    var i, j, left, lhigh, lmid, lw, ref, rhigh, right, rmid, rw;
    for (i = j = 0, ref = length - 1; j <= ref; i = j += 1) {
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
    var a, allpasstuning, c, combtuning, j, k, len, len1, stereospread;
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
    for (j = 0, len = combtuning.length; j < len; j++) {
      c = combtuning[j];
      this.left_combs.push(new CombFilter(c, .9));
      this.right_combs.push(new CombFilter(c + stereospread, .9));
    }
    for (k = 0, len1 = allpasstuning.length; k < len1; k++) {
      a = allpasstuning[k];
      this.left_allpass.push(new AllpassFilter(a, .5));
      this.right_allpass.push(new AllpassFilter(a + stereospread, .5));
    }
  }

  Reverb.prototype.update = function(data) {
    var damp, feedback, i, j, ref;
    this.wet = data.amount * .05;
    feedback = .7 + Math.pow(data.rate, .25) * .29;
    damp = .2;
    for (i = j = 0, ref = this.left_combs.length - 1; j <= ref; i = j += 1) {
      this.left_combs[i].feedback = feedback;
      this.right_combs[i].feedback = feedback;
      this.left_combs[i].damp = damp;
      this.right_combs[i].damp = damp;
    }
    return this.spread = .5 - data.rate * .5;
  };

  Reverb.prototype.process = function(buffer, length) {
    var i, input, j, k, l, left, outL, outR, ref, ref1, ref2, right, s;
    for (s = j = 0, ref = length - 1; j <= ref; s = j += 1) {
      outL = 0;
      outR = 0;
      left = buffer[0][s];
      right = buffer[1][s];
      input = (left + right) * .5;
      for (i = k = 0, ref1 = this.left_combs.length - 1; 0 <= ref1 ? k <= ref1 : k >= ref1; i = 0 <= ref1 ? ++k : --k) {
        outL += this.left_combs[i].process(input);
        outR += this.right_combs[i].process(input);
      }
      for (i = l = 0, ref2 = this.left_allpass.length - 1; 0 <= ref2 ? l <= ref2 : l >= ref2; i = 0 <= ref2 ? ++l : --l) {
        outL = this.left_allpass[i].process(outL);
        outR = this.right_allpass[i].process(outR);
      }
      buffer[0][s] = (outL * (1 - this.spread) + outR * this.spread) * this.wet + left * (1 - this.wet);
      buffer[1][s] = (outR * (1 - this.spread) + outL * this.spread) * this.wet + right * (1 - this.wet);
    }
  };

  return Reverb;

})();
