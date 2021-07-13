
# describes automatic achievements based on stats
@Achievement = class
  constructor:(@id,@name,@description,@stat,@value,@xp)->

@Achievements = new class
  constructor:()->
    @list = []
    @by_stat = {}

  add:(a)->
    @list.push a
    by_stat = @by_stat[a.stat]
    if not by_stat?
      by_stat = @by_stat[a.stat] = []

    by_stat.push a
    @by_id[a.id] = a

@Achievements.add new @Achievement "code_rookie","Code Rookie","Spent one hour coding","time_coding",60,1000
@Achievements.add new @Achievement "code_explorer","Code Explorer","Spent 10 hours coding","time_coding",600,5000
@Achievements.add new @Achievement "code_hero","Code Hero","Spent 100 hours coding","time_coding",6000,25000
@Achievements.add new @Achievement "code_boss","Boss of Code","Spent 1000 hours coding","time_coding",60000,100000


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
