fs = require "fs"

class @Record
  constructor:(@table,@cluster,@id,@data)->
    @data.id = @id
    @data = JSON.stringify @data

  get:()->
    JSON.parse @data

  set:(data)->
    old_data = @data
    @data = data
    @data.id = @id
    @data = JSON.stringify @data
    @cluster.save_requested = true
    @table.updateIndexes @,old_data,data

  setField:(field,value)->
    data = @get()
    if not value?
      delete data[field]
    else
      data[field] = value
    @set(data)

  getField:(field)->
    data = @get()
    data[field]

module.exports = @Record
