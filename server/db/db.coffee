fs = require "fs"
Table = require __dirname+"/table.js"

class @DB
  constructor:(@folder="../data",@callback)->
    @tables = {}
    @save_list = []

    if not fs.existsSync(@folder)
      fs.mkdir @folder,=>@load()
    else
      @load()

  close:()->
    for key of @tables
      @tables[key].close()

  load:()->
    console.info "loading DB..."
    @load_time = Date.now()
    files = fs.readdirSync @folder
    for f in files
      if fs.lstatSync("#{@folder}/#{f}").isDirectory()
        table = new Table @,f
        @tables[f] = table

    @tableLoaded()
    return

  tableLoaded:()->
    for key,table of @tables
      return if not table.loaded

    if @callback?
      c = @callback
      delete @callback
      @load_time = Date.now()-@load_time
      console.info "DB load time: #{@load_time} ms"
      c @

  create:(table,data)->
    #console.info "creating #{JSON.stringify(data)}"
    t = @tables[table]
    if not t?
      t = new Table(@,table)
      @tables[table] = t

    t.create(data)

  get:(table,id,value)->
    t = @tables[table]
    if t? then t.get(id,value) else null

  set:(table,id,data)->
    t = @tables[table]
    t.set(id,data) if t?

  list:(table)->
    t = @tables[table]
    if not t?
      []
    else
      t.list()

module.exports = @DB
