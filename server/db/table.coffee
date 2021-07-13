fs = require "fs"
Record = require "./record.js"

CLUSTER_SIZE = 1000

class @Table
  constructor:(@db,@name)->
    @folder = @db.folder+"/"+@name

    @records = {}
    @clusters = {}
    @indexes = {}
    @current_id = 0

    if not fs.existsSync(@folder)
      fs.mkdirSync @folder
    else
      @load()

    @scheduler = setInterval (()=>@timer()),2000

  close:()->
    clearInterval @scheduler

  load:(dir=@folder)->
    files = fs.readdirSync dir
    queue = []
    cluster = 0
    loop
      break if files.indexOf(cluster+"")<0 and files.indexOf(cluster+".bak")<0
      fi = dir+"/"+cluster
      queue.push cluster
      cluster++

    funk = ()=>
      if queue.length>0
        f = queue.splice(0,1)[0]
        console.info "loading cluster #{f}"
        cluster = new Cluster @,f|0
        @clusters[f|0] = cluster
        cluster.load(funk)
      else
        @loaded = true
        @db.tableLoaded()

    funk()
    return

  create:(data)->
    cluster_id = Math.floor(@current_id/CLUSTER_SIZE)
    cluster = @clusters[cluster_id]
    if not cluster?
      cluster = new Cluster @,cluster_id
      @clusters[cluster_id] = cluster

    record = new Record @,cluster,@current_id++,data
    cluster.addRecord record
    @records[record.id] = record

  updateIndexes:(record,old_data,data)->
    for key,value of old_data
      if data[key] != value
        index = @indexes[key]
        if index?
          v = index[value]
          if v?
            if v == record
              delete index[value]
            else if Array.isArray(v) and v.indexOf(record)>=0
              v.splice v.indexOf(record),1
              index[value] = v[0] if v.length == 1
          value = data[key]
          i = index[value]
          if i?
            if not Array.isArray i
              i = index[value] = [i]
            i.push record
          else
            index[value] = record
    return

  getIndex:(field)->
    index = @indexes[field]
    if not index?
      @indexes[field] = index = {}
      for key,record of @records
        value = record.get()[field]
        if value?
          i = index[value]
          if i?
            if not Array.isArray i
              i = index[value] = [i]
            i.push record
          else
            index[value] = record
    index

  get:(id,value)->
    if value?
      index = @getIndex(id)
      list = index[value]
      if list?
        if Array.isArray(list)
          return (v.get() for v in list)
        else
          return list.get()
      else
        null
    else
      @records[id]

  set:(id,data)->
    record = @records[id]
    if record?
      record.set data

  list:()->
    list = []
    for key,r of @records
      list.push r
    list

  timer:()->
    for key,cluster of @clusters
      cluster.timer()
    return

class Cluster
  constructor:(@table,@id)->
    @records = []
    @save_requested = false

  addRecord:(record)->
    @records.push record
    @save_requested = true

  load:(callback)->
    file = "#{@table.folder}/#{@id}"
    fs.readFile file,(err,data)=>
      try
        data = JSON.parse data
        for r in data
          record = new Record(@table,@,r.id,r)
          @records.push record
          @table.records[record.id] = record
          @table.current_id = Math.max(@table.current_id,record.id+1)
        console.info "cluster loaded: "+@id
        return callback()
      catch err
        console.error err
        fs.readFile file+".bak",(err,data)=>
          try
            data = JSON.parse data
            for r in data
              record = new Record(@table,@,r.id,r)
              @records.push record
              @table.records[record.id] = record
              @table.current_id = Math.max(@table.current_id,record.id+1)
            console.info "cluster loaded from backup: "+@id
            return callback()
          catch err
            console.error err
            throw "DB loading error with cluster: #{file}"

  save:()->
    data = []
    for r in @records
      data.push r.get()

    data = JSON.stringify data
    file = "#{@table.folder}/#{@id}"
    fs.writeFile file,data,(err)=>
      if not err
        fs.writeFile file+".bak",data,(err)=>
      console.info "cluster #{@table.name}:#{@id} saved"

  timer:()->
    try
      if @save_requested
        @save_requested = false
        @save()
    catch err
      console.error err

module.exports = @Table
