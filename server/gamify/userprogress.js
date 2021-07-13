var Achievements, Levels;

Levels = require(__dirname + "/levels.js");

Achievements = require(__dirname + "/achievements.js");

this.UserProgress = (function() {
  function UserProgress(user, data) {
    this.user = user;
    this.stats = data.stats || {
      xp: 0,
      level: 0
    };
    this.achievements = data.achievements || {};
    this.time_ids = {};
  }

  UserProgress.prototype.recordTime = function(id) {
    var t;
    t = Math.floor(Date.now() / 60000);
    if (t === this.time_ids[id]) {
      return;
    }
    this.time_ids[id] = t;
    this.incrementStat(id, 1, false);
    return this.incrementStat("xp", 60);
  };

  UserProgress.prototype.unlockAchievement = function(id, name, description, xp) {
    if (xp == null) {
      xp = 0;
    }
    if (!this.hasAchievement(id)) {
      this.achievements[id] = {
        id: id,
        name: name,
        description: description,
        xp: xp
      };
      if (xp > 0) {
        this.incrementStat("xp", xp);
      }
      return this.saveAchievements();
    }
  };

  UserProgress.prototype.hasAchievement = function(id) {
    return this.achievements[id] != null;
  };

  UserProgress.prototype.incrementStat = function(id, value, save) {
    var a, achievements, i, len;
    if (save == null) {
      save = true;
    }
    if (this.stats[id] != null) {
      this.stats[id] += value;
    } else {
      this.stats[id] = value;
    }
    if (id === "xp") {
      while (this.stats.xp >= Levels.total_cost[this.stats.level]) {
        this.stats.level += 1;
      }
    }
    achievements = Achievements.by_stat[id];
    if (achievements != null) {
      for (i = 0, len = achievements.length; i < len; i++) {
        a = achievements[i];
        if (this.stats[id] >= a.value && !this.hasAchievement(a.id)) {
          this.unlockAchievement(a.id, a.name, a.description, a.xp);
        }
      }
    }
    if (save) {
      return this.saveStats();
    }
  };

  UserProgress.prototype.saveStats = function() {
    return this.user.record.set("stats", this.stats);
  };

  UserProgress.prototype.saveAchievements = function() {
    return this.user.record.set("achievements", this.achievements);
  };

  UserProgress.prototype.get = function() {
    return {
      stats: this.stats,
      achievements: this.achievements
    };
  };

  return UserProgress;

})();

module.exports = this.UserProgress;
