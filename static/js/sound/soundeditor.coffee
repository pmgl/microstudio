class @SoundEditor extends Manager
  constructor:(@app)->
    super(@app)

    @folder = "sounds"
    @item = "sound"
    @list_change_event = "soundlist"
    @get_item = "getSound"
    @use_thumbnails = true
    @extensions = ["wav"]
    @update_list = "updateSoundList"
    @box_width = 96
    @box_height = 84

    @init()

  update:()->
    super()
    if @app.user? and @app.user.flags.admin
      if not @synth?
        @app.audio_controller.init()
        @synth = new Synth @app
        @synth.synth_window.show()

  openItem:(name)->
    super(name)
    sound = @app.project.getSound(name)
    if sound?
      sound.play()

  fileDropped:(file)->
    console.info "processing #{file.name}"
    reader = new FileReader()
    reader.addEventListener "load",()=>
      console.info "file read, size = "+ reader.result.length
      return if reader.result.length>5000000
      audioContext = new AudioContext()
      audioContext.decodeAudioData reader.result,(decoded)=>
        console.info decoded
        thumbnailer = new SoundThumbnailer(decoded,96,64)
        name = file.name.split(".")[0]
        name = @findNewFilename name,"getSound"

        sound = @app.project.createSound(name,thumbnailer.canvas.toDataURL(),reader.result.length)
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
