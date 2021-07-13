Levels = require __dirname+"/levels.js"
Achievements = require __dirname+"/achievements.js"

class @UserProgress
  constructor:(@user,data)->
    @stats = data.stats or { xp: 0 , level: 0 }
    @achievements = data.achievements or {}

    @time_ids = {}

  recordTime:(id)->
    t = Math.floor(Date.now()/60000)

    return if t == @time_ids[id]
    @time_ids[id] = t
    @incrementStat(id,1,false)
    @incrementStat("xp",60)

  unlockAchievement:(id,name,description,xp=0)->
    if not @hasAchievement(id)
      @achievements[id] =
        id: id
        name: name
        description: description
        xp: xp

      @incrementStat("xp",xp) if xp>0

      @saveAchievements()

  hasAchievement:(id)->
    @achievements[id]?

  incrementStat:(id,value,save=true)->
    if @stats[id]?
      @stats[id] += value
    else
      @stats[id] = value

    if id == "xp"
      while @stats.xp>=Levels.total_cost[@stats.level]
        @stats.level += 1

    achievements = Achievements.by_stat[id]
    if achievements?
      for a in achievements
        if @stats[id] >= a.value and not @hasAchievement(a.id)
          @unlockAchievement a.id,a.name,a.description,a.xp

    @saveStats() if save

  saveStats:()->
    @user.record.set "stats",@stats

  saveAchievements:()->
    @user.record.set "achievements",@achievements

  get:()->
    return
      stats: @stats
      achievements: @achievements

module.exports = @UserProgress
