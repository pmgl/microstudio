this.Music = (function() {
  function Music(audio, url) {
    this.audio = audio;
    this.url = url;
    this.tag = new Audio(this.url);
    this.playing = false;
  }

  Music.prototype.play = function(volume, loopit) {
    if (volume == null) {
      volume = 1;
    }
    if (loopit == null) {
      loopit = false;
    }
    this.playing = true;
    this.tag.loop = loopit ? true : false;
    if (this.audio.isStarted()) {
      this.tag.play();
    } else {
      this.audio.addToWakeUpList(this);
    }
    this.audio.addPlaying(this);
    return {
      play: (function(_this) {
        return function() {
          return _this.tag.play();
        };
      })(this),
      stop: (function(_this) {
        return function() {
          _this.playing = false;
          _this.tag.pause();
          return _this.audio.removePlaying(_this);
        };
      })(this),
      setVolume: (function(_this) {
        return function(volume) {
          return _this.tag.volume = Math.max(0, Math.min(1, volume));
        };
      })(this),
      getPosition: (function(_this) {
        return function() {
          return _this.tag.currentTime;
        };
      })(this),
      getDuration: (function(_this) {
        return function() {
          return _this.tag.duration;
        };
      })(this),
      setPosition: (function(_this) {
        return function(pos) {
          _this.tag.pause();
          _this.tag.currentTime = Math.max(0, Math.min(_this.tag.duration, pos));
          if (_this.playing) {
            return _this.tag.play();
          }
        };
      })(this)
    };
  };

  Music.prototype.wakeUp = function() {
    if (this.playing) {
      return this.tag.play();
    }
  };

  Music.prototype.stop = function() {
    this.playing = false;
    return this.tag.pause();
  };

  return Music;

})();
