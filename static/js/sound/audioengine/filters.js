var Filter;

Filter = (function() {
  function Filter(voice) {
    this.voice = voice;
    this.sampleRate = this.voice.engine.sampleRate;
    this.invSampleRate = 1 / this.voice.engine.sampleRate;
    this.halfSampleRate = this.sampleRate * .5;
  }

  Filter.prototype.init = function(layer) {
    this.layer = layer;
    this.fm00 = 0;
    this.fm01 = 0;
    this.fm10 = 0;
    this.fm11 = 0;
    return this.update();
  };

  Filter.prototype.update = function() {
    switch (this.layer.inputs.filter.type) {
      case 0:
        this.process = this.processLowPass;
        break;
      case 1:
        this.process = this.processBandPass;
        break;
      case 2:
        this.process = this.processHighPass;
    }
    return this.slope = this.layer.inputs.filter.slope;
  };

  Filter.prototype.processHighPass = function(sig, cutoff, q) {
    var a0, a1, alpha, aw0, b0, b1, b2, cosw0, invOnePlusAlpha, iw0, onePlusCosw0, sinw0, w, w0;
    w0 = Math.max(0, Math.min(this.halfSampleRate, cutoff)) * this.invSampleRate;
    w0 *= 10000;
    iw0 = Math.floor(w0);
    aw0 = w0 - iw0;
    cosw0 = (1 - aw0) * SIN_TABLE[iw0 + 2500] + aw0 * SIN_TABLE[iw0 + 2501];
    sinw0 = (1 - aw0) * SIN_TABLE[iw0] + aw0 * SIN_TABLE[iw0 + 1];
    if (!this.slope) {
      q *= q;
    }
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
    if (this.slope) {
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
    if (!this.slope) {
      q *= q;
    }
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
    if (this.slope) {
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
    if (!this.slope) {
      q *= q;
    }
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
    if (this.slope) {
      w = sig - a0 * this.fm10 - a1 * this.fm11;
      sig = b0 * w + b1 * this.fm10 + b2 * this.fm11;
      this.fm11 = this.fm10;
      this.fm10 = w;
    }
    return sig;
  };

  return Filter;

})();
