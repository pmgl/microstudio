var Levels;

this.UserProgress = (function() {
  function UserProgress(app) {
    this.app = app;
    this.levels = new Levels();
    setInterval(((function(_this) {
      return function() {
        return _this.updateXP();
      };
    })(this)), 50);
    this.target_xp = 0;
    this.xp = 0;
  }

  UserProgress.prototype.update = function() {
    var level, xp;
    if (this.app.user != null) {
      document.getElementById("header-progress-summary").classList.remove("hidden");
      level = this.app.user.info.stats.level || 0;
      xp = this.app.user.info.stats.xp || 0;
      document.getElementById("header-progress-level").innerText = this.app.translator.get("Level %NUM%").replace("%NUM%", level);
      this.target_xp = xp;
      this.checkLevel();
      return this.checkAchievements();
    }
  };

  UserProgress.prototype.checkLevel = function() {
    var level;
    if (this.app.user != null) {
      if (this.level == null) {
        this.level = this.app.user.info.stats.level || 0;
      } else {
        level = this.app.user.info.stats.level || 0;
        if (level > this.level) {
          this.level = level;
          this.addNotification(null, this.app.translator.get("Level %LEVEL% unlocked!").replace("%LEVEL%", level));
        }
      }
    }
  };

  UserProgress.prototype.checkAchievements = function() {
    var a, j, k, len, len1, ref, ref1;
    if (this.app.user != null) {
      if (this.achievements == null) {
        this.achievements = {};
        ref = this.app.user.info.achievements;
        for (j = 0, len = ref.length; j < len; j++) {
          a = ref[j];
          this.achievements[a.id] = true;
        }
      } else {
        ref1 = this.app.user.info.achievements;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          a = ref1[k];
          if (!this.achievements[a.id]) {
            this.achievements[a.id] = true;
            this.addNotification("/img/achievements/" + a.id + ".png", this.app.translator.get("New achievement unlocked!"));
          }
        }
      }
    }
  };

  UserProgress.prototype.updateXP = function() {
    var dxp, level, percent, xp, xp1, xp2;
    if (this.app.user == null) {
      return;
    }
    if (this.target_xp > 0 && this.target_xp === this.xp) {
      return;
    }
    this.xp += (this.target_xp - this.xp) * .1;
    if (Math.abs(this.target_xp - this.xp) < 1) {
      this.xp = this.target_xp;
    }
    xp = Math.round(this.xp);
    level = this.app.user.info.stats.level || 0;
    xp1 = level > 0 ? this.levels.total_cost[level - 1] : 0;
    xp2 = this.levels.total_cost[level];
    dxp = xp2 - xp1;
    percent = Math.max(0, Math.min(99, Math.floor((xp - xp1) / dxp * 100)));
    xp = this.displayNumber(xp);
    document.getElementById("header-progress-xp").innerText = xp;
    return this.setProgressBar("header-progress-xp", percent);
  };

  UserProgress.prototype.setProgressBar = function(id, percent) {
    if (document.getElementById(id) == null) {
      return;
    }
    return document.getElementById(id).style.background = "linear-gradient(90deg,hsl(200,50%,40%) 0%,hsl(0,50%,40%) " + percent + "%,hsl(200,10%,5%) " + percent + "%)";
  };

  UserProgress.prototype.displayNumber = function(x) {
    var list;
    x = "" + x;
    list = [];
    while (x.length > 3) {
      list.splice(0, 0, x.substring(x.length - 3, x.length));
      x = x.substring(0, x.length - 3);
    }
    list.splice(0, 0, x);
    return list.join(" ");
  };

  UserProgress.prototype.updateStatsPage = function() {
    var a, bonus, div, div_achievements, div_level, div_stats, dxp, j, k, key, len, len1, level, list, map, percent, results, unit, value, xp, xp1, xp2;
    div_level = document.getElementById("user-progress-level");
    div_level.innerHTML = "";
    div_stats = document.getElementById("user-progress-statistics");
    div_stats.innerHTML = "";
    map = {
      pixels_drawn: "Pixels Drawn",
      map_cells_drawn: "Map Cells Painted",
      characters_typed: "Characters Typed",
      lines_of_code: "Lines of Code",
      time_coding: "Coding Time",
      time_drawing: "Drawing Time",
      time_mapping: "Map Editor Time",
      xp: "XP",
      level: "Level"
    };
    list = ["level", "xp", "characters_typed", "lines_of_code", "pixels_drawn", "map_cells_drawn", "time_coding", "time_drawing", "time_mapping"];
    for (j = 0, len = list.length; j < len; j++) {
      key = list[j];
      value = this.app.user.info.stats[key];
      if (value == null) {
        continue;
      }
      unit = "";
      if (key.startsWith("time")) {
        if (value >= 60) {
          unit = this.app.translator.get("hours");
          value = Math.floor(value / 60);
        } else {
          unit = this.app.translator.get("minutes");
        }
      }
      div = key === "xp" || key === "level" ? div_level : div_stats;
      div.innerHTML += "<div class=\"user-progress-stat\" id=\"user-progress-stat-" + key + "\">\n  <div class=\"user-progress-stat-value\">" + (this.displayNumber(value)) + "<span class=\"unit\">" + unit + "</span></div>\n  <div class=\"user-progress-stat-label\">" + (map[key] ? this.app.translator.get(map[key]) : key) + "</div>\n</div>";
    }
    xp = this.app.user.info.stats.xp;
    level = this.app.user.info.stats.level;
    xp1 = level > 0 ? this.levels.total_cost[level - 1] : 0;
    xp2 = this.levels.total_cost[level];
    dxp = xp2 - xp1;
    percent = Math.max(0, Math.min(99, Math.floor((xp - xp1) / dxp * 100)));
    this.setProgressBar("user-progress-stat-xp", percent);
    div_achievements = document.getElementById("user-progress-achievements");
    div_achievements.innerHTML = "";
    list = this.app.user.info.achievements;
    list.sort(function(a, b) {
      return b.date - a.date;
    });
    if (list.length > 0) {
      document.getElementById("number-of-achievements").innerText = " (" + list.length + ")";
    } else {
      document.getElementById("number-of-achievements").innerText = "";
    }
    results = [];
    for (k = 0, len1 = list.length; k < len1; k++) {
      a = list[k];
      bonus = "";
      if (a.info.xp != null) {
        bonus = "<div class=\"bonus\">XP bonus +" + a.info.xp + "</div>";
      }
      results.push(div_achievements.innerHTML += "<div class=\"user-progress-achievement\">\n  <img src=\"/img/achievements/" + a.id + ".png\" />\n  " + bonus + "\n  <h3>" + a.info.name + "</h3>\n  <p>" + a.info.description + "</p>\n  " + (a.info.story != null ? "<p class='story'>" + a.info.story + "</p>" : "") + "\n  <div style=\"clear: both\"></div>\n</div>");
    }
    return results;
  };

  UserProgress.prototype.addNotification = function(image, text) {
    var div, i, parent;
    parent = document.getElementById("user-progress-notifications");
    div = document.createElement("div");
    div.classList.add("user-progress-notification");
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-times");
    i.classList.add("close");
    if (image != null) {
      div.innerHTML += "<img src=\"" + image + "\" />";
    }
    div.innerHTML += " " + text + "<div style='clear:both'></div>";
    div.addEventListener("click", (function(_this) {
      return function() {
        _this.app.openUserProgress();
        div.style.left = "400px";
        return setTimeout((function() {
          return parent.removeChild(div);
        }), 1000);
      };
    })(this));
    div.insertBefore(i, div.childNodes[0]);
    i.addEventListener("click", (function(_this) {
      return function(event) {
        event.stopPropagation();
        div.style.left = "400px";
        return setTimeout((function() {
          return parent.removeChild(div);
        }), 1000);
      };
    })(this));
    setTimeout(((function(_this) {
      return function() {
        return div.style.left = "0px";
      };
    })(this)), 100);
    return parent.appendChild(div);
  };

  return UserProgress;

})();

Levels = (function() {
  function _Class() {
    var i, j, sum;
    this.total_cost = [];
    sum = 0;
    for (i = j = 0; j <= 499; i = j += 1) {
      sum += this.costOfLevelUp(i);
      this.total_cost[i] = sum;
    }
  }

  _Class.prototype.costOfLevelUp = function(from_level) {
    var xp;
    return xp = (from_level + 5) * (from_level + 5) * 20;
  };

  return _Class;

})();
