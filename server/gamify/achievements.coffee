
@Achievement = class
  constructor:(props)->
    @id = props.id
    @name = props.name
    @description = props.description
    @story = props.story
    @stat = props.stat
    @value = props.value
    @xp = props.xp or 0

@Achievements = new class
  constructor:()->
    @list = []
    @by_stat = {}
    @by_id = {}

  add:(a)->
    @list.push a
    @by_id[a.id] = a

    if a.stat?
      by_stat = @by_stat[a.stat]
      if not by_stat?
        by_stat = @by_stat[a.stat] = []

      by_stat.push a


# Code achievements
##########################

@Achievements.add new @Achievement
  id:"code/al_khwarizmi"
  name: "Al Khwarizmi"
  description: "You actually started coding!"
  story: "Al Khwarizmi was a Persian polymath who produced vastly influential works in mathematics, astronomy, and geography. His name gave rise to the term 'algorithm'."
  stat: "time_coding"
  value: 2
  xp: 500

@Achievements.add new @Achievement
  id:"code/al_jazari"
  name: "Al Jazari"
  description: "You spent 10 minutes coding, keep it up!"
  story: "Al Jazari was a Muslim scientist, artist, mathematician living in Mesopotamia. He invented an astronomical clock considered the first programmable analog computer."
  stat: "time_coding"
  value: 4
  xp: 1000

@Achievements.add new @Achievement
  id:"code/blaise_pascal"
  name: "Blaise Pascal"
  description: "You spent 30 minutes coding, keep it up!"
  story: "Blaise Pascal was a French mathematician, physicist, inventor, philosopher. He invented the mechanical calculator."
  stat: "time_coding"
  value: 6
  xp: 1500

@Achievements.add new @Achievement
  id:"code/gottfried_leibniz"
  name: "Gottfried Leibniz"
  description: "You spent 1 hour coding, keep it up!"
  story: "."
  stat: "time_coding"
  value: 8
  xp: 2000

@Achievements.add new @Achievement
  id:"code/joseph_jacquard"
  name: "Joseph Jacquard"
  description: "You spent 2 hours coding, keep it up!"
  story: "."
  stat: "time_coding"
  value: 10
  xp: 2500

@Achievements.add new @Achievement
  id:"code/charles_babbage"
  name: "Charles Babbage"
  description: "You spent 5 hours coding, keep it up!"
  story: "."
  stat: "time_coding"
  value: 12
  xp: 3000

@Achievements.add new @Achievement
  id:"code/george_boole"
  name: "George Boole"
  description: "You spent 10 hours coding, keep it up!"
  story: "."
  stat: "time_coding"
  value: 14
  xp: 3500

@Achievements.add new @Achievement
  id:"code/ada_lovelace"
  name: "Ada Lovelace"
  description: "You spent 20 hours coding, keep it up!"
  story: "."
  stat: "time_coding"
  value: 14
  xp: 4000

@Achievements.add new @Achievement
  id:"code/emile_baudot"
  name: "Emile Baudot"
  description: "You spent 50 hours coding, keep it up!"
  story: "."
  stat: "time_coding"
  value: 14
  xp: 4500

@Achievements.add new @Achievement
  id:"code/bertrand_russell"
  name: "Bertrand Russell"
  description: "You spent 100 hours coding, keep it up!"
  story: "."
  stat: "time_coding"
  value: 14
  xp: 5000

@Achievements.add new @Achievement
  id:"code/kurt_godel"
  name: "Kurt Gödel"
  description: "You spent 200 hours coding, keep it up!"
  story: "."
  stat: "time_coding"
  value: 14
  xp: 5500

@Achievements.add new @Achievement
  id:"code/alan_turing"
  name: "Alan Turing"
  description: "You spent 500 hours coding, keep it up!"
  story: "."
  stat: "time_coding"
  value: 14
  xp: 6000


# Art achievements
##########################
@Achievements.add new @Achievement
  id:"art/cave_art"
  name: "Cave Art"
  description: "You started drawing, keep it up!"
  stat: "time_drawing"
  value: 2
  xp: 500

@Achievements.add new @Achievement
  id:"art/greek_art"
  name: "Greek Art"
  description: "You spent 10 minutes drawing, keep it up!"
  stat: "time_drawing"
  value: 4
  xp: 1000

@Achievements.add new @Achievement
  id:"art/renaissance"
  name: "Renaissance"
  description: "You spent 30 minutes drawing, keep it up!"
  stat: "time_drawing"
  value: 6
  xp: 1000

