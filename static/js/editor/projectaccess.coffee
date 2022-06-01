class @ProjectAccess
  constructor:(@app,@directory = null,@listener)->
    #@directory = "plugin_folder"

  fixPath:(path)->
    if not @directory
      path
    else
      p = path.split("/")
      d = @directory.split("/")
      for n,i in d
        p.splice(i+1,0,n)
      for i in [0..p.length-1] by 1
        p[i] = RegexLib.fixFilename p[i]
      p.join("/")

  setFolder:(@directory)->

  messageReceived:(msg)->
    switch msg.name
      when "write_project_file"
        @writeProjectFile msg

      when "list_project_files"
        @listProjectFiles msg

      when "read_project_file"
        @readProjectFile msg

      when "delete_project_file"
        @deleteProjectFile msg

  fileEntry:(folder,asset)->
    path = "#{folder}/#{asset.name.replace(/-/g,"/")}"
    if @directory
      path = path.replace("/#{@directory}","")

    return
      name: asset.shortname
      path: path
      ext: asset.ext
      size: asset.size

  listProjectFiles:(msg)->
    path = @fixPath msg.path
    path = path.split("/")

    kind = path[0]
    path.splice 0,1
    path = path.join("-")

    filter = (source)=>
      list = []
      for s in source
        if s.name.startsWith(path)
          list.push @fileEntry kind,s

      list

    switch kind
      when "source"
        list = filter @app.project.source_list

      when "sprites"
        list = filter @app.project.sprite_list

      when "maps"
        list = filter @app.project.map_list

      when "sounds"
        list = filter @app.project.sound_list

      when "music"
        list = filter @app.project.music_list

      when "assets"
        list = filter @app.project.asset_list

      else
        @listener.postMessage
          name: "list_project_files"
          request_id: msg.request_id
          error: "Folder does not exist: #{kind}"
        return

    @listener.postMessage
      name: "list_project_files"
      list: list
      request_id: msg.request_id

  readProjectFile:(msg)->
    path = @fixPath msg.path
    path = path.split("/")

    kind = path[0]
    switch kind
      when "source"
        path.splice(0,1)
        path = path.join("-")
        source = @app.project.getSource path
        if source?
          content = source.content

      when "sprites"
        path.splice(0,1)
        path = path.join("-")
        sprite = @app.project.getSprite path
        if sprite?
          data = sprite.saveData()
          content =
            data: data
            fps: sprite.fps
            frames: sprite.frames.length

      when "sounds"
        path.splice(0,1)
        path = path.join("-")
        sound = @app.project.getSound path
        if sound?
          fetch(sound.getURL()).then (result)=>
            result.blob().then (blob)=>
              fr = new FileReader()
              fr.onload = (e)=>
                @listener.postMessage
                  name: "read_project_file"
                  request_id: msg.request_id
                  content: fr.result
              fr.readAsDataURL(blob)

        return

      when "maps"
        path.splice(0,1)
        path = path.join("-")
        map = @app.project.getMap path
        if map?
          content = map.save()

      when "music"
        path.splice(0,1)
        path = path.join("-")
        music = @app.project.getMusic path
        if music?
          fetch(music.getURL()).then (result)=>
            result.blob().then (blob)=>
              fr = new FileReader()
              fr.onload = (e)=>
                @listener.postMessage
                  name: "read_project_file"
                  request_id: msg.request_id
                  content: fr.result
              fr.readAsDataURL(blob)

        return

      when "assets"
        path.splice(0,1)
        path = path.join("-")
        asset = @app.project.getAsset path
        if asset?
          if asset.ext in ["txt","csv","obj"]
            fetch(asset.getURL()).then (result)=>
              result.text().then (text)=>
                @listener.postMessage
                  name: "read_project_file"
                  request_id: msg.request_id
                  content:
                    data: text
                    type: "text"
          else if asset.ext == "json"
            fetch(asset.getURL()).then (result)=>
              result.json().then (json)=>
                @listener.postMessage
                  name: "read_project_file"
                  request_id: msg.request_id
                  content:
                    data: json
                    type: "json"

          else if asset.ext in ["png","jpg"]
            fetch(asset.getURL()).then (result)=>
              result.blob().then (blob)=>
                fr = new FileReader()
                fr.onload = (r)=>
                  @listener.postMessage
                    name: "read_project_file"
                    request_id: msg.request_id
                    content:
                      data: fr.result
                      type: "image"

                fr.readAsDataURL blob

        return

      else
        @listener.postMessage
          name: "read_project_file"
          request_id: msg.request_id
          error: "Folder does not exist: #{kind}"

    if content?
      @listener.postMessage
        name: "read_project_file"
        request_id: msg.request_id
        content: content
    else
      @listener.postMessage
        name: "read_project_file"
        request_id: msg.request_id
        error: "File Not Found"


  projectFileExists:(path)->
    path = path.split("/")

    kind = path[0]
    path.splice 0,1
    path = path.join("-")

    switch kind
      when "source"
        return @app.project.source_table[path]

      when "sprites"
        return @app.project.sprite_table[path]

      when "maps"
        return @app.project.map_table[path]

      when "sounds"
        return @app.project.sound_table[path]

      when "music"
        return @app.project.music_table[path]

      when "assets"
        return @app.project.asset_table[path]

    false

  writeProjectFile:(msg)->
    path = @fixPath msg.path
    path = path.split("/")

    kind = path[0]

    if not (msg.options and msg.options.replace)
      base = path.join("/")
      name = base
      count = 2
      while @projectFileExists name
        name = base+count++

      path = name.split("/")

    switch kind
      when "source"
        path.splice(0,1)
        path = "ms/"+path.join("/")
        @app.project.writeFile(path,msg.content)
        @app.appui.bumpElement "#menuitem-code"

      when "sprites"
        path.splice(0,1)
        path = "sprites/"+path.join("/")
        @app.project.writeFile(path,msg.content,{ frames: msg.frames, fps: msg.fps })
        @app.appui.bumpElement "#menuitem-sprites"

      when "maps"
        path.splice(0,1)
        path = "maps/"+path.join("/")
        @app.project.writeFile(path,msg.content)
        @app.appui.bumpElement "#menuitem-maps"

      when "sounds"
        path.splice(0,1)
        path = "sounds/"+path.join("/")
        @app.project.writeFile(path,msg.content)
        @app.appui.bumpElement "#menuitem-sounds"

      when "music"
        path.splice(0,1)
        path = "music/"+path.join("/")
        @app.project.writeFile(path,msg.content)
        @app.appui.bumpElement "#menuitem-music"

      when "assets"
        path.splice(0,1)
        path = "assets/"+path.join("/")
        @app.project.writeFile(path,msg.content,{ext: msg.ext})
        @app.appui.bumpElement "#menuitem-assets"

      else
        @listener.postMessage
          name: "write_project_file"
          request_id: msg.request_id
          error: "Folder does not exist: #{kind}"
        return

    @listener.postMessage
      name: "write_project_file"
      request_id: msg.request_id
      content: "success"


  deleteProjectFile:(msg)->
    path = @fixPath msg.path
    path = path.split("/")

    kind = path[0]

    path.splice(0,1)
    path = path.join("-")

    deleteFile = (path,thumbnail,callback)=>
      @app.client.sendRequest {
        name: "delete_project_file"
        project: @app.project.id
        file: path
        thumbnail: thumbnail
      },(response)=>
        callback()
        @listener.postMessage
          name: "delete_project_file"
          request_id: msg.request_id
          content: "success"

    error = (text)=>
      @listener.postMessage
        name: "delete_project_file"
        request_id: msg.request_id
        error: text

    switch kind
      when "source"
        source = @app.project.getSource(path)
        if source?
          deleteFile source.file,false,()=>
            @app.project.updateSourceList()
        else
          error("File Not Found")

      when "sprites"
        sprite = @app.project.getSprite(path)
        if sprite? and path != "icon"
          deleteFile sprite.file,false,()=>
            @app.project.updateSpriteList()
        else
          error("File Not Found")

      when "maps"
        map = @app.project.getMap(path)
        if map?
          deleteFile map.file,false,()=>
            @app.project.updateMapList()
        else
          error("File Not Found")

      when "sounds"
        sound = @app.project.getSound(path)
        if sound?
          deleteFile sound.file,true,()=>
            @app.project.updateSoundList()
        else
          error("File Not Found")

      when "music"
        music = @app.project.getMusic(path)
        if music?
          deleteFile music.file,true,()=>
            @app.project.updateMusicList()
        else
          error("File Not Found")

      when "assets"
        asset = @app.project.getAsset(path)
        if asset?
          deleteFile asset.file,true,()=>
            @app.project.updateAssetList()
        else
          error("File Not Found")
