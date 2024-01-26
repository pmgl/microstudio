class @SoundEditor extends Manager
  constructor:(app)->
    super app

    @folder = "sounds"
    @item = "sound"
    @list_change_event = "soundlist"
    @get_item = "getSound"
    @use_thumbnails = true
    @extensions = ["wav"]
    @update_list = "updateSoundList"

    @init()

  update:()->
    super()

  openItem:(name)->
    super(name)
    sound = @app.project.getSound(name)
    if sound?
      sound.play()

  createAsset:(folder)->
    input = document.createElement "input"
    input.type = "file"
    input.accept = ".wav"
    input.addEventListener "change",(event)=>
      files = event.target.files
      if files.length>=1
        for f in files
          @fileDropped(f,folder)
      return

    input.click()

  fileDropped:(file,folder)->
    console.info "processing #{file.name}"
    console.info "folder: "+folder
    reader = new FileReader()
    reader.addEventListener "load",()=>
      file_size = reader.result.byteLength
      console.info "file read, size = "+ file_size
      if file_size > 30000000   # client side limit 30 Mb
        @app.appui.showNotification(@app.translator.get("Audio file is too heavy"))
        return
      audioContext = new AudioContext()
      audioContext.decodeAudioData reader.result,(decoded)=>
        console.info decoded
        thumbnailer = new SoundThumbnailer(decoded,96,64)
        name = file.name.split(".")[0]
        name = @findNewFilename name,"getSound",folder
        if folder? then name = folder.getFullDashPath()+"-"+name
        if folder? then folder.setOpen true

        sound = @app.project.createSound(name,thumbnailer.canvas.toDataURL(),file_size)
        sound.uploading = true
        @setSelectedItem name

        r2 = new FileReader()
        r2.addEventListener "load",()=>
          sound.local_url = r2.result
          data = r2.result.split(",")[1]
          @app.project.addPendingChange @

          @app.client.sendRequest {
            name: "write_project_file"
            project: @app.project.id
            file: "sounds/#{name}.wav"
            properties: {}
            content: data
            thumbnail: thumbnailer.canvas.toDataURL().split(",")[1]
          },(msg)=>
            console.info msg
            @app.project.removePendingChange(@)
            sound.uploading = false
            @app.project.updateSoundList()
            @checkNameFieldActivation()

        r2.readAsDataURL(file)

    reader.readAsArrayBuffer(file)
