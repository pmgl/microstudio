class Random
  constructor:(@_seed=Math.random(),hash=true)->
    @_seed = Math.random() if @_seed == 0
    @_seed *= 1 << 30 if @_seed < 1
    @a = 13971
    @b = 12345
    @size = 1 << 30
    @mask = @size-1
    @norm = 1/@size
    if hash
      @nextSeed()
      @nextSeed()
      @nextSeed()

  next:()->
    @_seed = (@_seed*@a+@b) & @mask
    @_seed*@norm

  nextInt:(num)->
    Math.floor(@next()*num)

  nextSeed:()->
    @_seed = (@_seed*@a+@b) & @mask

  seed:(@_seed=Math.random())->
    @_seed *= 1 << 30 if @_seed < 1
    @nextSeed()
    @nextSeed()
    @nextSeed()

  clone:(seed)->
    if seed?
      new Random(seed)
    else
      seed = @_seed
      new Random(seed,false)
