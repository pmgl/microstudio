class @ProjectInterface
  constructor:(@runtime)->

    @interface =
      listFiles: (path,callback) => @listFiles(path,callback)
      readFile: (path,callback) => @readFile(path,callback)
      writeFile: (path,obj,options,callback) => @writeFile(path,obj,options,callback)


  callback:(callback,data,res,error)->
    if error?
      res.error = error
      res.ready = 1
      callback(0,error) if typeof callback == "function"
    else
      res.data = data
      res.ready = 1
      callback(data) if typeof callback == "function"

  writeFile:(path,obj,options,callback)->
    kind = path.split("/")[0]
    switch kind
      when "source"
        return @writeSourceFile obj,path,options,callback

      when "sprites"
        return @writeSpriteFile obj,path,options,callback

      when "maps"
        return @writeMapFile obj,path,options,callback

      when "sounds"
        return @writeSoundFile obj,path,options,callback

      when "music"
        return @writeMusicFile obj,path,options,callback

      when "assets"
        return @writeAssetFile obj,path,options,callback

      else
        callback(0,"Root folder #{kind} does not exist")

  writeSourceFile:(obj,path,options,callback)->
    res =
      ready: 0

    if typeof obj != "string"
      @callback callback,0,res,"Incorrect object type, expected string"
    else
      msg =
        name: "write_project_file"
        path: path
        content: obj

      @runtime.listener.postRequest msg,(result)=>
        @callback callback,result.content,res,result.error

    res

  writeSpriteFile:(obj,path,options,callback)->
    res =
      ready: 0

    if obj instanceof msImage
      msg =
        name: "write_project_file"
        path: path
        content: obj.canvas.toDataURL().split(",")[1]

      @runtime.listener.postRequest msg,(result)=>
        @callback callback,result.content,res,result.error

    else if obj instanceof Sprite
      fps = obj.fps

      if obj.frames.length == 1
        canvas = obj.frames[0].canvas
        frames = 1
      else
        canvas = document.createElement "canvas"
        canvas.width = obj.width
        canvas.height = obj.height*obj.frames.length
        context = canvas.getContext "2d"
        for i in [0..obj.frames.length-1]
          context.drawImage obj.frames[i].canvas,0,i*obj.height
        frames = obj.frames.length

      msg =
        name: "write_project_file"
        path: path
        content: canvas.toDataURL().split(",")[1]
        fps: fps
        frames: frames

      @runtime.listener.postRequest msg,(result)=>
        @callback callback,result.content,res,result.error

    else
      @callback callback,0,res,"Incorrect object type, expected Image or Sprite"

    res

  writeMapFile:(obj,path,options,callback)->
    res =
      ready: 0

    if obj instanceof MicroMap
      msg =
        name: "write_project_file"
        path: path
        content: SaveMap obj

      @runtime.listener.postRequest msg,(result)=>
        @callback callback,result.content,res,result.error

    else
      @callback callback,0,res,"Incorrect object type, expected Map"

    res

  writeSoundFile:(obj,path,options,callback)->
    res =
      ready: 0

    if obj instanceof MicroSound
      loadWaveFileLib ()=>
        wav = new wavefile.WaveFile
        ch1 = []
        for i in [0..obj.length-1] by 1
          ch1[i] = Math.round(Math.min(1,Math.max(-1,obj.read(0,i)))*32767)
        if obj.channels == 2
          ch2 = []
          for i in [0..obj.length-1] by 1
            ch2[i] = Math.round(Math.min(1,Math.max(-1,obj.read(1,i)))*32767)

          ch = [ch1,ch2]
        else
          ch = [ch1]

        wav.fromScratch ch.length,obj.sampleRate,'16',ch
        buffer = wav.toBuffer()
        encoded = arrayBufferToBase64(buffer)

        msg =
          name: "write_project_file"
          path: path
          content: encoded

        @runtime.listener.postRequest msg,(result)=>
          @callback callback,result.content,res,result.error
    else
      @callback callback,0,res,"Incorrect object type, expected Sound"

    res

  writeMusicFile:(obj,path,options,callback)->
    res =
      ready: 0

    if obj instanceof MicroSound
      loadLameJSLib ()=>
        kbps = 128
        mp3encoder = new lamejs.Mp3Encoder obj.channels,obj.sampleRate,kbps
        index = 0
        sampleBlockSize = 1152
        samples = new Int16Array(sampleBlockSize)
        samplesR = new Int16Array(sampleBlockSize)
        mp3Data = []
        while index < obj.length
          toindex = Math.min(sampleBlockSize-1,obj.length-index-1)
          for i in [0..toindex] by 1
            samples[i] = Math.round(32767*Math.max(-1,Math.min(1,obj.read(0,index+i))))

          if obj.channels == 2
            for i in [0..toindex] by 1
              samplesR[i] = Math.round(32767*Math.max(-1,Math.min(1,obj.read(1,index+i))))

          for i in [toindex+1..sampleBlockSize-1] by 1
            samples[i] = 0

          if obj.channels == 2
            for i in [toindex+1..sampleBlockSize-1] by 1
              samplesR[i] = 0

          index += sampleBlockSize
          if obj.channels == 2
            mp3buf = mp3encoder.encodeBuffer samples, samplesR
          else
            mp3buf = mp3encoder.encodeBuffer samples

          if mp3buf.length > 0
            mp3Data.push(mp3buf)

        mp3buf = mp3encoder.flush()
        if mp3buf.length > 0
          mp3Data.push mp3buf

        blob = new Blob(mp3Data,{type: 'audio/mp3'})
        fr = new FileReader()
        fr.onload = (e)=>
          msg =
            name: "write_project_file"
            path: path
            content: fr.result.split(",")[1]

          @runtime.listener.postRequest msg,(result)=>
            @callback callback,result.content,res,result.error

        fr.readAsDataURL(blob)

    else
      @callback callback,0,res,"Incorrect object type, expected Sound"

    res

  writeAssetFile:(obj,path,options,callback)->
    res =
      ready: 0

    if obj instanceof msImage or obj instanceof Sprite
      if obj instanceof Sprite
        obj = obj.frames[0]

      if options.ext in ["jpg","png"]
        ext = options.ext
      else
        ext = "png"

      mime = if ext == "jpg" then "image/jpeg" else "image/png"

      msg =
        name: "write_project_file"
        path: path
        content: obj.canvas.toDataURL(mime)
        ext: ext

      @runtime.listener.postRequest msg,(result)=>
        @callback callback,result.content,res,result.error

    else if typeof obj == "string"
      if options.ext in ["txt","csv","obj"]
        ext = options.ext
      else
        ext = "txt"

      msg =
        name: "write_project_file"
        path: path
        content: obj
        ext: ext

      @runtime.listener.postRequest msg,(result)=>
        @callback callback,result.content,res,result.error

    else if typeof obj == "object"
      obj = @runtime.vm.storableObject obj

      msg =
        name: "write_project_file"
        path: path
        content: obj
        ext: "json"

      @runtime.listener.postRequest msg,(result)=>
        @callback callback,result.content,res,result.error

    else
      @callback callback,0,res,"Unrecognized object type"

    res

  listFiles:(path,callback)->
    msg =
      name: "list_project_files"
      path: path

    res =
      ready: 0

    @runtime.listener.postRequest msg, (result)->
      res.ready = 1
      if result.list
        res.list = result.list

      if result.error
        res.error = result.error
      callback(result.list,result.error)

    res

  readFile:(path,callback)->
    msg =
      name: "read_project_file"
      path: path

    res =
      ready: 0

    kind = path.split("/")[0]

    @runtime.listener.postRequest msg, (result)=>
      res.ready = 1

      if result.error
        res.error = result.error
        callback(0,result.error) if typeof callback == "function"
      else
        switch kind
          when "sprites"
            s = LoadSprite result.content.data,
              fps: result.content.fps
              frames: result.content.frames,()=>
                res.result = s
                callback(res.result,0) if typeof callback == "function"
            return

          when "maps"
            map = new MicroMap(1,1,1,1)
            UpdateMap map,result.content
            res.result = map
            callback(res.result,0) if typeof callback == "function"
            return

          when "sounds","music"
            s = new Sound @runtime.audio,result.content
            res.result = s
            callback(s,0) if typeof callback == "function"
            return

          when "assets"
            switch result.content.type
              when "text"
                res.result = result.content.data
                callback res.result,0

              when "json"
                res.result = result.content.data
                callback res.result,0

              when "image"
                img = new Image
                img.src = result.content.data
                img.onload = ()=>
                  image = new msImage img
                  res.result = image
                  callback res.result,0

            return


          else
            res.result = result.content.toString()
            callback(res.result,0) if typeof callback == "function"

    res

  deleteFile:(path,callback)->
