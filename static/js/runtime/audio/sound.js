this.Sound = (function() {
  function Sound(audio, url) {
    var request;
    this.audio = audio;
    this.url = url;
    if (this.url instanceof AudioBuffer) {
      this.buffer = this.url;
      this.ready = 1;
    } else {
      this.ready = 0;
      request = new XMLHttpRequest();
      request.open('GET', this.url, true);
      request.responseType = 'arraybuffer';
      request.onload = (function(_this) {
        return function() {
          return _this.audio.context.decodeAudioData(request.response, function(buffer1) {
            _this.buffer = buffer1;
            return _this.ready = 1;
          });
        };
      })(this);
      request.send();
    }
  }

  Sound.prototype.play = function(volume, pitch, pan, loopit) {
    var gain, panner, playing, res, source;
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
      loopit = false;
    }
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
        stop: (function(_this) {
          return function() {
            return source.stop();
          };
        })(this)
      };
      this.audio.addPlaying(playing);
    }
    res = {
      stop: (function(_this) {
        return function() {
          source.stop();
          if (playing) {
            _this.audio.removePlaying(playing);
          }
          return 1;
        };
      })(this),
      setVolume: function(volume) {
        return gain.gain.value = Math.max(0, Math.min(1, volume));
      },
      setPitch: function(pitch) {
        return source.playbackRate.value = Math.max(.001, Math.min(1000, pitch));
      },
      setPan: function(pan) {
        return panner.setPan(Math.max(-1, Math.min(1, pan)));
      },
      finished: false
    };
    source.onended = function() {
      return res.finished = true;
    };
    return res;
  };

  Sound.createSoundClass = function(audiocore) {
    return window.MicroSound = (function() {
      function _Class(channels, length, sampleRate) {
        var buffer, ch1, ch2, snd;
        if (sampleRate == null) {
          sampleRate = 44100;
        }
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
            return ch1[position] = value;
          } else if (channels === 2) {
            return ch2[position] = value;
          }
        };
        this.read = function(channel, position) {
          if (channel === 0) {
            return ch1[position];
          } else if (channels === 2) {
            return ch2[position];
          } else {
            return 0;
          }
        };
      }

      return _Class;

    })();
  };

  return Sound;

})();
