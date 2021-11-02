var Achievements, Levels,
  hasProp = {}.hasOwnProperty;

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
    this.limited_time = {};
    this.limited_value = {};
    this.stats_update = 0;
    this.achievements_update = 0;
    this.levels = Levels;
  }

  UserProgress.prototype.recordTime = function(id) {
    var t;
    t = Math.floor(Date.now() / 60000);
    if (t === this.time_ids[id]) {
      return;
    }
    this.time_ids[id] = t;
    return this.incrementStat(id, 1, true);
  };

  UserProgress.prototype.unlockAchievement = function(id, date) {
    var a;
    if (date == null) {
      date = Date.now();
    }
    if (!this.hasAchievement(id)) {
      this.achievements[id] = {
        id: id,
        date: date
      };
      a = Achievements.by_id[id];
      if ((a != null) && (a.xp != null)) {
        this.incrementStat("xp", a.xp);
      }
      this.saveAchievements();
      return this.achievements_update += 1;
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
          this.unlockAchievement(a.id);
        }
      }
    }
    if (save) {
      this.saveStats();
    }
    return this.stats_update += 1;
  };

  UserProgress.prototype.incrementLimitedStat = function(id, value) {
    var absolute, max, minutes, t;
    minutes = 10;
    max = 1200;
    t = Math.floor(Date.now() / 60000 / minutes);
    absolute = value;
    if (t !== this.limited_time[id]) {
      this.limited_time[id] = t;
      this.limited_value[id] = 0;
    }
    value = Math.min(value, max - this.limited_value[id]);
    this.limited_value[id] += value;
    if (absolute > 0) {
      this.incrementStat(id, absolute, false);
    }
    if (value > 0) {
      return this.incrementStat("xp", value, false);
    }
  };

  UserProgress.prototype.saveStats = function() {
    return this.user.set("stats", this.stats);
  };

  UserProgress.prototype.saveAchievements = function() {
    return this.user.set("achievements", this.achievements);
  };

  UserProgress.prototype.get = function() {
    return {
      stats: this.stats,
      achievements: this.achievements
    };
  };

  UserProgress.prototype.exportStats = function() {
    return this.stats;
  };

  UserProgress.prototype.exportAchievements = function() {
    var a, id, list, ref;
    list = [];
    ref = this.achievements;
    for (id in ref) {
      if (!hasProp.call(ref, id)) continue;
      a = ref[id];
      list.push({
        id: a.id,
        date: a.date,
        info: Achievements.by_id[a.id]
      });
    }
    return list;
  };

  return UserProgress;

})();

module.exports = this.UserProgress;
