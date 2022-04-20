this.Cleaner = (function() {
  function Cleaner(content) {
    this.content = content;
    this.start();
  }

  Cleaner.prototype.start = function() {
    this.stop();
    this.users = Object.keys(this.content.users);
    this.index = 0;
    this.activity_limit = Date.now() - 60 * 24 * 3600 * 1000;
    this.deleted = 0;
    this.deleted_projects = 0;
    return this.interval = setInterval(((function(_this) {
      return function() {
        return _this.processOne();
      };
    })(this)), 1000);
  };

  Cleaner.prototype.stop = function() {
    if (this.interval != null) {
      return clearInterval(this.interval);
    }
  };

  Cleaner.prototype.deleteGuest = function(user) {
    console.info(("Deleting guest user " + user.id + " - " + user.nick + " last active: ") + new Date(user.last_active).toString());
    if ((user != null) && user.flags.guest) {
      return user["delete"]();
    }
  };

  Cleaner.prototype.processOne = function() {
    var err, user, userid;
    while (this.index < this.users.length) {
      userid = this.users[this.index++];
      if (userid != null) {
        user = this.content.users[userid];
        if ((user != null) && user.flags.guest) {
          if (user.last_active < this.activity_limit) {
            try {
              this.deleted += 1;
              this.deleted_projects += Object.keys(user.projects).length;
              this.deleteGuest(user);
            } catch (error) {
              err = error;
              console.error(err);
            }
            break;
          }
        }
      }
    }
    if (this.index >= this.users.length) {
      this.stop();
      console.info("Deleted guests: " + this.deleted);
      return console.info("Deleted projects: " + this.deleted_projects);
    }
  };

  return Cleaner;

})();

module.exports = this.Cleaner;
