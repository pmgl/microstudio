Levels = require __dirname+"/levels.js"
Achievements = require __dirname+"/achievements.js"

class @UserProgress
  constructor:(@user,data)->
    @stats = data.stats or { xp: 0 , level: 0 }
    @achievements = data.achievements or {}

    @time_ids = {}
    @limited_time = {}
    @limited_value = {}

    @stats_update = 0
    @achievements_update = 0
    @levels = Levels # used in webapp

  recordTime:(id)->
    t = Math.floor(Date.now()/60000)

    return if t == @time_ids[id]
    @time_ids[id] = t
    @incrementStat(id,1,true)

  unlockAchievement:(id)->
    if not @hasAchievement(id)
      @achievements[id] =
        id: id
        date: Date.now()

      a = Achievements.by_id[id]
      if a? and a.xp?
        @incrementStat("xp",a.xp)

      @saveAchievements()
      @achievements_update += 1

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
          @unlockAchievement a.id

    @saveStats() if save

    @stats_update += 1

  incrementLimitedStat:(id,value)->
    minutes = 10
    max = 1200
    t = Math.floor(Date.now()/60000/minutes) # 10 minutes

    absolute = value

    if t != @limited_time[id]
      @limited_time[id] = t
      @limited_value[id] = 0

    value = Math.min(value,max-@limited_value[id])
    @limited_value[id] += value

    if absolute>0
      @incrementStat(id,absolute,false)

    if value>0
      @incrementStat("xp",value,false)

  saveStats:()->
    @user.set "stats",@stats

  saveAchievements:()->
    @user.set "achievements",@achievements

  get:()->
    return
      stats: @stats
      achievements: @achievements

  exportStats:()->
    @stats

  exportAchievements:()->
    list = []
    for own id,a of @achievements
      list.push
        id: a.id
        date: a.date
        info: Achievements.by_id[a.id]

    list

module.exports = @UserProgress
