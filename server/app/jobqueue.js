this.JobQueue = (function() {
  function JobQueue(conclude) {
    this.conclude = conclude;
    this.jobs = [];
  }

  JobQueue.prototype.add = function(job) {
    return this.jobs.push(job);
  };

  JobQueue.prototype.start = function() {
    return this.next();
  };

  JobQueue.prototype.next = function() {
    return setTimeout(((function(_this) {
      return function() {
        return _this.processOne();
      };
    })(this)), 0);
  };

  JobQueue.prototype.processOne = function() {
    var c, j;
    if (this.jobs.length > 0) {
      j = this.jobs.splice(0, 1)[0];
      return j(this);
    } else if (this.conclude != null) {
      c = this.conclude;
      delete this.conclude;
      return c(this);
    }
  };

  return JobQueue;

})();

module.exports = this.JobQueue;
