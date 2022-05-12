class @ProjectAccess
  constructor:(@app,@directory = null)->
    #@directory = "plugin_folder"

  fixPath:(path)->
    if not @directory?
      path
    else
      p = path.split("/")
      d = @directory.split("/")
      for n,i in d
        p.splice(i+1,0,n)
      for i in [0..p.length-1] by 1
        p[i] = RegexLib.fixFilename p[i]
      p.join("/")

  messageReceived:(msg)->
    switch msg.name
      when "write_project_file"
        @writeProjectFile msg

      when "list_project_files"
        @listProjectFiles msg

      when "read_project_file"
        @readProjectFile msg

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
        @app.runwindow.postMessage
          name: "list_project_files"
          request_id: msg.request_id
          error: "Folder does not exist: #{kind}"
        return

    @app.runwindow.postMessage
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
                @app.runwindow.postMessage
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
                @app.runwindow.postMessage
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
                @app.runwindow.postMessage
                  name: "read_project_file"
                  request_id: msg.request_id
                  content:
                    data: text
                    type: "text"
          else if asset.ext == "json"
            fetch(asset.getURL()).then (result)=>
              result.json().then (json)=>
                @app.runwindow.postMessage
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
                  @app.runwindow.postMessage
                    name: "read_project_file"
                    request_id: msg.request_id
                    content:
                      data: fr.result
                      type: "image"

                fr.readAsDataURL blob

        return

      else
        @app.runwindow.postMessage
          name: "read_project_file"
          request_id: msg.request_id
          error: "Folder does not exist: #{kind}"

    if content?
      @app.runwindow.postMessage
        name: "read_project_file"
        request_id: msg.request_id
        content: content
    else
      @app.runwindow.postMessage
        name: "read_project_file"
        request_id: msg.request_id
        error: "File Not Found"


  writeProjectFile:(msg)->
    path = @fixPath msg.path
    path = path.split("/")

    kind = path[0]

    switch kind
      when "source"
        path.splice(0,1)
        path = "ms/"+path.join("/")
        @app.project.writeFile(path,msg.content)

      when "sprites"
        path.splice(0,1)
        path = "sprites/"+path.join("/")
        @app.project.writeFile(path,msg.content,{ frames: msg.frames, fps: msg.fps })

      when "maps"
        path.splice(0,1)
        path = "maps/"+path.join("/")
        @app.project.writeFile(path,msg.content)

      when "sounds"
        path.splice(0,1)
        path = "sounds/"+path.join("/")
        @app.project.writeFile(path,msg.content)

      when "music"
        path.splice(0,1)
        path = "music/"+path.join("/")
        @app.project.writeFile(path,msg.content)

      when "assets"
        path.splice(0,1)
        path = "assets/"+path.join("/")
        @app.project.writeFile(path,msg.content,{ext: msg.ext})

      else
        @app.runwindow.postMessage
          name: "write_project_file"
          request_id: msg.request_id
          error: "Folder does not exist: #{kind}"
        return

    @app.runwindow.postMessage
      name: "write_project_file"
      request_id: msg.request_id
      content: "success"
