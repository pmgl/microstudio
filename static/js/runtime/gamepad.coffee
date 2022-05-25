class @Gamepad
  constructor:(@listener,@index = 0)->
    try
      if navigator.getGamepads?
        pads = navigator.getGamepads()
        if @index < pads.length and pads[@index]?
          @pad = pads[@index]
    catch error
      console.error error

    @buttons_map =
      0: "A"
      1: "B"
      2: "X"
      3: "Y"
      4: "LB"
      5: "RB"
      8: "VIEW"
      9: "MENU"
      10: "LS"
      11: "RS"
      12: "DPAD_UP"
      13: "DPAD_DOWN"
      14: "DPAD_LEFT"
      15: "DPAD_RIGHT"

    @triggers_map =
      6: "LT"
      7: "RT"

    @status =
      press: {}
      release: {}

    @previous =
      global: {}
      0: {}
      1: {}
      2: {}
      3: {}

  update:()->
    try
      pads = navigator.getGamepads()
    catch err
      return

    pad_count = 0
    for pad,i in pads
      break if not pad?
      pad_count++
      if not @status[i]
        @status[i] =
          press: {}
          release: {}

      for key,value of @buttons_map
        if pad.buttons[key]?
          @status[i][value] = if pad.buttons[key].pressed then 1 else 0

      for key,value of @triggers_map
        if pad.buttons[key]?
          @status[i][value] = pad.buttons[key].value

      if pad.axes.length>=2
        x = pad.axes[0]
        y = -pad.axes[1]
        r = Math.sqrt(x*x+y*y)
        angle = Math.floor(((Math.atan2(y,x)+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*360)
        @status[i].LEFT_STICK_ANGLE = angle
        @status[i].LEFT_STICK_AMOUNT = r
        @status[i].LEFT_STICK_UP = y>.5
        @status[i].LEFT_STICK_DOWN = y<-.5
        @status[i].LEFT_STICK_LEFT = x<-.5
        @status[i].LEFT_STICK_RIGHT = x>.5

      if pad.axes.length>=4
        x = pad.axes[2]
        y = -pad.axes[3]
        r = Math.sqrt(x*x+y*y)
        angle = Math.floor(((Math.atan2(y,x)+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*360)
        @status[i].RIGHT_STICK_ANGLE = angle
        @status[i].RIGHT_STICK_AMOUNT = r
        @status[i].RIGHT_STICK_UP = y>.5
        @status[i].RIGHT_STICK_DOWN = y<-.5
        @status[i].RIGHT_STICK_LEFT = x<-.5
        @status[i].RIGHT_STICK_RIGHT = x>.5

#      if pad.axes.length>=6
#        @status[i].LT = pad.axes[2]>0
#        @status[i].RT = pad.axes[5]>0

    for key,value of @buttons_map
      @status[value] = 0
      for pad in pads
        break if not pad?
        if pad.buttons[key]? and pad.buttons[key].pressed
          @status[value] = 1

    for key,value of @triggers_map
      @status[value] = 0
      for pad in pads
        break if not pad?
        if pad.buttons[key]?
          @status[value] = pad.buttons[key].value

    @status.UP = 0
    @status.DOWN = 0
    @status.LEFT = 0
    @status.RIGHT = 0
    @status.LEFT_STICK_UP = 0
    @status.LEFT_STICK_DOWN = 0
    @status.LEFT_STICK_LEFT = 0
    @status.LEFT_STICK_RIGHT = 0
    @status.RIGHT_STICK_UP = 0
    @status.RIGHT_STICK_DOWN = 0
    @status.RIGHT_STICK_LEFT = 0
    @status.RIGHT_STICK_RIGHT = 0
    @status.LEFT_STICK_ANGLE = 0
    @status.LEFT_STICK_AMOUNT = 0
    @status.RIGHT_STICK_ANGLE = 0
    @status.RIGHT_STICK_AMOUNT = 0
    @status.RT = 0
    @status.LT = 0

    for i in [0..pad_count-1] by 1
      @status[i].UP = @status[i].DPAD_UP or @status[i].LEFT_STICK_UP or @status[i].RIGHT_STICK_UP
      @status[i].DOWN = @status[i].DPAD_DOWN or @status[i].LEFT_STICK_DOWN or @status[i].RIGHT_STICK_DOWN
      @status[i].LEFT = @status[i].DPAD_LEFT or @status[i].LEFT_STICK_LEFT or @status[i].RIGHT_STICK_LEFT
      @status[i].RIGHT = @status[i].DPAD_RIGHT or @status[i].LEFT_STICK_RIGHT or @status[i].RIGHT_STICK_RIGHT

      @status.UP = 1 if @status[i].UP
      @status.DOWN = 1 if @status[i].DOWN
      @status.LEFT = 1 if @status[i].LEFT
      @status.RIGHT = 1 if @status[i].RIGHT
      @status.LEFT_STICK_UP = 1 if @status[i].LEFT_STICK_UP
      @status.LEFT_STICK_DOWN = 1 if @status[i].LEFT_STICK_DOWN
      @status.LEFT_STICK_LEFT = 1 if @status[i].LEFT_STICK_LEFT
      @status.LEFT_STICK_RIGHT = 1 if @status[i].LEFT_STICK_RIGHT
      @status.RIGHT_STICK_UP = 1 if @status[i].RIGHT_STICK_UP
      @status.RIGHT_STICK_DOWN = 1 if @status[i].RIGHT_STICK_DOWN
      @status.RIGHT_STICK_LEFT = 1 if @status[i].RIGHT_STICK_LEFT
      @status.RIGHT_STICK_RIGHT = 1 if @status[i].RIGHT_STICK_RIGHT

      @status.LT = @status[i].LT if @status[i].LT
      @status.RT = @status[i].RT if @status[i].RT

      if @status[i].LEFT_STICK_AMOUNT>@status.LEFT_STICK_AMOUNT
        @status.LEFT_STICK_AMOUNT = @status[i].LEFT_STICK_AMOUNT
        @status.LEFT_STICK_ANGLE = @status[i].LEFT_STICK_ANGLE

      if @status[i].RIGHT_STICK_AMOUNT>@status.RIGHT_STICK_AMOUNT
        @status.RIGHT_STICK_AMOUNT = @status[i].RIGHT_STICK_AMOUNT
        @status.RIGHT_STICK_ANGLE = @status[i].RIGHT_STICK_ANGLE

    for i in [pad_count..3] by 1
      delete @status[i]

    @count = pad_count

    @updateChanges(@status,@previous.global)
    for i in [0..pad_count-1] by 1
      @updateChanges(@status[i],@previous[i])
    return


  updateChanges:(current,previous)->
    for key of current.press
      current.press[key] = 0

    for key of current.release
      current.release[key] = 0

    for key of previous
      if previous[key] and not current[key]
        current.release[key] = 1

    for key of current
      continue if key == "press" or key == "release"
      if current[key] and not previous[key]
        current.press[key] = 1

    for key of previous
      previous[key] = 0

    for key of current
      continue if key == "press" or key == "release"
      previous[key] = current[key]

    return
