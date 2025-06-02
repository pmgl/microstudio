var RateLimiterClass;

this.RateLimiter = class RateLimiter {
  constructor(server) {
    this.server = server;
    this.map = {};
    this.map.request = new RateLimiterClass(this, 1, 1000 * 100); // > 1000 home page loads per minute (> 5000 realtime)
    this.map.request_ip = new RateLimiterClass(this, 1, 100 * 100); // > 100 home page loads per minute per ip (> 500 realtime)
    this.map.page_load_ip = new RateLimiterClass(this, 1, 30); // > 30 page loads per minute per ip
    this.map.login_ip = new RateLimiterClass(this, 1, 20); // 20 tentatives de login par minute de la même IP
    this.map.login_user = new RateLimiterClass(this, 2, 10); // 10 tentatives de login par username par 2 minutes
    this.map.delete_account = new RateLimiterClass(this, 5, 5); // 5 tentatives de suppression par user par 5 minutes
    this.map.send_mail_user = new RateLimiterClass(this, 5, 5); // 5 mails max en 5 minutes
    this.map.create_account_ip = new RateLimiterClass(this, 30, 30); // 30 comptes pour 30 minutes => classroom check
    this.map.create_project_user = new RateLimiterClass(this, 60, 10); // max 10 projects per hour
    this.map.import_project_user = new RateLimiterClass(this, 60, 10); // max 10 projects per hour
    this.map.file_upload_user = new RateLimiterClass(this, 10, 10); // max 10 large file uploads per ten minutes
    this.map.create_file_user = new RateLimiterClass(this, 5, 40); // max 40 new files per 5 minutes
    //@map.change_file_user = new RateLimiterClass(@,10,200)
    this.map.post_comment_user = new RateLimiterClass(this, 10, 10); // max 10 new comments per 10 minutes
    this.map.create_forum_post = new RateLimiterClass(this, 60, 10); // max 10 new posts per hour
    this.map.create_forum_reply = new RateLimiterClass(this, 10, 10); // max 10 new replies per 10 minutes
    this.map.search_forum = new RateLimiterClass(this, 1, 15); // max 15 searches per minute
    this.interval = setInterval((() => {
      return this.log();
    }), 5000);
  }

  accept(type, key) {
    if (this.map[type] != null) {
      return this.map[type].accept(key);
    } else {
      return false;
    }
  }

  close() {
    return clearInterval(this.interval);
  }

  log() {
    var key, limiter, max, ref;
    ref = this.map;
    for (key in ref) {
      limiter = ref[key];
      limiter.checkTime();
      max = Math.round(limiter.max_count / limiter.quantity * 100);
      if (max > 10) {
        console.info(`rate limiter ${key} at ${max}% for ${limiter.maxer}`);
      }
    }
  }

};

RateLimiterClass = class RateLimiterClass {
  constructor(rate_limiter, minutes, quantity) {
    this.rate_limiter = rate_limiter;
    this.minutes = minutes;
    this.quantity = quantity;
    this.current = Math.floor(Date.now() / (this.minutes * 60000));
    this.requests = {};
    this.max_count = 0;
    this.maxer = "";
  }

  checkTime() {
    var now;
    now = Math.floor(Date.now() / (this.minutes * 60000));
    if (now !== this.current) {
      this.current = now;
      this.requests = {};
      this.max_count = 0;
      return this.maxer = "";
    }
  }

  accept(key) {
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
  }

};

module.exports = this.RateLimiter;
