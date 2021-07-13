this.AudioCore = (function() {
  function AudioCore(runtime) {
    this.runtime = runtime;
    this.buffer = [];
    this.getContext();
    this.playing = [];
    this.wakeup_list = [];
  }

  AudioCore.prototype.isStarted = function() {
    return this.context.state === "running";
  };

  AudioCore.prototype.addToWakeUpList = function(item) {
    return this.wakeup_list.push(item);
  };

  AudioCore.prototype.getInterface = function() {
    var audio;
    audio = this;
    return this["interface"] = {
      beep: function(sequence) {
        return audio.beep(sequence);
      },
      cancelBeeps: function() {
        return audio.cancelBeeps();
      },
      playSound: function(sound, volume, pitch, pan, loopit) {
        return audio.playSound(sound, volume, pitch, pan, loopit);
      },
      playMusic: function(music, volume, loopit) {
        return audio.playMusic(music, volume, loopit);
      }
    };
  };

  AudioCore.prototype.playSound = function(sound, volume, pitch, pan, loopit) {
    var s;
    if (volume == null) {
      volume = 1;
    }
    if (pitch == null) {
      pitch = 1;
    }
    if (pan == null) {
      pan = 0;
    }
    if (loopit == null) {
      loopit = 0;
    }
    if (typeof sound === "string") {
      s = this.runtime.sounds[sound];
      if (s != null) {
        return s.play(volume, pitch, pan, loopit);
      }
    }
    return 0;
  };

  AudioCore.prototype.playMusic = function(music, volume, loopit) {
    var m;
    if (volume == null) {
      volume = 1;
    }
    if (loopit == null) {
      loopit = 0;
    }
    if (typeof music === "string") {
      m = this.runtime.music[music];
      if (m != null) {
        return m.play(volume, loopit);
      }
    }
    return 0;
  };

  AudioCore.prototype.start = function() {
    var blob, src;
    if (false) {
      blob = new Blob([AudioCore.processor], {
        type: "text/javascript"
      });
      return this.context.audioWorklet.addModule(window.URL.createObjectURL(blob)).then((function(_this) {
        return function() {
          _this.node = new AudioWorkletNode(_this.context, "my-worklet-processor");
          _this.node.connect(_this.context.destination);
          return _this.flushBuffer();
        };
      })(this));
    } else {
      this.script_processor = this.context.createScriptProcessor(4096, 2, 2);
      this.processor_funk = (function(_this) {
        return function(event) {
          return _this.onAudioProcess(event);
        };
      })(this);
      this.script_processor.onaudioprocess = this.processor_funk;
      this.script_processor.connect(this.context.destination);
      src = "class AudioWorkletProcessor {\n  constructor() {\n    this.port = {} ;\n\n    var _this = this ;\n\n    this.port.postMessage = function(data) {\n      var event = { data: data } ;\n      _this.port.onmessage(event) ;\n    }\n  }\n\n} ;\nregisterProcessor = function(a,b) {\n  return new MyWorkletProcessor()\n} ;\n";
      src += AudioCore.processor;
      this.node = eval(src);
      this.flushBuffer();
      return this.bufferizer = new AudioBufferizer(this.node);
    }
  };

  AudioCore.prototype.flushBuffer = function() {
    var results;
    results = [];
    while (this.buffer.length > 0) {
      results.push(this.node.port.postMessage(this.buffer.splice(0, 1)[0]));
    }
    return results;
  };

  AudioCore.prototype.onAudioProcess = function(event) {
    var left, outputs, right;
    left = event.outputBuffer.getChannelData(0);
    right = event.outputBuffer.getChannelData(1);
    outputs = [[left, right]];
    this.bufferizer.flush(outputs);
  };

  AudioCore.prototype.getContext = function() {
    var activate;
    if (this.context == null) {
      this.context = new (window.AudioContext || window.webkitAudioContext);
      if (this.context.state !== "running") {
        activate = (function(_this) {
          return function() {
            var item, j, len, ref;
            console.info("resuming context");
            _this.context.resume();
            if (_this.beeper != null) {
              _this.start();
            }
            ref = _this.wakeup_list;
            for (j = 0, len = ref.length; j < len; j++) {
              item = ref[j];
              item.wakeUp();
            }
            document.body.removeEventListener("touchend", activate);
            return document.body.removeEventListener("mouseup", activate);
          };
        })(this);
        document.body.addEventListener("touchend", activate);
        document.body.addEventListener("mouseup", activate);
      } else if (this.beeper != null) {
        this.start();
      }
    }
    return this.context;
  };

  AudioCore.prototype.getBeeper = function() {
    if (this.beeper == null) {
      this.beeper = new Beeper(this);
      if (this.context.state === "running") {
        this.start();
      }
    }
    return this.beeper;
  };

  AudioCore.prototype.beep = function(sequence) {
    return this.getBeeper().beep(sequence);
  };

  AudioCore.prototype.addBeeps = function(beeps) {
    var b, j, len;
    for (j = 0, len = beeps.length; j < len; j++) {
      b = beeps[j];
      b.duration *= this.context.sampleRate;
      b.increment = b.frequency / this.context.sampleRate;
    }
    if (this.node != null) {
      return this.node.port.postMessage(JSON.stringify({
        name: "beep",
        sequence: beeps
      }));
    } else {
      return this.buffer.push(JSON.stringify({
        name: "beep",
        sequence: beeps
      }));
    }
  };

  AudioCore.prototype.cancelBeeps = function() {
    if (this.node != null) {
      this.node.port.postMessage(JSON.stringify({
        name: "cancel_beeps"
      }));
    } else {
      this.buffer.push(JSON.stringify({
        name: "cancel_beeps"
      }));
    }
    return this.stopAll();
  };

  AudioCore.prototype.addPlaying = function(item) {
    return this.playing.push(item);
  };

  AudioCore.prototype.removePlaying = function(item) {
    var index;
    index = this.playing.indexOf(item);
    if (index >= 0) {
      return this.playing.splice(index, 1);
    }
  };

  AudioCore.prototype.stopAll = function() {
    var err, j, len, p, ref;
    ref = this.playing;
    for (j = 0, len = ref.length; j < len; j++) {
      p = ref[j];
      try {
        p.stop();
      } catch (error) {
        err = error;
        console.error(err);
      }
    }
    return this.playing = [];
  };

  AudioCore.processor = "class MyWorkletProcessor extends AudioWorkletProcessor {\n  constructor() {\n    super();\n    this.beeps = [] ;\n    this.last = 0 ;\n    this.port.onmessage = (event) => {\n      let data = JSON.parse(event.data) ;\n      if (data.name == \"cancel_beeps\")\n      {\n        this.beeps = [] ;\n      }\n      else if (data.name == \"beep\")\n      {\n        let seq = data.sequence ;\n        for (let i=0;i<seq.length;i++)\n        {\n          let note = seq[i] ;\n          if (i>0)\n          {\n            seq[i-1].next = note ;\n          }\n\n          if (note.loopto != null)\n          {\n            note.loopto = seq[note.loopto] ;\n          }\n\n          note.phase = 0 ;\n          note.time = 0 ;\n        }\n\n        this.beeps.push(seq[0]) ;\n      }\n    } ;\n  }\n\n  process(inputs, outputs, parameters) {\n    var output = outputs[0] ;\n    var phase ;\n    for (var i=0;i<output.length;i++)\n    {\n      var channel = output[i] ;\n      if (i>0)\n      {\n        for (var j=0;j<channel.length;j++)\n        {\n          channel[j] = output[0][j]\n        }\n      }\n      else\n      {\n        for (var j=0;j<channel.length;j++)\n        {\n          let sig = 0 ;\n          for (var k=this.beeps.length-1;k>=0;k--)\n          {\n            let b = this.beeps[k];\n            let volume = b.volume ;\n            if (b.time/b.duration>b.span)\n              {\n                volume = 0 ;\n              }\n            if (b.waveform == \"square\")\n            {\n              sig += b.phase>.5? volume : -volume ;\n            }\n            else if (b.waveform == \"saw\")\n            {\n              sig += (b.phase*2-1)*volume ;\n            }\n            else if (b.waveform == \"noise\")\n            {\n              sig += (Math.random()*2-1)*volume ;\n            }\n            else\n            {\n              sig += Math.sin(b.phase*Math.PI*2)*volume ;\n            }\n\n            b.phase = (b.phase+b.increment)%1 ;\n            b.time += 1 ;\n            if (b.time>=b.duration)\n            {\n              b.time = 0 ;\n              if (b.loopto != null)\n              {\n                if (b.repeats != null && b.repeats>0)\n                {\n                  if (b.loopcount == null)\n                  {\n                    b.loopcount = 0 ;\n                  }\n                  b.loopcount++ ;\n                  if (b.loopcount>=b.repeats)\n                  {\n                    b.loopcount = 0 ;\n                    if (b.next != null)\n                    {\n                      b.next.phase = b.phase ;\n                      b = b.next ;\n                      this.beeps[k] = b ;\n                    }\n                    else\n                    {\n                      this.beeps.splice(k,1) ;\n                    }\n                  }\n                  else\n                  {\n                    b.loopto.phase = b.phase ;\n                    b = b.loopto ;\n                    this.beeps[k] = b ;\n                  }\n                }\n                else\n                {\n                  b.loopto.phase = b.phase ;\n                  b = b.loopto ;\n                  this.beeps[k] = b ;\n                }\n              }\n              else if (b.next != null)\n              {\n                b.next.phase = b.phase ;\n                b = b.next ;\n                this.beeps[k] = b ;\n              }\n              else\n              {\n                this.beeps.splice(k,1) ;\n              }\n            }\n          }\n          this.last = this.last*.9+sig*.1 ;\n          channel[j] = this.last ;\n        }\n      }\n    }\n    return true ;\n  }\n}\n\nregisterProcessor('my-worklet-processor', MyWorkletProcessor);";

  return AudioCore;

})();