@Achievements.add new @Achievement
  id:"art/impressionism"
  name: "Impressionism"
  description: "You spent 1 hour drawing, keep it up!"
  stat: "time_drawing"
  value: 8
  xp: 1000

@Achievements.add new @Achievement
  id:"art/post_impressionism"
  name: "Post Impressionism"
  description: "You spent 2 hours drawing, keep it up!"
  stat: "time_drawing"
  value: 10
  xp: 1000

@Achievements.add new @Achievement
  id:"art/expressionism"
  name: "Expressionism"
  description: "You spent 2 hours drawing, keep it up!"
  stat: "time_drawing"
  value: 12
  xp: 1000

@Achievements.add new @Achievement
  id:"art/surrealism"
  name: "Surrealism"
  description: "You spent 2 hours drawing, keep it up!"
  stat: "time_drawing"
  value: 14
  xp: 1000

@Achievements.add new @Achievement
  id:"art/cubism"
  name: "Cubism"
  description: "You spent 2 hours drawing, keep it up!"
  stat: "time_drawing"
  value: 16
  xp: 1000

@Achievements.add new @Achievement
  id:"art/abstract"
  name: "Abstract Art"
  description: "You spent 2 hours drawing, keep it up!"
  stat: "time_drawing"
  value: 18
  xp: 1000

@Achievements.add new @Achievement
  id:"art/contemporary"
  name: "Contemporary"
  description: "You spent 2 hours drawing, keep it up!"
  stat: "time_drawing"
  value: 20
  xp: 1000

# Level design achievements
###########################
@Achievements.add new @Achievement
  id:"level_design/level1"
  name: "Level Design Rookie"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 2
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level2"
  name: "Junior Level Designer"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 4
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level3"
  name: "Regular Level Designer"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 6
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level4"
  name: "Senior Level Designer"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 8
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level5"
  name: "Level Design Expert"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 10
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level6"
  name: "Level Design Mentor"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 12
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level7"
  name: "Level Design Master"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 14
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level8"
  name: "Level Design Champion"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 16
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level9"
  name: "Level Design Star"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 18
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level10"
  name: "Level Design SuperBoss"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 20
  xp: 500

@Achievements.add new @Achievement
  id:"level_design/level11"
  name: "Level Design God"
  description: "You started creating a map, keep it up!"
  stat: "time_mapping"
  value: 22
  xp: 500

# Tutorial achievements
###########################

@Achievements.add new @Achievement
  id:"tutorials/tutorial_tour"
  name: "microStudio Tourist"
  description: "You completed the microStudio tour tutorial series!"
  xp: 500

@Achievements.add new @Achievement
  id:"tutorials/tutorial_programming"
  name: "Trained Programmer"
  description: "You completed the microStudio programming tutorial series!"
  xp: 1000

@Achievements.add new @Achievement
  id:"tutorials/tutorial_drawing"
  name: "Digital Art Coder"
  description: "You completed the microStudio tutorials about drawing with code!"
  xp: 1500

@Achievements.add new @Achievement
  id:"tutorials/tutorial_game"
  name: "Game Programmer"
  description: "You completed the microStudio tutorial series on creating a simple game!"
  xp: 2000

# Community achievements
##########################

@Achievements.add new @Achievement
  id:"community/5_likes"
  name: "Recognition"
  description: "Your public project received 5 likes!"
  xp: 2000

@Achievements.add new @Achievement
  id:"community/forum_post"
  name: "Active Community Member"
  description: "You made a public post in the community forum!"
  xp: 1000

@Achievements.add new @Achievement
  id:"community/game_jam_contender"
  name: "Game Jam Contender"
  description: "You made a submission to a microStudio Game Jam"
  xp: 2000

@Achievements.add new @Achievement
  id:"community/game_jam_n1"
  name: "Game Jam Winner"
  description: "You won the first prize in a microStudio Game Jam!"
  xp: 10000

@Achievements.add new @Achievement
  id:"community/game_jam_n2"
  name: "Game Jam Silver"
  description: "You won the second prize in a microStudio Game Jam!"
  xp: 5000

@Achievements.add new @Achievement
  id:"community/game_jam_n3"
  name: "Game Jam Bronze"
  description: "You won the third prize in a microStudio Game Jam!"
  xp: 2500

module.exports = @Achievements
