var Voice;

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
    this.osc1_on = this.inputs.osc1.amp > 0 || this.inputs.lfo1.out === 5 || this.inputs.lfo2.out === 5 || this.inputs.env2.out === 7 || this.inputs.velocity.out === 4 || this.inputs.modulation.out === 2;
    this.osc2_on = this.inputs.osc2.amp > 0 || this.inputs.lfo1.out === 8 || this.inputs.lfo2.out === 8 || this.inputs.env2.out === 10 || this.inputs.velocity.out === 6 || this.inputs.modulation.out === 4;
    this.noise_on = this.inputs.noise.amp > 0 || this.inputs.lfo1.out === 9 || this.inputs.lfo2.out === 9 || this.inputs.env2.out === 11 || this.inputs.velocity.out === 7 || this.inputs.modulation.out === 6;
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

  Voice.prototype.noteOn = function(layer, key, velocity, legato) {
    var glide_time;
    this.key = key;
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
    var cutoff, f, k, lfo1_amount, lfo1_rate, lfo2_amount, lfo2_rate, mod, noise_amp, noise_mod, osc1_amp, osc1_freq, osc1_mod, osc2_amp, osc2_freq, osc2_mod, p, q, sig;
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
        osc1_amp *= Math.max(0, 1 + mod);
        osc2_amp *= Math.max(0, 1 + mod);
        noise_amp *= Math.max(0, 1 + mod);
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
        osc1_amp *= Math.max(0, 1 + mod);
        osc2_amp *= Math.max(0, 1 + mod);
        noise_amp *= Math.max(0, 1 + mod);
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
        osc1_amp *= Math.max(0, 1 + mod);
        osc2_amp *= Math.max(0, 1 + mod);
        noise_amp *= Math.max(0, 1 + mod);
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
        osc1_amp *= Math.max(0, 1 + mod);
        osc2_amp *= Math.max(0, 1 + mod);
        noise_amp *= Math.max(0, 1 + mod);
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
    if (this.osc1_on) {
      if (this.osc2_on) {
        sig = this.osc1.process(osc1_freq, osc1_mod) * osc1_amp + this.osc2.process(osc2_freq, osc2_mod) * osc2_amp;
      } else {
        sig = this.osc1.process(osc1_freq, osc1_mod) * osc1_amp;
      }
    } else if (this.osc2_on) {
      sig = this.osc2.process(osc2_freq, osc2_mod) * osc2_amp;
    } else {
      sig = 0;
    }
    if (this.noise_on) {
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
