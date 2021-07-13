var Blip, DelayLine, Reverb, Synth;

Synth = (function() {
  function Synth() {
    var i, k, l;
    this.notes = [];
    this.blip = new Blip();
    this.reverb = new Reverb();
    this.inputs = {
      osc1_tune: .52,
      osc1_coarse: .5,
      osc1_amp: .5,
      osc2_tune: .47,
      osc2_coarse: 0,
      osc2_amp: .5,
      noise: 0,
      filter_cutoff: 1,
      filter_resonance: .5,
      filter_type: 0,
      filter_env_amount: .5,
      filter_slope: 1,
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
        r: .1
      },
      lfo1: {
        form: 0,
        amp: 0,
        rate: .5
      }
    };
    this.avg = 0;
    this.samples = 0;
    this.time = 0;
    this.sampleRate = 44100;
    this.sin_table = [];
    for (i = k = 0; k <= 10000; i = ++k) {
      this.sin_table[i] = Math.sin(i / 10000 * Math.PI * 2);
    }
    this.noise_table = [];
    for (i = l = 0; l <= 44099; i = ++l) {
      this.noise_table[i] = 2 * Math.random() - 1;
    }
  }

  Synth.prototype.event = function(data) {
    var i, k, note, ref, results;
    if (data[0] === 144 && data[2] > 0) {
      note = {
        note: data[1],
        freq: 440 * Math.pow(Math.pow(2, 1 / 12), data[1] - 57),
        phase1: Math.random(),
        phase2: Math.random(),
        sig1: 1,
        sig2: 1,
        velocity: data[2],
        fm00: 0,
        fm01: 0,
        fm10: 0,
        fm11: 0,
        tick: 0,
        env1: {
          phase: 0,
          sig: 0,
          amp: 0,
          out_sig: [],
          out_amp: []
        },
        env2: {
          phase: 0,
          sig: 0,
          amp: 0,
          out_sig: [],
          out_amp: []
        },
        osc_out: [],
        noise_out: [],
        noise: 0,
        lfo1: {
          phase: 0,
          rnd1: Math.random() * 2 - 1,
          rnd2: Math.random() * 2 - 1,
          out: []
        }
      };
      note.osc1 = {
        buffer: (function() {
          var k, results;
          results = [];
          for (i = k = 0; k <= 31; i = k += 1) {
            results.push(0);
          }
          return results;
        })(),
        index: 0
      };
      note.osc2 = {
        buffer: (function() {
          var k, results;
          results = [];
          for (i = k = 0; k <= 31; i = k += 1) {
            results.push(0);
          }
          return results;
        })(),
        index: 0
      };
      this.notes.push(note);
      return console.info("note on: " + data[1]);
    } else if (data[0] === 128 || (data[0] === 144 && data[2] === 0)) {
      console.info("note off: " + data[1]);
      results = [];
      for (i = k = ref = this.notes.length - 1; k >= 0; i = k += -1) {
        if (this.notes[i].note === data[1]) {
          this.notes[i].env1.phase = 3;
          this.notes[i].env2.phase = 3;
          this.notes[i].env1.release_sig = this.notes[i].env1.sig;
          results.push(this.notes[i].env2.release_sig = this.notes[i].env2.sig);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

  Synth.prototype.noise = function(note, length) {
    var i, k, noise, r, ref;
    noise = note.noise;
    for (i = k = 0, ref = length - 1; k <= ref; i = k += 1) {
      r = 2 * Math.random() - 1;
      r = ((r * r * r) + r) * .5;
      if (Math.abs(noise + r) <= 1) {
        noise += r;
      } else {
        noise -= r;
      }
      note.noise_out[i] = noise;
    }
    return note.noise = this.noise_table[note.tick++ % this.noise_table.length];
  };

  Synth.prototype.lfo = function(params, mem, length) {
    var a, aform, form, i, iform, k, p, pa, pi, rate, ref, sig;
    for (i = k = 0, ref = length - 1; k <= ref; i = k += 1) {
      form = params.form * 6;
      iform = Math.floor(form);
      aform = form - iform;
      switch (iform) {
        case 0:
          p = mem.phase * 10000;
          pi = Math.floor(p);
          pa = p - pi;
          sig = (this.sin_table[pi] * (1 - pa) + this.sin_table[pi + 1] * pa) * (1 - aform) + aform * (mem.phase < .5 ? 1 - Math.abs(1 - mem.phase * 4) : -(1 - Math.abs(3 - mem.phase * 4)));
          break;
        case 1:
          sig = (1 - aform) * (mem.phase < .5 ? 1 - Math.abs(1 - mem.phase * 4) : -(1 - Math.abs(3 - mem.phase * 4))) + aform * (1 - 2 * mem.phase);
          break;
        case 2:
          sig = (1 - aform) * (1 - 2 * mem.phase) + aform * (mem.phase < .5 ? 1 : -1);
          break;
        case 3:
          sig = (1 - aform) * (mem.phase < .5 ? 1 : -1) + aform * (2 * mem.phase - 1);
          break;
        case 4:
          a = mem.phase;
          a = a * (3 * a - 2 * a * a);
          sig = (1 - aform) * (2 * mem.phase - 1) + aform * ((1 - a) * mem.rnd1 + a * mem.rnd2);
          break;
        case 5:
          a = mem.phase;
          a = a * (3 * a - 2 * a * a);
          sig = (1 - aform) * ((1 - a) * mem.rnd1 + a * mem.rnd2) + aform * mem.rnd1;
          break;
        case 6:
          sig = mem.rnd1;
      }
      rate = .1 + params.rate * params.rate * 20;
      mem.phase += rate / this.sampleRate;
      if (mem.phase >= 1) {
        mem.phase -= 1;
        mem.rnd1 = mem.rnd2;
        mem.rnd2 = Math.random() * 2 - 1;
      }
      mem.out[i] = sig * params.amp;
    }
  };

  Synth.prototype.envelope = function(env, note, length) {
    var a, amp, delta, f, i, k, len, phase, ref, sig;
    phase = note.phase;
    sig = note.sig;
    amp = note.amp;
    for (i = k = 0, ref = length - 1; k <= ref; i = k += 1) {
      if (phase < 1) {
        a = 1 / (441000 * env.a * env.a * env.a + 1);
        phase = Math.min(1, phase + a);
        sig = phase;
        amp = (Math.exp(phase * 2) - 1) / (Math.exp(2) - 1);
      } else if (phase < 2) {
        len = 1 + env.d * env.d * env.d * 44100 * 10;
        a = 1 / len;
        phase = Math.min(2, phase + a);
        delta = phase - 1;
        sig = (1 - delta) + delta * env.s;
        amp = env.s + (1 - env.s) * (Math.exp(-delta * 0.693147) - .5) * 2;
      } else if (phase >= 3) {
        len = 1 + env.r * env.r * env.r * 44100 * 10;
        f = Math.exp(Math.log(.5) / len);
        amp *= f;
        a = 1 / len;
        phase = Math.min(4, phase + a);
        delta = phase - 3;
        sig = note.release_sig * (1 - delta);
      }
      note.out_sig[i] = sig;
      note.out_amp[i] = amp;
    }
    if (phase >= 3 && amp < .00001) {
      note.kill = true;
    }
    note.sig = sig;
    note.amp = amp;
    note.phase = phase;
  };

  Synth.prototype.oscillators = function(note, length) {
    var a, c1, c2, dp, dpi, freq1, freq2, i, index, k, l, m, ref, s, sig1, sig2;
    c1 = Math.round(this.inputs.osc1_coarse * 24) / 24;
    c2 = Math.round(this.inputs.osc2_coarse * 24) / 24;
    freq1 = note.freq * Math.pow(2, c1 * 2) * .5 * Math.pow(Math.pow(2, 1 / 12), this.inputs.osc1_tune * 2 - 1);
    freq2 = note.freq * Math.pow(2, c2 * 2) * .5 * Math.pow(Math.pow(2, 1 / 12), this.inputs.osc2_tune * 2 - 1);
    for (s = k = 0, ref = length - 1; k <= ref; s = k += 1) {
      dp = freq1 / this.sampleRate * Math.pow(2, note.lfo1.out[s]);
      note.phase1 += dp;
      if (note.phase1 >= 1) {
        dp = (note.phase1 - 1) / dp;
        note.phase1 -= 1;
        dp *= 16;
        dpi = Math.floor(dp);
        a = dp - dpi;
        index = note.osc1.index;
        for (i = l = 0; l <= 31; i = l += 1) {
          if (dpi >= 512) {
            break;
          }
          note.osc1.buffer[index] += -1 + this.blip.samples[dpi] * (1 - a) + this.blip.samples[dpi + 1] * a;
          dpi += 16;
          index = (index + 1) % note.osc1.buffer.length;
        }
      }
      sig1 = 1 - 2 * note.phase1;
      sig1 += note.osc1.buffer[note.osc1.index];
      note.osc1.buffer[note.osc1.index] = 0;
      note.osc1.index = (note.osc1.index + 1) % note.osc1.buffer.length;
      dp = freq2 / this.sampleRate * Math.pow(2, note.lfo1.out[s]);
      note.phase2 += dp;
      if (note.phase2 >= 1) {
        dp = (note.phase2 - 1) / dp;
        note.phase2 -= 1;
        dp *= 16;
        dpi = Math.floor(dp);
        a = dp - dpi;
        index = note.osc2.index;
        for (i = m = 0; m <= 31; i = m += 1) {
          if (dpi >= 512) {
            break;
          }
          note.osc2.buffer[index] += -1 + this.blip.samples[dpi] * (1 - a) + this.blip.samples[dpi + 1] * a;
          dpi += 16;
          index = (index + 1) % note.osc2.buffer.length;
        }
      }
      sig2 = 1 - 2 * note.phase2;
      sig2 += note.osc2.buffer[note.osc2.index];
      note.osc2.buffer[note.osc2.index] = 0;
      note.osc2.index = (note.osc2.index + 1) % note.osc2.buffer.length;
      note.osc_out[s] = sig1 * this.inputs.osc1_amp + sig2 * this.inputs.osc2_amp;
    }
  };

  Synth.prototype.processNoteBuffer = function(note, buffer) {
    var a, a0, a1, alpha, aw0, b0, b1, b2, bb0, bb1, bb2, c, cosw0, cutoff, hb0, hb1, hb2, i, iw0, k, lb0, lb1, lb2, oneLessCosw0, onePlusAlpha, onePlusCosw0, q, qByAlpha, ref, sig, sig1, sig2, sinw0, slope, w, w0;
    this.envelope(this.inputs.env1, note.env1, buffer.length);
    this.envelope(this.inputs.env2, note.env2, buffer.length);
    this.lfo(this.inputs.lfo1, note.lfo1, buffer.length);
    this.oscillators(note, buffer.length);
    this.noise(note, buffer.length);
    q = .5 + Math.pow(this.inputs.filter_resonance, 2) * 9.5;
    for (i = k = 0, ref = buffer.length - 1; k <= ref; i = k += 1) {
      sig = note.osc_out[i];
      sig += note.noise_out[i] * this.inputs.noise;
      sig *= note.env1.out_amp[i];
      c = Math.max(0, Math.min(1, this.inputs.filter_cutoff + (this.inputs.filter_env_amount * 2 - 1) * note.env2.out_sig[i]));
      cutoff = Math.pow(2, c * 10) * 22000 / 1024;
      w0 = cutoff / 44100;
      w0 *= 10000;
      iw0 = Math.floor(w0);
      aw0 = w0 - iw0;
      cosw0 = (1 - aw0) * this.sin_table[iw0 + 2500] + aw0 * this.sin_table[iw0 + 2501];
      sinw0 = (1 - aw0) * this.sin_table[iw0] + aw0 * this.sin_table[iw0 + 1];
      alpha = sinw0 / (2 * q);
      onePlusAlpha = 1 + alpha;
      oneLessCosw0 = 1 - cosw0;
      lb1 = oneLessCosw0 / onePlusAlpha;
      lb0 = lb1 * .5;
      lb2 = lb0;
      a0 = (-2 * cosw0) / onePlusAlpha;
      a1 = (1 - alpha) / onePlusAlpha;
      qByAlpha = q * alpha;
      bb0 = qByAlpha / onePlusAlpha;
      bb1 = 0;
      bb2 = -bb0;
      onePlusCosw0 = 1 + cosw0;
      hb0 = onePlusCosw0 * .5 / onePlusAlpha;
      hb1 = -onePlusCosw0 / onePlusAlpha;
      hb2 = hb0;
      a = this.inputs.filter_type;
      if (a < .5) {
        a *= 2;
        b0 = lb0 * (1 - a) + a * bb0;
        b1 = lb1 * (1 - a) + a * bb1;
        b2 = lb2 * (1 - a) + a * bb2;
      } else {
        a = (a - .5) * 2;
        b0 = bb0 * (1 - a) + a * hb0;
        b1 = bb1 * (1 - a) + a * hb1;
        b2 = bb2 * (1 - a) + a * hb2;
      }
      w = sig - a0 * note.fm00 - a1 * note.fm01;
      sig1 = b0 * w + b1 * note.fm00 + b2 * note.fm01;
      note.fm01 = note.fm00;
      note.fm00 = w;
      w = sig1 - a0 * note.fm10 - a1 * note.fm11;
      sig2 = b0 * w + b1 * note.fm10 + b2 * note.fm11;
      note.fm11 = note.fm10;
      note.fm10 = w;
      slope = this.inputs.filter_slope;
      buffer[i] += sig1 * (1 - slope) + sig2 * slope;
    }
  };

  Synth.prototype.process = function(inputs, outputs, parameters) {
    var channel, crush, disto, i, j, k, l, len1, len2, m, n, o, output, ref, ref1, ref2, ref3, res, s1, s2, source, sum, t, time;
    output = outputs[0];
    time = Date.now();
    res = [0, 0];
    for (i = k = 0, len1 = output.length; k < len1; i = ++k) {
      channel = output[i];
      if (i === 0) {
        for (j = l = 0, ref = channel.length - 1; l <= ref; j = l += 1) {
          channel[j] = 0;
        }
        ref1 = this.notes;
        for (m = 0, len2 = ref1.length; m < len2; m++) {
          n = ref1[m];
          this.processNoteBuffer(n, channel);
        }
        for (j = o = 0, ref2 = channel.length - 1; o <= ref2; j = o += 1) {
          sum = channel[j];
          sum *= .25;
          this.avg = this.avg * .999 + sum * .001;
          sum -= this.avg;
          source = sum * (1 + this.inputs.disto.drive * 9);
          disto = source < 0 ? -1 + Math.exp(source) : 1 - Math.exp(-source);
          sum = (1 - this.inputs.disto.wet) * sum + this.inputs.disto.wet * disto;
          source = sum * (1 + this.inputs.bitcrusher.drive * 9);
          source = (1 - Math.exp(-source)) / (1 + Math.exp(-source));
          crush = 4 - 3 * this.inputs.bitcrusher.crush;
          sum = (1 - this.inputs.bitcrusher.wet) * sum + this.inputs.bitcrusher.wet * Math.round(source * crush) / crush;
          this.reverb.get(res);
          this.reverb.push(sum);
          s1 = sum;
          s2 = sum;
          s1 = s1 < 0 ? -1 + Math.exp(s1) : 1 - Math.exp(-s1);
          s2 = s2 < 0 ? -1 + Math.exp(s2) : 1 - Math.exp(-s2);
          channel[j] = s1;
          output[1][j] = s2;
        }
      }
    }
    this.time += Date.now() - time;
    this.samples += channel.length;
    if (this.samples >= 44100) {
      this.samples = 0;
      console.info(this.time + " ms ; buffer size = " + channel.length);
      this.time = 0;
    }
    for (i = t = ref3 = this.notes.length - 1; t >= 0; i = t += -1) {
      if (this.notes[i].env1.kill) {
        this.notes.splice(i, 1);
      }
    }
  };

  return Synth;

})();

Blip = (function() {
  function Blip() {
    var i, k, l, m, norm, o, p, ref, ref1, ref2, x;
    this.size = 512;
    this.samples = [];
    for (i = k = 0, ref = this.size; k <= ref; i = k += 1) {
      this.samples[i] = 0;
    }
    for (p = l = 1; l <= 31; p = l += 2) {
      for (i = m = 0, ref1 = this.size; m <= ref1; i = m += 1) {
        x = (i / this.size - .5) * .5;
        this.samples[i] += Math.sin(x * 2 * Math.PI * p) / p;
      }
    }
    norm = this.samples[this.size];
    for (i = o = 0, ref2 = this.size; o <= ref2; i = o += 1) {
      this.samples[i] /= norm;
    }
  }

  return Blip;

})();

DelayLine = (function() {
  function DelayLine(size, damping) {
    var alpha, cosw0, cutoff, oneLessCosw0, onePlusAlpha, q, qByAlpha, sinw0, w0;
    this.size = size;
    this.damping = damping != null ? damping : 0;
    this.buffer = new Float64Array(this.size);
    this.index = 0;
    this.last = 0;
    this.k = .3;
    this.damping = .5;
    this.v = 0;
    this.avg = 0;
    this.queue = [];
    cutoff = 300 + 3000 * Math.random();
    q = .1;
    w0 = cutoff / 44100;
    cosw0 = Math.cos(w0 * Math.PI * 2);
    sinw0 = Math.sin(w0 * Math.PI * 2);
    alpha = sinw0 / (2 * q);
    onePlusAlpha = 1 + alpha;
    oneLessCosw0 = 1 - cosw0;
    this.a0 = (-2 * cosw0) / onePlusAlpha;
    this.a1 = (1 - alpha) / onePlusAlpha;
    qByAlpha = q * alpha;
    this.b0 = qByAlpha / onePlusAlpha;
    this.b1 = 0;
    this.b2 = -this.b0;
    this.m0 = 0;
    this.m1 = 0;
  }

  DelayLine.prototype.push = function(value) {
    var sig, w;
    w = value - this.a0 * this.m0 - this.a1 * this.m1;
    sig = this.b0 * w + this.b1 * this.m0 + this.b2 * this.m1;
    this.m1 = this.m0;
    this.m0 = w;
    this.buffer[this.index] = sig * 10;
    return this.index = (this.index + 1) % this.size;
  };

  DelayLine.prototype.pushOld = function(value) {
    var v;
    this.v += (value - this.last) * this.k;
    this.v *= this.damping;
    this.last += this.v;
    this.buffer[this.index] = v = this.last - this.avg;
    this.avg = this.avg * .9 + this.last * .1;
    this.index = (this.index + 1) % this.size;
  };

  DelayLine.prototype.get = function() {
    return this.buffer[this.index];
  };

  return DelayLine;

})();

Reverb = (function() {
  function Reverb() {
    this.delays = [];
    this.delays.push(new DelayLine(47 * 44 + 1, .0));
    this.delays.push(new DelayLine(113 * 44 + 17, .0));
    this.delays.push(new DelayLine(131 * 44 + 23, .0));
    this.delays.push(new DelayLine(173 * 44 + 31, .0));
    this.delays.push(new DelayLine(193 * 44 + 41, .0));
    this.delays.push(new DelayLine(217 * 44 + 47, .0));
    this.delays.push(new DelayLine(233 * 44 + 41, .0));
    this.delays.push(new DelayLine(293 * 44 + 47, .0));
    this.avg = 0;
  }

  Reverb.prototype.get = function(result) {
    var d0, d1, d2, d3, d4, d5, d6, d7;
    d0 = this.delays[0].get();
    d1 = this.delays[1].get();
    d2 = this.delays[2].get();
    d3 = this.delays[3].get();
    d4 = this.delays[4].get();
    d5 = this.delays[5].get();
    d6 = this.delays[6].get();
    d7 = this.delays[7].get();
    result[0] = (d0 * .23 + d1 * .13 + d2 * .41 + d3 * .13 + d4 * .37 + d5 * .11 + d6 * .22 + d7 * .05) * 2;
    return result[1] = (d0 * .07 + d1 * .29 + d2 * .05 + d3 * .43 + d4 * .19 + d5 * .29 + d6 * .04 + d7 * .24) * 2;
  };

  Reverb.prototype.push = function(value) {
    var d, d0, d1, d2, d3, d4, d5, d6, d7;
    this.avg = this.avg * .8 + value * .2;
    value -= this.avg;
    d0 = this.delays[0].get();
    d1 = this.delays[1].get();
    d2 = this.delays[2].get();
    d3 = this.delays[3].get();
    d4 = this.delays[4].get();
    d5 = this.delays[5].get();
    d6 = this.delays[6].get();
    d7 = this.delays[7].get();
    d = (d0 + d1 + d2 + d3 + d4 + d5 + d6 + d7) / 8 * .1;
    this.delays[0].push(value + d + d0 * .9);
    this.delays[1].push(value + d + d1 * .9);
    this.delays[2].push(value + d + d2 * .9);
    this.delays[3].push(value + d + d3 * .9);
    this.delays[4].push(value + d + d4 * .9);
    this.delays[5].push(value + d + d5 * .9);
    this.delays[6].push(value + d + d6 * .9);
    this.delays[7].push(value + d + d7 * .9);
  };

  return Reverb;

})();


class MyWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.synth = new Synth()
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
          data = this.synth.inputs
          while (s.length>1)
            {
              data = data[s.splice(0,1)[0]]
            }
          data[s[0]] = value
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
