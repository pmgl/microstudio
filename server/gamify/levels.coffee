@Levels = class
  constructor:()->
    @total_cost = []
    sum = 0
    for i in [0..499] by 1
      sum += @costOfLevelUp(i)
      @total_cost[i] = sum
      #console.info("level "+i+" => "+sum)

  costOfLevelUp:(from_level)->
    xp = (from_level+5)*(from_level+5)*20

module.exports = new @Levels()
