class Random
  constructor:(@seed=Math.random())->
    @seed *= 1 << 30 if @seed<1
    @a = 13971
    @b = 12345
    @size = 1 << 30
    @mask = @size-1
    @norm = 1/@size
    @nextSeed()
    @nextSeed()
    @nextSeed()

  next:()->
    @seed = (@seed*@a+@b) & @mask
    @seed*@norm

  nextInt:(num)->
    Math.floor(@next()*num)

  nextSeed:()->
    @seed = (@seed*@a+@b) & @mask

  setSeed:(@seed)->
    @seed *= 1 << 30 if @seed<1
    @nextSeed()
    @nextSeed()
    @nextSeed()
