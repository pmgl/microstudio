class @Undo
  constructor:(@listener)->
    @states = []
    @next_state = 0
    @max = 30

  pushState:(state)->
    if @next_state>=@max
      @states.splice 0,1
      @next_state -= 1

    @states[@next_state++] = state
    while @states.length>@next_state
      @states.splice(@states.length-1,1)
    state

  empty:()->
    @states.length == 0

  undo:()->
    if @next_state-2>=0 and @next_state-2<@states.length
      @next_state -= 1
      @states[@next_state-1]
    else
      null

  redo:()->
    if @next_state>=0 and @next_state<@states.length
      @next_state += 1
      @states[@next_state-1]
    else
      null
