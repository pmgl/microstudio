@Levels = class
  constructor:()->
    @total_cost = []
    sum = 0
    for i in [0..499] by 1
      @total_cost[i] = sum
      console.info(i+" => "+sum)
      sum += @costOfLevelUp(i)

    #for i in [0..499] by 1

  costOfLevelUp:(from_level)->
    xp = (from_level+5)*(from_level+5)*20

module.exports = new @Levels()
