this.Achievement = (function() {
  function _Class(props) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.story = props.story;
    this.stat = props.stat;
    this.value = props.value;
    this.xp = props.xp || 0;
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
    this.by_id[a.id] = a;
    if (a.stat != null) {
      by_stat = this.by_stat[a.stat];
      if (by_stat == null) {
        by_stat = this.by_stat[a.stat] = [];
      }
      return by_stat.push(a);
    }
  };

  return _Class;

})());

this.Achievements.add(new this.Achievement({
  id: "code/al_khwarizmi",
  name: "Al Khwarizmi",
  description: "You actually started coding!",
  story: "Al Khwarizmi was a Persian polymath who produced vastly influential works in mathematics, astronomy, and geography. His name gave rise to the term 'algorithm'.",
  stat: "time_coding",
  value: 2,
  xp: 500
}));

this.Achievements.add(new this.Achievement({
  id: "code/al_jazari",
  name: "Al Jazari",
  description: "You spent 10 minutes coding, keep it up!",
  story: "Al Jazari was a Muslim scientist, artist, mathematician living in Mesopotamia. He invented an astronomical clock considered the first programmable analog computer.",
  stat: "time_coding",
  value: 10,
  xp: 1000
}));

this.Achievements.add(new this.Achievement("abstract_artist", "Abstract Artist", "Spent one hour painting squares", "time_drawing", 60, 1000));

this.Achievements.add(new this.Achievement("impressionist", "Impressionist", "Spent ten hours painting dots", "time_drawing", 600, 3000));

this.Achievements.add(new this.Achievement("romantic", "Romantic Artist", "Spent hundred hours creating art", "time_drawing", 600, 3000));

this.Achievements.add(new this.Achievement("impressionist", "Impressionist", "Spent ten hours painting dots", "time_drawing", 600, 3000));

this.Achievements.add(new this.Achievement("gd_junior", "Level Design Junior", "Spent one hour creating maps", "time_mapping", 60, 1000));

this.Achievements.add(new this.Achievement("gd_junior", "Level Design Holder", "Spent 10 hours creating maps", "time_mapping", 600, 3000));

this.Achievements.add(new this.Achievement("gd_junior", "Level Design Master", "Spent 100 hours creating maps", "time_mapping", 6000, 10000));

this.Achievements.add(new this.Achievement("gd_junior", "Level Design Expert", "Spent 1000 hours creating maps", "time_mapping", 60000, 100000));

module.exports = this.Achievements;
