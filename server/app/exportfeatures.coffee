#fs = require "fs"

JSZip = require "jszip"
pug = require "pug"
JobQueue = require __dirname+"/jobqueue.js"
{ createCanvas, loadImage } = require('canvas')

class @ExportFeatures
  constructor:(@webapp)->
    @addSpritesExport()
    @addPublishHTML()
    @addProjectFilesExport()

  addProjectFilesExport:()->
    # /user/project[/code]/export/project/
    @webapp.app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?export\/project\/$/,(req,res)=>
      access = @webapp.getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      manager = @webapp.getProjectManager(project)
      folders = @getFoldersWithTypes()
      projectInfo = @prepareExportProjectInfo(project)

      zip = new JSZip

      queue = new JobQueue ()=>
        zip.generateAsync({type:"nodebuffer"}).then (content)=>
          res.setHeader("Content-Type", "application/zip")
          res.setHeader("Content-Disposition","attachement; filename=\"#{project.slug}_files.zip\"")
          res.send content

      zip.file("project.meta.json", JSON.stringify projectInfo)
      for f in folders
        do (f) =>
          @enqueueFolderZipping(zip, queue, manager, user, project, f.name, f.fileType)

      queue.start()

  enqueueFolderZipping:(zip, queue, manager, user, project, folder, fileType) ->
      queue.add ()=>
        manager.listFiles folder,(files)=>
          for f in files
            do (f)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify f
                @webapp.server.content.files.read "#{user.id}/#{project.id}/#{folder}/#{f.file}",fileType,(content)=>
                  if content?
                    zip.folder(folder).file(f.file,content)
                    zip.folder(folder).file("#{f.file}.meta.json", JSON.stringify f)
                  queue.next()
          queue.next()

  getFoldersWithTypes:()->
    folders = [
        {
          name: "sprites",
          fileType: "binary"
        },
        {
          name: "ms",
          fileType: "text"
        },
        {
          name: "doc",
          fileType: "text"
        },
        {
          name: "maps",
          fileType: "text"
        },
        {
          name: "sounds",
          fileType: "binary"
        },
        {
          name: "music",
          fileType: "binary"
        },
        {
          name: "assets",
          fileType: "binary"
        }
      ]

  prepareExportProjectInfo:(project)->
    projectInfo = {
        owner: project.owner.nick
        id: project.id,
        title: project.title,
        slug: project.slug,
        tags: project.tags,
        orientation: project.orientation,
        aspect: project.aspect,
        platforms: project.platforms,
        controls: project.controls,
        type: project.type,
        date_created: project.date_created,
        last_modified: project.last_modified,
        first_published: project.first_published
      }

  addSpritesExport:()->
    # /user/project[/code]/export/sprites/
    @webapp.app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?export\/sprites\/$/,(req,res)=>
      access = @webapp.getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      manager = @webapp.getProjectManager(project)

      zip = new JSZip

      queue = new JobQueue ()=>
        zip.generateAsync({type:"nodebuffer"}).then (content)=>
          res.setHeader("Content-Type", "application/zip")
          res.setHeader("Content-Disposition","attachement; filename=\"#{project.slug}_sprites.zip\"")
          res.send content

      queue.add ()=>
        manager.listFiles "sprites",(sprites)=>
          for s in sprites
            do (s)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify s
                @webapp.server.content.files.read "#{user.id}/#{project.id}/sprites/#{s.file}","binary",(content)=>
                  if content?
                    zip.file(s.file,content)
                  queue.next()
          queue.next()

      queue.add ()=>
        manager.listFiles "doc",(docs)=>
          for doc in docs
            do (doc)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify doc
                @webapp.server.content.files.read "#{user.id}/#{project.id}/doc/#{doc.file}","text",(content)=>
                  if content?
                    zip.file(doc.file,content)
                  queue.next()
          queue.next()

      queue.start()

  addPublishHTML:()->
    # /user/project[/code]/publish/html/
    @webapp.app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?publish\/html\/$/,(req,res)=>
      access = @webapp.getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      manager = @webapp.getProjectManager(project)

      zip = new JSZip
      # icon16,32,64,180,192,512,1024.png
      # manifest.json
      maps_dict = {}
      images = []
      assets = []
      fonts = []
      sounds_list = []
      music_list = []
      fullsource = "\n\n"

      queue = new JobQueue ()=>
        resources = JSON.stringify
          images: images
          assets: assets
          maps: maps_dict
          sounds: sounds_list
          music: music_list

        resources = "var resources = #{resources};\n"
        resources += "var graphics = \"#{project.graphics}\";\n"

        export_funk = pug.compileFile "../templates/export/html.pug"

        html = export_funk
          user: user
          javascript_files: ["microengine.js"]
          fonts: fonts
          game:
            name: project.slug
            title: project.title
            author: user.nick
            resources: resources
            orientation: project.orientation
            aspect: project.aspect
            code: fullsource

        zip.file("index.html",html)

        mani = @webapp.manifest_template.toString().replace(/SCOPE/g,"")
        mani = mani.toString().replace("APPNAME",project.title)
        mani = mani.toString().replace("APPSHORTNAME",project.title)
        mani = mani.toString().replace("ORIENTATION",project.orientation)
        mani = mani.toString().replace(/USER/g,user.nick)
        mani = mani.toString().replace(/PROJECT/g,project.slug)
        mani = mani.toString().replace(/ICONVERSION/g,"0")
        mani = mani.replace("START_URL",".")

        zip.file("manifest.json",mani)

        if project.graphics == "M3D"
          zip.file("microengine.js",@webapp.concatenator["player3d_js_concat"])
        else
          zip.file("microengine.js",@webapp.concatenator["player_js_concat"])

        zip.generateAsync({type:"nodebuffer"}).then (content)=>
          res.setHeader("Content-Type", "application/zip")
          res.setHeader("Content-Disposition","attachement; filename=\"#{project.slug}.zip\"")
          res.setHeader("Cache-Control","no-cache")
          res.send content

      queue.add ()=>
        manager.listFiles "sprites",(sprites)=>
          for s in sprites
            do (s)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify s
                @webapp.server.content.files.read "#{user.id}/#{project.id}/sprites/#{s.file}","binary",(content)=>
                  if content?
                    zip.file("sprites/#{s.file}",content)
                    images.push s
                  queue.next()
          queue.next()

      queue.add ()=>
        manager.listFiles "maps",(maps)=>
          for map in maps
            do (map)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify map
                @webapp.server.content.files.read "#{user.id}/#{project.id}/maps/#{map.file}","text",(content)=>
                  if content?
                    maps_dict[map.file.split(".")[0]] = content
                  queue.next()
          queue.next()

      queue.add ()=>
        manager.listFiles "sounds",(sounds)=>
          for s in sounds
            do (s)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify s
                @webapp.server.content.files.read "#{user.id}/#{project.id}/sounds/#{s.file}","binary",(content)=>
                  if content?
                    zip.file("sounds/#{s.file}",content)
                    sounds_list.push s
                  queue.next()
          queue.next()

      queue.add ()=>
        manager.listFiles "music",(music)=>
          for m in music
            do (m)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify m
                @webapp.server.content.files.read "#{user.id}/#{project.id}/music/#{m.file}","binary",(content)=>
                  if content?
                    zip.file("music/#{m.file}",content)
                    music_list.push m
                  queue.next()
          queue.next()

      queue.add ()=>
        manager.listFiles "assets",(assets)=>
          for asset in assets
            do (asset)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify asset
                @webapp.server.content.files.read "#{user.id}/#{project.id}/assets/#{asset.file}","binary",(content)=>
                  if content?
                    zip.file("assets/#{asset.file}",content)
                    assets.push asset
                  queue.next()
          queue.next()

      queue.add ()=>
        manager.listFiles "doc",(docs)=>
          for doc in docs
            do (doc)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify doc
                @webapp.server.content.files.read "#{user.id}/#{project.id}/doc/#{doc.file}","text",(content)=>
                  if content?
                    zip.file(doc.file,content)
                  queue.next()
          queue.next()

      queue.add ()=>
        manager.listFiles "ms",(ms)=>
          for src in ms
            do (src)=>
              queue.add ()=>
                console.info "reading: "+JSON.stringify src
                @webapp.server.content.files.read "#{user.id}/#{project.id}/ms/#{src.file}","text",(content)=>
                  if content?
                    fullsource += content+"\n\n"
                  queue.next()

          queue.add ()=>
            for font in @webapp.fonts.fonts
              if font == "BitCell" or fullsource.indexOf("\"#{font}\"")>=0
                fonts.push font
                do (font)=>
                  queue.add ()=>
                    console.info "reading font: #{font}"
                    @webapp.fonts.read font,(data)=>
                      if data?
                        zip.file "fonts/#{font}.ttf",data
                      queue.next()

            queue.next()

          queue.next()

      queue.add ()=>
        path = "#{user.id}/#{project.id}/sprites/icon.png"
        path = @webapp.server.content.files.sanitize path
        loadImage("../files/#{path}").then ((image)=>
          for size in [16,32,64,180,192,512,1024]
            do (size)=>
              queue.add ()=>
                canvas = createCanvas(size,size)
                context = canvas.getContext "2d"
                context.antialias = "none"
                context.imageSmoothingEnabled = false
                if image?
                  context.drawImage image,0,0,size,size

                if size>100
                  context.antialias = "default"
                  context.globalCompositeOperation = "destination-in"
                  @webapp.fillRoundRect context,0,0,size,size,size/8

                canvas.toBuffer (err,result)=>
                  zip.file "icon#{size}.png",result
                  queue.next()
                ),(error)=>
                  queue.next()
          queue.next()

      queue.start()

module.exports = @ExportFeatures
