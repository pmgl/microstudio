
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
  value: 10
  xp: 1000


# Abstract Artist
# Impressionist
# Romantic Artist
# Realist Artist
# Classic Artist

@Achievements.add new @Achievement "abstract_artist","Abstract Artist","Spent one hour painting squares","time_drawing",60,1000
@Achievements.add new @Achievement "impressionist","Impressionist","Spent ten hours painting dots","time_drawing",600,3000
@Achievements.add new @Achievement "romantic","Romantic Artist","Spent hundred hours creating art","time_drawing",600,3000
@Achievements.add new @Achievement "impressionist","Impressionist","Spent ten hours painting dots","time_drawing",600,3000



@Achievements.add new @Achievement "gd_junior","Level Design Junior","Spent one hour creating maps","time_mapping",60,1000
@Achievements.add new @Achievement "gd_junior","Level Design Holder","Spent 10 hours creating maps","time_mapping",600,3000
@Achievements.add new @Achievement "gd_junior","Level Design Master","Spent 100 hours creating maps","time_mapping",6000,10000
@Achievements.add new @Achievement "gd_junior","Level Design Expert","Spent 1000 hours creating maps","time_mapping",60000,100000

module.exports = @Achievements
