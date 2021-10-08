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
    this.by_id = {};
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
  value: 3,
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

this.Achievements.add(new this.Achievement({
  id: "code/blaise_pascal",
  name: "Blaise Pascal",
  description: "You spent 30 minutes coding, well done!",
  story: "Blaise Pascal was a French mathematician, physicist, inventor, philosopher. He invented the mechanical calculator.",
  stat: "time_coding",
  value: 30,
  xp: 1500
}));

this.Achievements.add(new this.Achievement({
  id: "code/gottfried_leibniz",
  name: "Gottfried Leibniz",
  description: "You spent 1 hour coding, amazing!",
  story: "Gottfried Leibniz was a German mathematician, philosopher, scientist and diplomat. He made advances in symbolic logic and hi work was crucial for the theoretical foundations of computer science.",
  stat: "time_coding",
  value: 60,
  xp: 2000
}));

this.Achievements.add(new this.Achievement({
  id: "code/joseph_jacquard",
  name: "Joseph Jacquard",
  description: "You spent 2 hours coding, starts looking like an addiction!",
  story: "Joseph Jacquard was a French weaver and merchant. He built and demonstrated the Jacquard loom, a programmable mechanized loom controlled by a tape constructed from punched cards.",
  stat: "time_coding",
  value: 60 * 2,
  xp: 2500
}));

this.Achievements.add(new this.Achievement({
  id: "code/charles_babbage",
  name: "Charles Babbage",
  description: "You spent 5 hours coding, O.M.G!",
  story: "Charles Babbage was an English mathematician, philosopher, engineer and inventor. He originated the concept of a programmable general-purpose computer and designed the Analytical Engine.",
  stat: "time_coding",
  value: 60 * 5,
  xp: 3000
}));

this.Achievements.add(new this.Achievement({
  id: "code/george_boole",
  name: "George Boole",
  description: "You spent 10 hours coding, isn't that crazy?",
  story: "George Boole was an English mathematician, philosopher and logician. He formalized Boolean algebra, the basis for digital logic and computer science.",
  stat: "time_coding",
  value: 60 * 10,
  xp: 3500
}));

this.Achievements.add(new this.Achievement({
  id: "code/ada_lovelace",
  name: "Ada Lovelace",
  description: "You spent 20 hours coding, seems more than just a hobby!",
  story: "Ada Lovelace was an English mathematician and writer. She anticipated applications beyond pure calculation to Babbage's Analytical Engine, and created the first algorithms for such a machine.",
  stat: "time_coding",
  value: 60 * 20,
  xp: 4000
}));

this.Achievements.add(new this.Achievement({
  id: "code/emile_baudot",
  name: "Emile Baudot",
  description: "You spent 50 hours coding, keep it up!",
  story: "Emile Baudot was a French telegraph engineer and inventor. He created the first binary encoding system for communications, and today's modem speed unit baud is named after him.",
  stat: "time_coding",
  value: 60 * 50,
  xp: 4500
}));

this.Achievements.add(new this.Achievement({
  id: "code/bertrand_russell",
  name: "Bertrand Russell",
  description: "You spent 100 hours coding, keep it up!",
  story: "Bertrand Russell was a British mathematician, philosopher and logician. His work had a considerable influence on computer science.",
  stat: "time_coding",
  value: 60 * 100,
  xp: 5000
}));

this.Achievements.add(new this.Achievement({
  id: "code/kurt_godel",
  name: "Kurt Gödel",
  description: "You spent 200 hours coding, keep it up!",
  story: "Kurt Gödel was a logician, mathematician and philosopher. His work on the logical consistency of mathematical systems lies at the foundation of modern computer science.",
  stat: "time_coding",
  value: 60 * 200,
  xp: 5500
}));

this.Achievements.add(new this.Achievement({
  id: "code/alan_turing",
  name: "Alan Turing",
  description: "You spent 500 hours coding, keep it up!",
  story: "Alan Turing was an English mathematician, computer scientist, cryptanalyst, philosopher... He created the Turing Machine computational model and explored the philosophical issues concerning artificial intelligence.",
  stat: "time_coding",
  value: 60 * 500,
  xp: 6000
}));

this.Achievements.add(new this.Achievement({
  id: "art/cave_art",
  name: "Cave Art",
  description: "You started drawing!",
  stat: "time_drawing",
  value: 3,
  xp: 500
}));

this.Achievements.add(new this.Achievement({
  id: "art/greek_art",
  name: "Greek Art",
  description: "You spent 10 minutes drawing, keep it up!",
  stat: "time_drawing",
  value: 10,
  xp: 1000
}));

this.Achievements.add(new this.Achievement({
  id: "art/renaissance",
  name: "Renaissance",
  description: "You spent 30 minutes drawing, well done!",
  stat: "time_drawing",
  value: 30,
  xp: 1500
}));

this.Achievements.add(new this.Achievement({
  id: "art/impressionism",
  name: "Impressionism",
  description: "You spent 1 hour drawing, amazing!",
  stat: "time_drawing",
  value: 60,
  xp: 2000
}));

this.Achievements.add(new this.Achievement({
  id: "art/post_impressionism",
  name: "Post Impressionism",
  description: "You spent 2 hours drawing sprites, starts looking like an addiction!",
  stat: "time_drawing",
  value: 60 * 2,
  xp: 2500
}));

