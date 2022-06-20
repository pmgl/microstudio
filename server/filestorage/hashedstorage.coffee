fs = require "fs"
getDirName = require('path').dirname
JobQueue = require __dirname+"/../app/jobqueue.js"
FileStorage = require __dirname+"/filestorage.js"
shajs = require "sha.js"
Converter = require __dirname+"/converter.js"

class FolderManager
  constructor:(@storage,@folder)->
    @files = {}
    @pending = []
    @loaded = false
    @load()

  load:()->
    @storage.filestorage.read @folder+"/links.txt",null,(data)=>
      if data?
        list = data.split("\n")
        for line in list
          line = line.split "="
          if line.length>1
            @files[line[1]] = line[0]

      @loaded = true
      while @pending.length > 0
        f = @pending.splice(0,1)[0]
        f()
      return

  hash:(content)->
    if typeof content == "string"
      return new shajs.sha256().update(content).digest('hex')
    else
      t = Date.now()
      hash = new shajs.sha256().update(content).digest('hex')
      console.info "shajs took #{Date.now()-t} ms"
      return hash

  write:(path,content,callback)->
    if not @loaded
      @pending.push () => @write path,content,callback
      return

    hash = @hash content
    console.info "hash = "+hash
    console.info "#{@folder}/#{path}"

    h = @files[path]
    if h? and @storage.unique[h]
      old = "hs/#{h.substring(0,2)}/#{h.substring(2,4)}/#{h}"
      @storage.filestorage.delete old,()->

    @files[path] = hash
    @save()

    p = "hs/#{hash.substring(0,2)}/#{hash.substring(2,4)}/#{hash}"

    fs.stat "#{@storage.folder}/#{p}",(err,stat)=>
      if err?
        @storage.unique[hash] = true
        @storage.filestorage.write p,content,callback
      else
        delete @storage.unique[hash]
        callback()

  delete:(path,callback)->
    if not @loaded
      @pending.push () => @delete path,callback
      return

    hash = @files[path]
    if hash?
      delete @files[path]
      @save()
      callback()
      if @storage.unique[hash]
        delete @storage.unique[hash]
        p = "hs/#{hash.substring(0,2)}/#{hash.substring(2,4)}/#{hash}"
        @storage.filestorage.delete p,()->
    else
      @storage.filestorage.delete "#{@folder}/#{path}",callback

  read:(path,encoding,callback)->
    if not @loaded
      @pending.push () => @read path,encoding,callback
      return


    hash = @files[path]
    if hash?
      p = "hs/#{hash.substring(0,2)}/#{hash.substring(2,4)}/#{hash}"
      @storage.filestorage.read p,encoding,callback
    else
      @storage.filestorage.read "#{@folder}/#{path}",encoding,callback

  list:(path,callback)->
    if not @loaded
      @pending.push () => @list path,callback
      return

    @storage.filestorage.list "#{@folder}/#{path}",(list)=>
      list = list or []
      for key,value of @files
        i = key.lastIndexOf "/"
        if i>=0
          folder = key.substring 0,i
          file = key.substring i+1

        if folder == path
          list.push file

      callback list

  save:()->
    if @save_timeout
      clearTimeout @save_timeout

    @save_timeout = setTimeout (()=>@doSave()),1000

  doSave:()->
    res = []
    for key,value of @files
      res.push "#{value}=#{key}"

    @storage.filestorage.write @folder+"/links.txt",res.join("\n"),(data)=>

class @HashedStorage
  constructor:(@folder="../files")->
    @filestorage = new FileStorage @folder
    @folders = {}
    @unique = {}
    @converter = new Converter @

  list:(file,callback)->
    f = file.split("/")
    if f.length > 2
      folder = f.slice(0,2).join("/")
      path = f.slice(2,f.length).join("/")
      console.info "folder = "+folder
      console.info "path = #{path}"
      @getFolderManager(folder).list(path,callback)
    else
      @filestorage.list file, callback

  getFolderManager:(folder)->
    folder_manager = @folders[folder]
    if not folder_manager?
      folder_manager = @folders[folder] = new FolderManager @,folder
    folder_manager

  write:(file,content,callback)->
    f = file.split("/")
    if f.length > 2
      folder = f.slice(0,2).join("/")
      path = f.slice(2,f.length).join("/")
      console.info "folder = "+folder
      console.info "path = #{path}"

      @getFolderManager(folder).write path,content,callback
    else
      @filestorage.write file,content,callback

  delete:(file,callback)->
    f = file.split("/")
    if f.length > 2
      folder = f.slice(0,2).join("/")
      path = f.slice(2,f.length).join("/")
      console.info "folder = "+folder
      console.info "path = #{path}"

      @getFolderManager(folder).delete path,callback
    else
      @filestorage.delete file,callback

  deleteFolder:(srcfile,callback)->
    @filestorage.deleteFolder srcfile,callback

  read:(file,encoding,callback)->
    f = file.split("/")
    if f.length > 2
      folder = f.slice(0,2).join("/")
      path = f.slice(2,f.length).join("/")
      console.info "folder = "+folder
      console.info "path = #{path}"

      @getFolderManager(folder).read path,encoding,callback
    else
      @filestorage.read file,encoding,callback

  copyFile:(path,file,callback)->
    fs.readFile path,(err,data)=>
      if data? and not err?
        @write(file,data,callback)
      else
        console.info err

  copy:(source,dest,callback)->
    @read source,"binary",(data)=>
      @write dest,data,()=>
        callback() if callback?

module.exports = @HashedStorage
