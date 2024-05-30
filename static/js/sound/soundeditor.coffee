class @SoundEditor extends Manager
  constructor:(app)->
    super app

    @folder = "sounds"
    @item = "sound"
    @list_change_event = "soundlist"
    @get_item = "getSound"
    @use_thumbnails = true
    @extensions = ["wav","ogg","flac"]
    @update_list = "updateSoundList"

    @init()

  update:()->
    super()
    if not @img_loaded
      @img_loaded = true
      img = new Image()
      img.src = "/img/mpu/mpums1.jpg"
      document.getElementById("sample-editor-bg").appendChild(img)
      img.style = "position: absolute; width: 70%; bottom: 0; left:0; cursor: pointer"
      img2 = new Image()
      img2.src = "/img/mpu/mpums2.png"
      document.getElementById("sample-editor-content").appendChild(img2)
      img2.style = "position: absolute; height: 60%; bottom: 20px; right:20px; cursor: pointer"
      f = ()->
        window.open("https://store.steampowered.com/app/2246370/Music_Power_Up/?utm_source=microstudio","_blank")
      img.addEventListener("click",f)
      img2.addEventListener("click",f)


  openItem:(name)->
    super(name)
    sound = @app.project.getSound(name)
    if sound?
      sound.play()

  createAsset:(folder)->
    input = document.createElement "input"
    input.type = "file"
    input.accept = ".wav,.ogg,.flac"
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
        ext = file.name.split(".")[1].toLowerCase()
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
            file: "sounds/#{name}.#{ext}"
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
