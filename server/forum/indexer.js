this.Indexer = (function() {
  function Indexer() {
    this.queue = [];
    this.words = {};
    this.memory = 0;
    this.start();
  }

  Indexer.prototype.start = function() {
    this.stop();
    return this.interval = setInterval(((function(_this) {
      return function() {
        return _this.processOne();
      };
    })(this)), 1000);
  };

  Indexer.prototype.stop = function() {
    if (this.interval != null) {
      return clearInterval(this.interval);
    }
  };

  Indexer.prototype.add = function(text, target, uid) {
    return this.queue.push({
      text: text,
      target: target,
      uid: uid
    });
  };

  Indexer.prototype.processOne = function() {
    var err, i, job, len, word, words;
    try {
      if (this.queue.length > 0) {
        job = this.queue.splice(0, 1)[0];
        words = job.text.match(/\b(\w+)\b/g);
        if (words != null) {
          for (i = 0, len = words.length; i < len; i++) {
            word = words[i];
            this.push(word, job.target, job.uid);
          }
        }
        if (this.queue.length === 0) {
          console.info("index size = " + this.memory + " ; words = " + (Object.keys(this.words).length));
        }
      }
    } catch (error) {
      err = error;
      console.error(err);
    }
  };

  Indexer.prototype.push = function(word, target, uid) {
    var w;
    word = word.toLowerCase();
    w = this.words[word];
    if (w == null) {
      this.words[word] = w = {};
      this.memory += 8 + word.length + 40;
    }
    if (w[uid] == null) {
      w[uid] = {
        score: 1,
        target: target
      };
      return this.memory += 40;
    } else {
      return w[uid].score += 1;
    }
  };

  Indexer.prototype.search = function(string) {
    var data, i, j, len, len1, r, rlist, rtab, uid, w, word, words;
    rlist = [];
    rtab = {};
    words = string.toLowerCase().match(/\b(\w+)\b/g);
    if (words == null) {
      return rlist;
    }
    for (i = 0, len = words.length; i < len; i++) {
      word = words[i];
      w = this.words[word];
      for (uid in w) {
        data = w[uid];
        r = rtab[uid];
        if (r == null) {
          r = {
            score: data.score,
            target: data.target,
            words: {}
          };
          r.words[word] = true;
          rtab[uid] = r;
          rlist.push(r);
        } else {
          r.score += data.score;
          r.words[word] = true;
        }
      }
    }
    for (j = 0, len1 = rlist.length; j < len1; j++) {
      r = rlist[j];
      r.score += Object.keys(r.words).length * 100;
    }
    rlist.sort(function(a, b) {
      return b.score - a.score;
    });
    return rlist;
  };

  return Indexer;

})();

module.exports = this.Indexer;