this.Achievements.add(new this.Achievement({
  id: "art/expressionism",
  name: "Expressionism",
  description: "You spent 5 hours drawing sprites, O.M.G!",
  stat: "time_drawing",
  value: 60 * 5,
  xp: 3000
}));

this.Achievements.add(new this.Achievement({
  id: "art/surrealism",
  name: "Surrealism",
  description: "You spent 10 hours drawing, isn't that crazy?",
  stat: "time_drawing",
  value: 60 * 10,
  xp: 3500
}));

this.Achievements.add(new this.Achievement({
  id: "art/cubism",
  name: "Cubism",
  description: "You spent 20 hours drawing, seems more than just a hobby!",
  stat: "time_drawing",
  value: 60 * 20,
  xp: 4000
}));

this.Achievements.add(new this.Achievement({
  id: "art/abstract",
  name: "Abstract Art",
  description: "You spent 50 hours drawing, keep it up!",
  stat: "time_drawing",
  value: 60 * 50,
  xp: 4500
}));

this.Achievements.add(new this.Achievement({
  id: "art/contemporary",
  name: "Contemporary",
  description: "You spent 100 hours drawing, keep it up!",
  stat: "time_drawing",
  value: 60 * 100,
  xp: 5000
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level1",
  name: "Level Design Rookie",
  description: "You started creating a map, keep it up!",
  stat: "time_mapping",
  value: 3,
  xp: 500
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level2",
  name: "Junior Level Designer",
  description: "You spent 10 minutes working on maps, well done!",
  stat: "time_mapping",
  value: 10,
  xp: 1000
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level3",
  name: "Regular Level Designer",
  description: "You spent 30 minutes working on maps, amazing!",
  stat: "time_mapping",
  value: 30,
  xp: 1500
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level4",
  name: "Senior Level Designer",
  description: "You spent 1 hour working on maps, starts looking like an addiction!",
  stat: "time_mapping",
  value: 60,
  xp: 2000
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level5",
  name: "Level Design Expert",
  description: "You spent 2 hours working on maps, O.M.G!",
  stat: "time_mapping",
  value: 60 * 2,
  xp: 2500
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level6",
  name: "Level Design Mentor",
  description: "You spent 5 hours working on maps, isn't that crazy?",
  stat: "time_mapping",
  value: 60 * 5,
  xp: 3000
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level7",
  name: "Level Design Master",
  description: "You spent 10 hours working on maps, seems more than just a hobby!",
  stat: "time_mapping",
  value: 60 * 10,
  xp: 3500
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level8",
  name: "Level Design Champion",
  description: "You spent 20 hours working on maps, keep it up!",
  stat: "time_mapping",
  value: 60 * 20,
  xp: 4000
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level9",
  name: "Level Design Star",
  description: "You spent 50 hours working on maps, keep it up!",
  stat: "time_mapping",
  value: 60 * 50,
  xp: 4500
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level10",
  name: "Level Design SuperBoss",
  description: "You spent 100 hours working on maps, keep it up!",
  stat: "time_mapping",
  value: 60 * 100,
  xp: 5000
}));

this.Achievements.add(new this.Achievement({
  id: "level_design/level11",
  name: "Level Design God",
  description: "You spent 200 hours working on maps, keep it up!",
  stat: "time_mapping",
  value: 60 * 200,
  xp: 5500
}));

this.Achievements.add(new this.Achievement({
  id: "tutorials/tutorial_tour",
  name: "microStudio Tourist",
  description: "You completed the microStudio tour tutorial series!",
  xp: 500
}));

this.Achievements.add(new this.Achievement({
  id: "tutorials/tutorial_programming",
  name: "Trained Programmer",
  description: "You completed the microStudio programming tutorial series!",
  xp: 1000
}));

this.Achievements.add(new this.Achievement({
  id: "tutorials/tutorial_drawing",
  name: "Digital Art Coder",
  description: "You completed the microStudio tutorials about drawing with code!",
  xp: 1500
}));

this.Achievements.add(new this.Achievement({
  id: "tutorials/tutorial_game",
  name: "Game Programmer",
  description: "You completed the microStudio tutorial series on creating a simple game!",
  xp: 2000
}));

this.Achievements.add(new this.Achievement({
  id: "community/5_likes",
  name: "Recognition",
  description: "Your public project received 5 likes!",
  xp: 2000
}));

this.Achievements.add(new this.Achievement({
  id: "community/forum_post",
  name: "Active Community Member",
  description: "You made a public post in the community forum!",
  xp: 1000
}));

this.Achievements.add(new this.Achievement({
  id: "community/game_jam_contender",
  name: "Game Jam Contender",
  description: "You made a submission to a microStudio Game Jam",
  xp: 2000
}));

this.Achievements.add(new this.Achievement({
  id: "community/game_jam_n1",
  name: "Game Jam Winner",
  description: "You won the first prize in a microStudio Game Jam!",
  xp: 10000
}));

this.Achievements.add(new this.Achievement({
  id: "community/game_jam_n2",
  name: "Game Jam Silver",
  description: "You won the second prize in a microStudio Game Jam!",
  xp: 5000
}));

this.Achievements.add(new this.Achievement({
  id: "community/game_jam_n3",
  name: "Game Jam Bronze",
  description: "You won the third prize in a microStudio Game Jam!",
  xp: 2500
}));

module.exports = this.Achievements;
