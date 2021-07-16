var RateLimiterClass;

this.RateLimiter = (function() {
  function RateLimiter(server) {
    this.server = server;
    this.map = {};
    this.map.request = new RateLimiterClass(this, 1, 1000 * 100);
    this.map.request_ip = new RateLimiterClass(this, 1, 100 * 100);
    this.map.login_ip = new RateLimiterClass(this, 1, 20);
    this.map.login_user = new RateLimiterClass(this, 2, 10);
    this.map.send_mail_user = new RateLimiterClass(this, 5, 5);
    this.map.create_account_ip = new RateLimiterClass(this, 30, 30);
    this.map.create_project_user = new RateLimiterClass(this, 60, 10);
    this.map.import_project_user = new RateLimiterClass(this, 60, 10);
    this.map.create_file_user = new RateLimiterClass(this, 5, 40);
    this.map.post_comment_user = new RateLimiterClass(this, 10, 10);
    this.map.create_forum_post = new RateLimiterClass(this, 60, 10);
    this.map.create_forum_reply = new RateLimiterClass(this, 10, 10);
    this.map.search_forum = new RateLimiterClass(this, 1, 15);
    this.interval = setInterval(((function(_this) {
      return function() {
        return _this.log();
      };
    })(this)), 5000);
  }

  RateLimiter.prototype.accept = function(type, key) {
    if (this.map[type] != null) {
      return this.map[type].accept(key);
    } else {
      return false;
    }
  };

  RateLimiter.prototype.close = function() {
    return clearInterval(this.interval);
  };

  RateLimiter.prototype.log = function() {
    var key, limiter, max, ref;
    ref = this.map;
    for (key in ref) {
      limiter = ref[key];
      limiter.checkTime();
      max = Math.round(limiter.max_count / limiter.quantity * 100);
      if (max > 10) {
        console.info("rate limiter " + key + " at " + max + "% for " + limiter.maxer);
      }
    }
  };

  return RateLimiter;

})();

RateLimiterClass = (function() {
  function RateLimiterClass(rate_limiter, minutes, quantity) {
    this.rate_limiter = rate_limiter;
    this.minutes = minutes;
    this.quantity = quantity;
    this.current = Math.floor(Date.now() / (this.minutes * 60000));
    this.requests = {};
    this.max_count = 0;
    this.maxer = "";
  }

  RateLimiterClass.prototype.checkTime = function() {
    var now;
    now = Math.floor(Date.now() / (this.minutes * 60000));
    if (now !== this.current) {
      this.current = now;
      this.requests = {};
      this.max_count = 0;
      return this.maxer = "";
    }
  };

  RateLimiterClass.prototype.accept = function(key) {
    this.checkTime();
    if (key == null) {
      return false;
    }
    if (this.requests[key] == null) {
      this.requests[key] = 0;
    }
    if (this.requests[key] >= this.quantity) {
      return false;
    } else {
      this.requests[key]++;
      if (this.requests[key] > this.max_count) {
        this.max_count = this.requests[key];
        this.maxer = key;
      }
      return true;
    }
  };

  return RateLimiterClass;

})();

module.exports = this.RateLimiter;
