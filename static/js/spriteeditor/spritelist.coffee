class @SpriteList
  constructor:(@app)->
    @list = []
    @table = {}
    @listeners = []

  add:(sprite)->
    if @list.indexOf(sprite)<0
      @list.push sprite
    @table[sprite.name] = sprite
    for lis in @listeners
      lis.spriteListChanged()
    return


  rename:(old_name,new_name)->
    if @table[old_name]?
      @table[new_name] = @table[old_name]
      delete @table[old_name]

    for lis in @listeners
      lis.spriteListChanged()

    return

  get:(name)->
    @table[name]

  delete:(sprite)->
    index = @list.indexOf sprite
    if index>=0
      @list.splice index,1
    delete @table[sprite.name]
    for lis in @listeners
      lis.spriteListChanged()
    return

  addListener:(listener)->
    @listeners.push listener

  clear:()->
    @list.length = 0
    for key of @table
      delete @table[key]

    for lis in @listeners
      lis.spriteListChanged()
    return

  listFiles:()->
    @list[i].name+".png" for i in [0..@list.length-1] by 1

  update:(list)->
    for i in [@list.length-1..0] by -1
      s = @list[i]
      if list.indexOf(s.name+".png")<0
        @list.splice i,1

    url = location.origin+"/#{@app.nick}/#{app.project.slug}/"
    for s in list

      u = url+s
      name = s.substring(0,s.length-4)
      s = new Sprite u
      s.name = name
      @add s
    for lis in @listeners
      lis.spriteListChanged()
    return
