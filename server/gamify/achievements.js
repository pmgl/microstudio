this.Achievement = (function() {
  function _Class(id, name, description, stat, value, xp) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.stat = stat;
    this.value = value;
    this.xp = xp;
  }

  return _Class;

})();

this.Achievements = new ((function() {
  function _Class() {
    this.list = [];
    this.by_stat = {};
  }

  _Class.prototype.add = function(a) {
    var by_stat;
    this.list.push(a);
    by_stat = this.by_stat[a.stat];
    if (by_stat == null) {
      by_stat = this.by_stat[a.stat] = [];
    }
    by_stat.push(a);
    return this.by_id[a.id] = a;
  };

  return _Class;

})());

this.Achievements.add(new this.Achievement("code_rookie", "Code Rookie", "Spent one hour coding", "time_coding", 60, 1000));

this.Achievements.add(new this.Achievement("code_explorer", "Code Explorer", "Spent 10 hours coding", "time_coding", 600, 5000));

this.Achievements.add(new this.Achievement("code_hero", "Code Hero", "Spent 100 hours coding", "time_coding", 6000, 25000));

this.Achievements.add(new this.Achievement("code_boss", "Boss of Code", "Spent 1000 hours coding", "time_coding", 60000, 100000));

this.Achievements.add(new this.Achievement("abstract_artist", "Abstract Artist", "Spent one hour painting squares", "time_drawing", 60, 1000));

this.Achievements.add(new this.Achievement("impressionist", "Impressionist", "Spent ten hours painting dots", "time_drawing", 600, 3000));

this.Achievements.add(new this.Achievement("romantic", "Romantic Artist", "Spent hundred hours creating art", "time_drawing", 600, 3000));

this.Achievements.add(new this.Achievement("impressionist", "Impressionist", "Spent ten hours painting dots", "time_drawing", 600, 3000));

this.Achievements.add(new this.Achievement("gd_junior", "Level Design Junior", "Spent one hour creating maps", "time_mapping", 60, 1000));

this.Achievements.add(new this.Achievement("gd_junior", "Level Design Holder", "Spent 10 hours creating maps", "time_mapping", 600, 3000));

this.Achievements.add(new this.Achievement("gd_junior", "Level Design Master", "Spent 100 hours creating maps", "time_mapping", 6000, 10000));

this.Achievements.add(new this.Achievement("gd_junior", "Level Design Expert", "Spent 1000 hours creating maps", "time_mapping", 60000, 100000));

module.exports = this.Achievements;
