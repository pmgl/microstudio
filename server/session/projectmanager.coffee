FILE_TYPES = require __dirname+"/../file_types.js"

class @ProjectManager
  constructor:(@project)->
    @users = []
    @listeners = []
    @files = {}
    @locks = {}
    @project.manager = @

  canRead:(user)->
    return true if user == @project.owner or @project.public
    for link in @project.users
      return true if link.accepted and (link.user == user)
    false

  canWrite:(user)->
    return true if user == @project.owner
    for link in @project.users
      return true if link.accepted and (link.user == user)
    false

  canWriteOptions:(user)->
    @project.owner == user

  addUser:(user)->
    if @users.indexOf(user)<0
      @users.push user

    @sendCurrentLocks(user)

  addListener:(listener)->
    if @listeners.indexOf(listener)<0
      @listeners.push listener

  removeSession:(session)->
    index = @users.indexOf session
    if index>=0
      @users.splice index,1

    for file,lock of @locks
      if lock.user == session
        lock.time = 0

    return

  removeListener:(listener)->
    index = @listeners.indexOf listener
    if index>=0
      @listeners.splice index,1

  lockFile:(user,file)->
    lock = @locks[file]
    if lock?
      if lock.user == user or Date.now()>lock.time
        lock.user = user
        lock.time = Date.now()+10000
        @propagateLock(user,file)
        return true
      else
        return false
    else
      lock =
        user: user
        time: Date.now()+10000
      @locks[file] = lock
      @propagateLock(user,file)
      return true

  sendCurrentLocks:(user)->
    for file,lock of @locks
      if Date.now()<lock.time #and lock.user.user != user.user
        user.send
          name: "project_file_locked"
          project: @project.id
          file: file
          user: lock.user.user.nick

    return

  canWrite:(user,file)->
    lock = @locks[file]
    if lock?
      lock.user == user or Date.now()>lock.time
    else
      true

  getFileVersion:(file)->
    info = @project.getFileInfo(file)
    if info.version?
      info.version
    else
      0

  setFileVersion:(file,version)->
    @project.setFileInfo(file,"version",version)

  getFileSize:(file)->
    info = @project.getFileInfo(file)
    if info.size?
      info.size
    else
      0

  setFileSize:(file,size)->
    @project.setFileInfo(file,"size",size)

  getFileProperties:(file)->
    info = @project.getFileInfo(file)
    if info.properties?
      info.properties
    else
      {}

  setFileProperties:(file,properties)->
    @project.setFileInfo(file,"properties",properties)

  propagateUserListChange:()->
    for user in @users
      if user?
        user.send
          name:"project_user_list"
          project: @project.id
          users: @project.listUsers()
    return

  propagateLock:(user,file)->
    for u in @users
      if u? and u != user
        u.send
          name: "project_file_locked"
          project: @project.id
          file: file
          user: user.user.nick
    return

  propagateFileChange:(author,file,version,content,properties)->
    for user in @users
      if user? and user != author
        user.send
          name: "project_file_update"
          project: @project.id
          file: file
          version: version
          content: content
          properties: properties

    for listener in @listeners
      if listener?
        listener.sendProjectFileUpdated file.split("/")[0],file.split("/")[1].split(".")[0],version,content,properties
    return

  propagateFileDeleted:(author,file)->
    for user in @users
      if user? and user != author
        user.send
          name: "project_file_deleted"
          project: @project.id
          file: file

    for listener in @listeners
      if listener?
        listener.sendProjectFileDeleted file.split("/")[0],file.split("/")[1]
    return

  propagateOptions:(author)->
    for user in @users
      if user? and user != author
        user.send
          name: "project_options_updated"
          project: @project.id
          title: @project.title
          slug: @project.slug
          platforms: @project.platforms
          controls: @project.controls
          orientation: @project.orientation
          aspect: @project.aspect
          public: @project.public

    for listener in @listeners
      if listener?
        listener.send
          name: "project_options_updated"
          title: @project.title
          slug: @project.slug
          platforms: @project.platforms
          controls: @project.controls
          orientation: @project.orientation
          aspect: @project.aspect
          public: @project.public

    return

  inviteUser:(source,user)->
    if source.user == @project.owner
      @project.inviteUser user
      @propagateUserListChange()
      for li in user.listeners
        li.getProjectList()
    return

  acceptInvite:(user)->
    for link in @project.users
      if user == link.user and not link.accepted
        link.accepted = true
        return @propagateUserListChange()
        for li in user.listeners
          li.getProjectList()
    return

  removeUser:(source,user)->
    if source.user == @project.owner or source.user == user
      for link in @project.users
        if user == link.user
          link.remove()
          return @propagateUserListChange()
          for li in user.listeners
            li.getProjectList()
    return

  listFiles:(folder,callback)->
    file = "#{@project.owner.id}/#{@project.id}/#{folder}"

    @project.content.files.list file,(files)=>
      res = []
      files = files or []
      for f in files
        if not f.startsWith(".")
          res.push
            file: f
            version: @getFileVersion(folder+"/"+f)
            size: @getFileSize(folder+"/"+f)
            properties: @getFileProperties(folder+"/"+f)

      callback(res)

  getFileVersions:(callback)->
    res = {}
    jobs = []

    for folder,t of FILE_TYPES
      res[t.property] = {}
      jobs.push t

    funk = ()=>
      if jobs.length>0
        job = jobs.splice(0,1)[0]
        @listFiles job.folder,(files)=>
          for f in files
            name = f.file.split(".")[0]
            ext = f.file.split(".")[1]
            res[job.property][name] =
              version: f.version
              properties: f.properties
              ext: ext
          funk()
      else
        callback(res)

    funk()

  listProjectFiles:(session,data)->
    return console.log "unauthorized user" if not @canRead session.user

    file = "#{@project.owner.id}/#{@project.id}/#{data.folder}"

    @project.content.files.list file,(files)=>
      res = []
      files = files or []
      for f in files
        if not f.startsWith(".")
          res.push
            file: f
            version: @getFileVersion(data.folder+"/"+f)
            size: @getFileSize(data.folder+"/"+f)
            properties: @getFileProperties(data.folder+"/"+f)

      session.send
        name: "list_project_files"
        files: res
        request_id: data.request_id


  readProjectFile:(session,data)->
    #console.info "projectmanager.readProjectFile"
    return if not @canRead session.user

    file = "#{@project.owner.id}/#{@project.id}/#{data.file}"

    encoding = if data.file.endsWith(".ms") or data.file.endsWith(".json") or data.file.endsWith(".md") then "text" else "base64"

    @project.content.files.read file,encoding,(content)=>
      out = if data.file.endsWith(".ms") or data.file.endsWith(".json") or data.file.endsWith(".md") then "utf8" else "base64"

      if content?
        session.send
          name: "read_project_file"
          content: content.toString(out)
          request_id: data.request_id

  writeProjectFile:(session,data)->
    return if not @canWrite session.user
    return if @project.deleted
    return if not data.file?
    return if data.content? and data.content.length>10000000 # max file size 10 megabytes
    if not /^(ms|sprites|maps|sounds|music|doc|assets)\/[a-z0-9_]{1,40}(-[a-z0-9_]{1,40}){0,10}.(ms|png|json|wav|mp3|md|glb|obj|jpg|ttf|txt|csv)$/.test(data.file)
      console.info "wrong file name: #{data.file}"
      return

    version = @getFileVersion data.file
    if version == 0 # new file
      if not session.server.rate_limiter.accept("create_file_user",session.user.id)
        return

    file = "#{@project.owner.id}/#{@project.id}/#{data.file}"

    if data.content?
      if data.file.split(".")[1] in ["ms","json","md","txt","csv"]
        content = data.content
      else
        content = new Buffer(data.content,"base64")

      @project.content.files.write file,content,()=>
        version += 1
        @setFileVersion data.file,version
        @setFileSize data.file,content.length
        if data.properties?
          @setFileProperties data.file,data.properties

        if data.request_id?
          session.send
            name: "write_project_file"
            version: version
            size: content.length
            request_id: data.request_id

        @propagateFileChange(session,data.file,version,data.content,data.properties)
        @project.touch()

    if data.thumbnail?
      th = new Buffer(data.thumbnail,"base64")
      f = file.split("/")
      f[2] += "_th"
      f[3] = f[3].split(".")[0]+".png"
      f = f.join("/")
      @project.content.files.write f,th,()=>
        console.info "thumbnail saved"

  renameProjectFile:(session,data)->
    return if not @canWrite session.user
    return if typeof data.source != "string"
    return if typeof data.dest != "string"
    return if data.dest.length>250

    if not /^(ms|sprites|maps|sounds|music|doc|assets)\/[a-z0-9_]{1,40}(-[a-z0-9_]{1,40}){0,10}.(ms|png|json|wav|mp3|md|glb|obj|jpg|ttf|txt|csv)$/.test(data.source)
      console.info "wrong source name: #{data.source}"
      return

    if not /^(ms|sprites|maps|sounds|music|doc|assets)\/[a-z0-9_]{1,40}(-[a-z0-9_]{1,40}){0,10}.(ms|png|json|wav|mp3|md|glb|obj|jpg|ttf|txt|csv)$/.test(data.dest)
      console.info "wrong dest name: #{data.dest}"
      return

    source = "#{@project.owner.id}/#{@project.id}/#{data.source}"
    dest = "#{@project.owner.id}/#{@project.id}/#{data.dest}"

    @project.content.files.read source,"binary",(content)=>
      if content?
        @project.content.files.write dest,content,()=>
          @setFileProperties data.dest,@getFileProperties(data.source)
          @project.deleteFileInfo(data.source)
          @setFileSize data.dest,content.length
          @project.touch()
          @project.content.files.delete source,()=>
            if data.thumbnail
              source = source.split("/")
              source[2] += "_th"
              source[3] = source[3].split(".")[0]+".png"
              source = source.join("/")

              dest = dest.split("/")
              dest[2] += "_th"
              dest[3] = dest[3].split(".")[0]+".png"
              dest = dest.join("/")

              @project.content.files.read source,"binary",(thumbnail)=>
                if thumbnail?
                  @project.content.files.write dest,thumbnail,()=>
                    @project.content.files.delete source,()=>
                      session.send
                        name: "rename_project_file"
                        request_id: data.request_id
                      @propagateFileDeleted(session,data.source)
                      @propagateFileChange(session,data.dest,0,null,{})

            else
              session.send
                name: "rename_project_file"
                request_id: data.request_id
              @propagateFileDeleted(session,data.source)
              @propagateFileChange(session,data.dest,0,null,{})

  deleteProjectFile:(session,data)->
    return if not @canWrite session.user
    return if not data.file?

    file = "#{@project.owner.id}/#{@project.id}/#{data.file}"

    @project.content.files.delete file,()=>
      @project.deleteFileInfo(data.file)

      if data.request_id?
        session.send
          name: "delete_project_file"
          request_id: data.request_id

      @propagateFileDeleted(session,data.file)
      @project.touch()

    if data.thumbnail
      f = file.split("/")
      f[2] += "_th"
      f[3] = f[3].split(".")[0]+".png"
      f = f.join("/")
      @project.content.files.delete f,()=>

  importFiles:(contents,callback)=>
    files = []
    for filename of contents.files
      files.push filename

    funk = () =>
      if files.length > 0
        filename = files.splice(0,1)[0]
        value = contents.files[filename]

        if /^(ms|sprites|maps|sounds|music|doc|assets|sounds_th|music_th|assets_th)\/[a-z0-9_]{1,40}([-\/][a-z0-9_]{1,40}){0,10}.(ms|py|js|lua|png|json|wav|mp3|md|glb|obj|jpg|ttf|txt|csv)$/.test(filename)
          dest = filename
          d = dest.split("/")
          while d.length>2
            end = d.splice(d.length-1,1)[0]
            d[d.length-1] += "-#{end}"
            dest = d.join("/")

          if dest.endsWith ".js" then dest = dest.replace(".js",".ms")
          if dest.endsWith ".py" then dest = dest.replace(".py",".ms")
          if dest.endsWith ".lua" then dest = dest.replace(".lua",".ms")
          type = if dest.split(".")[1] in ["ms","json","md","txt","csv"] then "string" else "nodebuffer"
          try
            contents.file(filename).async(type).then ((fileContent)=>
              if fileContent?
                @project.content.files.write "#{@project.owner.id}/#{@project.id}/#{dest}", fileContent, funk
              else
                funk()
            ),()=>
              funk()

          catch err
            console.error err
            console.log filename
            funk()

        else
          funk()
      else
        callback()
    funk()

module.exports = @ProjectManager
