class @Builder
  constructor:(@manager,@session,@target)->
    @last_active = Date.now()
    @downloads = {}
    @download_id = 0

    @session.send "builder_started"

    @session.messageReceived = (msg)=>
      @last_active = Date.now()
      if typeof msg == "string"
        #console.info msg
        try
          msg = JSON.parse msg
          switch msg.name
            when "get_job"
              @getJob()

            when "build_progress"
              @setBuildProgress(msg)

            when "build_complete"
              @buildComplete(msg)

            when "build_error"
              @buildError(msg)

        catch err
      else
        id = msg.readUIntBE(0,4)
        #console.info "receiving chunk for download #{id}"
        if @downloads[id]?
          @downloads[id].chunkReceived msg
        else
          console.info "Download not found: #{id}"

    @session.disconnected = ()=>
      @manager.unregisterBuilder @
      @last_active = 0

    @interval = setInterval (()=>
      if not @isActive()
        clearInterval @interval
        try
          @session.socket.close()
          @manager.unregisterBuilder @
        catch err
          console.error err
      ),60000

    console.info "Builder created"

  getJob:()->
    @current_build = @manager.getJob(@target)
    if @current_build?
      @current_build.builder = @
      if @current_build.project.public
        path = "/#{@current_build.project.owner.nick}/#{@current_build.project.slug}/publish/html/"
      else
        path = "/#{@current_build.project.owner.nick}/#{@current_build.project.slug}/#{@current_build.project.code}/publish/html/"

      @session.send
        name: "job"
        project:
          title: @current_build.project.title
          slug: @current_build.project.slug
          owner: @current_build.project.owner.nick
          last_modified: @current_build.project.last_modified
          orientation: @current_build.project.orientation
          download: path
    else
      @session.send
        name: "no_job"

  setBuildProgress:(msg)->
    if @current_build?
      @current_build.progress = msg.progress
      @current_build.status_text = msg.text

  buildComplete:(msg)->
    @current_build.file_info =
       file: msg.file
       folder: msg.folder
       length: msg.length

    @current_build = null

  buildError:(msg)->
    @current_build.error = msg.error or "Error"
    @current_build = null


  startDownload:(build,res)->
    download = new Downloader(@download_id++,build,res)
    @downloads[download.id] = download
    download.start()

  removeDownload:(download)->
    delete @downloads[download.id]

  isActive:()->
    @last_active+5*60000>Date.now()

class Downloader
  constructor:(@id,@build,@res)->
    @res.setHeader("Content-Type", "application/octet-stream")
    @res.setHeader("Content-Disposition","attachement; filename=\"#{@build.file_info.file}\"")
    @res.setHeader("Content-Length",@build.file_info.length)

    @res.on "error",(err)=>
      console.error err

  start:()->
    @build.builder.session.send
      name: "download"
      file: @build.file_info.file
      folder: @build.file_info.folder
      download_id: @id

  chunkReceived:(buffer)->
    #console.info "processing chunk"
    if buffer.byteLength>4
      buf = Buffer.alloc(buffer.byteLength-4)
      buffer.copy buf,0,4,buffer.byteLength
      #console.info "writing chunk"
      cb = ()=>
        #console.info "requesting next chunk"
        @build.builder.session.send
          name: "next_chunk"
          download_id: @id

      if @res.write buf,"binary"
        cb()
      else
        @res.once "drain",cb

    else
      @res.end()
      @build.builder.removeDownload @
      @build.downloaded = true

module.exports = @Builder
