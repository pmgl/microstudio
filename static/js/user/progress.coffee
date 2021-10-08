class @UserProgress
  constructor:(@app)->
    @levels = new Levels()
    setInterval (()=>@updateXP()),50
    @target_xp = 0
    @xp = 0

  update:()->
    if @app.user?
      document.getElementById("header-progress-summary").classList.remove "hidden"

      level = @app.user.info.stats.level or 0
      xp = @app.user.info.stats.xp or 0
      document.getElementById("header-progress-level").innerText = @app.translator.get("Level %NUM%").replace("%NUM%",level)

      @target_xp = xp

      @checkLevel()
      @checkAchievements()

  checkLevel:()->
    if @app.user?
      if not @level?
        @level = @app.user.info.stats.level or 0
      else
        level = @app.user.info.stats.level or 0
        if level>@level
          @level = level
          @addNotification(null,@app.translator.get("Level %LEVEL% unlocked!").replace("%LEVEL%",level))
    return

  checkAchievements:()->
    if @app.user?
      if not @achievements?
        @achievements = {}
        for a in @app.user.info.achievements
          @achievements[a.id] = true
      else
        for a in @app.user.info.achievements
          if not @achievements[a.id]
            @achievements[a.id] = true
            @addNotification("/img/achievements/#{a.id}.png",@app.translator.get("New achievement unlocked!"))
    return

  updateXP:()->
    return if not @app.user?
    return if @target_xp>0 and @target_xp == @xp
    @xp += (@target_xp-@xp)*.1
    if Math.abs(@target_xp-@xp)<1
      @xp = @target_xp

    xp = Math.round(@xp)
    level = @app.user.info.stats.level or 0
    xp1 = if level>0 then @levels.total_cost[level-1] else 0
    xp2 = @levels.total_cost[level]
    dxp = xp2-xp1
    percent = Math.max(0,Math.min(99,Math.floor((xp-xp1)/dxp*100)))

    xp = @displayNumber(xp)
    document.getElementById("header-progress-xp").innerText = xp
    @setProgressBar("header-progress-xp",percent)

  setProgressBar:(id,percent)->
    return if not document.getElementById(id)?
    document.getElementById(id).style.background = "linear-gradient(90deg,hsl(200,50%,40%) 0%,hsl(0,50%,40%) #{percent}%,hsl(200,10%,5%) #{percent}%)"

  displayNumber:(x)->
    x = ""+x
    list = []
    while x.length>3
      list.splice(0,0,x.substring(x.length-3,x.length))
      x = x.substring(0,x.length-3)
    list.splice(0,0,x)
    return list.join(" ")

  updateStatsPage:()->
    div_level = document.getElementById("user-progress-level")
    div_level.innerHTML = ""

    div_stats = document.getElementById("user-progress-statistics")
    div_stats.innerHTML = ""
    map =
      pixels_drawn: "Pixels Drawn"
      map_cells_drawn: "Map Cells Painted"
      characters_typed: "Characters Typed"
      lines_of_code: "Lines of Code"
      time_coding: "Coding Time"
      time_drawing: "Drawing Time"
      time_mapping: "Map Editor Time"
      xp: "XP"
      level: "Level"

    list = [
      "level"
      "xp"
      "characters_typed"
      "lines_of_code"
      "pixels_drawn"
      "map_cells_drawn"
      "time_coding"
      "time_drawing"
      "time_mapping"
    ]

    for key in list  #,value of @app.user.info.stats
      value = @app.user.info.stats[key]
      continue if not value?
      unit = ""
      if key.startsWith "time"
        if value>=60
          unit = @app.translator.get("hours")
          value = Math.floor(value/60)
        else
          unit = @app.translator.get("minutes")

      div = if key in ["xp","level"] then div_level else div_stats

      div.innerHTML += """
        <div class="user-progress-stat" id="user-progress-stat-#{key}">
          <div class="user-progress-stat-value">#{@displayNumber(value)}<span class="unit">#{unit}</span></div>
          <div class="user-progress-stat-label">#{if map[key] then @app.translator.get(map[key]) else key}</div>
        </div>
      """

    xp = @app.user.info.stats.xp
    level = @app.user.info.stats.level
    xp1 = if level>0 then @levels.total_cost[level-1] else 0
    xp2 = @levels.total_cost[level]
    dxp = xp2-xp1
    percent = Math.max(0,Math.min(99,Math.floor((xp-xp1)/dxp*100)))

    @setProgressBar("user-progress-stat-xp",percent)

    div_achievements = document.getElementById("user-progress-achievements")
    div_achievements.innerHTML = ""
    list = @app.user.info.achievements
    list.sort (a,b)-> b.date-a.date

    if list.length>0
      document.getElementById("number-of-achievements").innerText = " (#{list.length})"
    else
      document.getElementById("number-of-achievements").innerText = ""

    for a in list
      bonus = ""
      if a.info.xp?
        bonus = """<div class="bonus">XP bonus +#{a.info.xp}</div>"""

      div_achievements.innerHTML += """
        <div class="user-progress-achievement">
          <img src="/img/achievements/#{a.id}.png" />
          #{bonus}
          <h3>#{a.info.name}</h3>
          <p>#{a.info.description}</p>
          #{if a.info.story? then ("<p class='story'>"+a.info.story+"</p>") else "" }
          <div style="clear: both"></div>
        </div>
      """

  addNotification:(image,text)->
    parent = document.getElementById "user-progress-notifications"
    div = document.createElement "div"
    div.classList.add "user-progress-notification"
    i = document.createElement "i"
    i.classList.add "fa"
    i.classList.add "fa-times"
    i.classList.add "close"

    if image?
      div.innerHTML += """<img src="#{image}" />"""

    div.innerHTML += " #{text}<div style='clear:both'></div>"
    div.addEventListener "click",()=>
      @app.openUserProgress()

      div.style.left = "400px"
      setTimeout (()=>parent.removeChild(div)),1000

    div.insertBefore i,div.childNodes[0]

    i.addEventListener "click",(event)=>
      event.stopPropagation()
      div.style.left = "400px"
      setTimeout (()=>parent.removeChild(div)),1000

    setTimeout (()=> div.style.left = "0px"),100

    parent.appendChild div


Levels = class
  constructor:()->
    @total_cost = []
    sum = 0
    for i in [0..499] by 1
      sum += @costOfLevelUp(i)
      @total_cost[i] = sum

  costOfLevelUp:(from_level)->
    xp = (from_level+5)*(from_level+5)*20
