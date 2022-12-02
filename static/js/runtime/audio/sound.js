this.Sound = class Sound {
  constructor(audio, url) {
    var request;
    this.audio = audio;
    this.url = url;
    if (typeof MicroSound !== "undefined" && MicroSound !== null) {
      this.class = MicroSound;
    }
    if (this.url instanceof AudioBuffer) {
      this.buffer = this.url;
      this.ready = 1;
    } else {
      this.ready = 0;
      request = new XMLHttpRequest();
      request.open('GET', this.url, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        return this.audio.context.decodeAudioData(request.response, (buffer1) => {
          this.buffer = buffer1;
          return this.ready = 1;
        });
      };
      request.send();
    }
  }

  play(volume = 1, pitch = 1, pan = 0, loopit = false) {
    var gain, panner, playing, res, source;
    if (this.buffer == null) {
      return;
    }
    source = this.audio.context.createBufferSource();
    source.playbackRate.value = pitch;
    source.buffer = this.buffer;
    if (loopit) {
      source.loop = true;
    }
    gain = this.audio.context.createGain();
    gain.gain.value = volume;
    if (false && (this.audio.context.createStereoPanner != null)) {
      panner = this.audio.context.createStereoPanner();
      panner.setPan = function(pan) {
        return panner.pan.value = pan;
      };
    } else {
      panner = this.audio.context.createPanner();
      panner.panningModel = "equalpower";
      panner.setPan = function(pan) {
        return panner.setPosition(pan, 0, 1 - Math.abs(pan));
      };
    }
    panner.setPan(pan);
    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.audio.context.destination);
    source.start();
    playing = null;
    if (loopit) {
      playing = {
        stop: () => {
          return source.stop();
        }
      };
      this.audio.addPlaying(playing);
    }
    res = {
      stop: () => {
        source.stop();
        if (playing) {
          this.audio.removePlaying(playing);
        }
        return 1;
      },
      setVolume: function(volume) {
        return gain.gain.value = Math.max(0, Math.min(1, volume));
      },
      setPitch: function(pitch) {
        return source.playbackRate.value = Math.max(.001, Math.min(1000, pitch));
      },
      setPan: function(pan) {
        return panner.setPan(Math.max(-1, Math.min(1, pan)));
      },
      getDuration: function() {
        return source.buffer.duration;
      },
      finished: false
    };
    source.onended = function() {
      return res.finished = true;
    };
    return res;
  }

  static createSoundClass(audiocore) {
    return window.MicroSound = (function() {
      var _Class;

      _Class = class {
        constructor(channels, length, sampleRate = 44100) {
          var buffer, ch1, ch2, snd;
          this.class = MicroSound;
          channels = channels === 1 ? 1 : 2;
          if (!(length > 1) || !(length < 44100 * 1000)) {
            length = 44100;
          }
          if (!(sampleRate >= 8000) || !(sampleRate <= 96000)) {
            sampleRate = 44100;
          }
          buffer = audiocore.context.createBuffer(channels, length, sampleRate);
          snd = new Sound(audiocore, buffer);
          this.channels = channels;
          this.length = length;
          this.sampleRate = sampleRate;
          ch1 = buffer.getChannelData(0);
          if (channels === 2) {
            ch2 = buffer.getChannelData(1);
          }
          this.play = function(volume, pitch, pan, loopit) {
            return snd.play(volume, pitch, pan, loopit);
          };
          this.write = function(channel, position, value) {
            if (channel === 0) {
              ch1 = buffer.getChannelData(0);
              return ch1[position] = value;
            } else if (channels === 2) {
              ch2 = buffer.getChannelData(1);
              return ch2[position] = value;
            }
          };
          this.read = function(channel, position) {
            if (channel === 0) {
              ch1 = buffer.getChannelData(0);
              return ch1[position];
            } else if (channels === 2) {
              ch2 = buffer.getChannelData(1);
              return ch2[position];
            } else {
              return 0;
            }
          };
        }

      };

      _Class.classname = "Sound";

      return _Class;

    }).call(this);
  }

};