this.AudioBufferizer = (function() {
  function AudioBufferizer(node) {
    var i, j, k, left, ref, right;
    this.node = node;
    this.buffer_size = 4096;
    this.chunk_size = 512;
    this.chunks = [];
    this.nb_chunks = this.buffer_size / this.chunk_size;
    for (i = j = 0, ref = this.nb_chunks - 1; j <= ref; i = j += 1) {
      left = (function() {
        var n, ref1, results;
        results = [];
        for (k = n = 0, ref1 = this.chunk_size - 1; 0 <= ref1 ? n <= ref1 : n >= ref1; k = 0 <= ref1 ? ++n : --n) {
          results.push(0);
        }
        return results;
      }).call(this);
      right = (function() {
        var n, ref1, results;
        results = [];
        for (k = n = 0, ref1 = this.chunk_size - 1; 0 <= ref1 ? n <= ref1 : n >= ref1; k = 0 <= ref1 ? ++n : --n) {
          results.push(0);
        }
        return results;
      }).call(this);
      this.chunks[i] = [[left, right]];
    }
    this.current = 0;
    setInterval(((function(_this) {
      return function() {
        return _this.step();
      };
    })(this)), this.chunk_size / 44100 * 1000);
  }

  AudioBufferizer.prototype.step = function() {
    if (this.current >= this.chunks.length) {
      return;
    }
    this.node.process(null, this.chunks[this.current], null);
    this.current++;
  };

  AudioBufferizer.prototype.flush = function(outputs) {
    var chunk, i, index, j, k, l, left, n, r, ref, ref1, right;
    while (this.current < this.chunks.length) {
      this.step();
    }
    this.current = 0;
    left = outputs[0][0];
    right = outputs[0][1];
    index = 0;
    chunk = 0;
    for (i = j = 0, ref = this.chunks.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      chunk = this.chunks[i];
      l = chunk[0][0];
      r = chunk[0][1];
      for (k = n = 0, ref1 = l.length - 1; 0 <= ref1 ? n <= ref1 : n >= ref1; k = 0 <= ref1 ? ++n : --n) {
        left[index] = l[k];
        right[index] = r[k];
        index += 1;
      }
    }
  };

  return AudioBufferizer;

})();
