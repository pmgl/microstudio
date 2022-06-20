fs = require "fs"
getDirName = require('path').dirname
JobQueue = require __dirname+"/../app/jobqueue.js"

class @FileStorage
  constructor:(@folder="../files")->
    if not fs.existsSync(@folder)
      fs.mkdir(@folder,=>)

  list:(file,callback)->
    file = @sanitize file

    f = @folder+"/#{file}"
    fs.readdir f,(err,files)=>
      callback(files)

  write:(file,content,callback)->
    file = @sanitize file

    @mkdirs getDirName(file),()=>
      f = @folder+"/#{file}"
      fs.writeFile f,content,()=>
        callback() if callback?

  delete:(file,callback)->
    file = @sanitize file

    f = @folder+"/#{file}"
    fs.unlink f,()=>
      callback() if callback?

  deleteFolder:(srcfile,callback)->
    file = @sanitize srcfile

    queue = new JobQueue()
    queue.conclude = ()=>
      fs.rmdir "#{@folder}/#{file}",(err)=>
        callback() if callback?

    addFile = (f)=>
      queue.add ()=>
        fs.lstat "#{@folder}/#{file}/#{f}",(err,stats)=>
          if err?
            queue.next()
          else if stats.isDirectory()
            @deleteFolder "#{srcfile}/#{f}",()=>queue.next()
          else
            @delete "#{srcfile}/#{f}",()=>queue.next()

    queue.add ()=>
      fs.readdir "#{@folder}/#{file}",(err,files)=>
        #console.info "#{@folder}/#{file} => "+JSON.stringify files
        if files?
          for f in files
            addFile f
        queue.next()

    queue.start()

  mkdirs:(folder,callback)->
    f = @folder+"/#{folder}"
    fs.stat f,(err,stat)=>
      if err?
        if folder.indexOf("/") > 0
          @mkdirs getDirName(folder),()=>
            fs.mkdir f,()=>
              callback()
        else
          fs.mkdir f,()=>
            callback()
      else
        callback()

    return

  sanitize:(file)->
    if file.startsWith "hs/"
      return file
      
    s = file.split("/")
    for i in [s.length-1..0] by -1
      if s[i].indexOf("..")>=0 or s[i] == ""
        s.splice i,1

    d1 = Math.floor(s[0]/10000)
    d2 = Math.floor(s[0]/100)%100
    d3 = s[0]%100

    s[0] = d3
    s.splice(0,0,d2)
    s.splice(0,0,d1)

    #console.info "input #{file} sanitized to #{s.join("/")}"

    s.join("/")

  read:(file,encoding,callback)->
    file = @sanitize file

    f = @folder+"/#{file}"
    fs.readFile f,(err,data)=>
      if data? and not err?
        switch encoding
          when "base64"
            callback data.toString "base64"
          when "binary"
            callback data
          else
            callback data.toString "utf8"
      else
        callback(null)

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

module.exports = @FileStorage
