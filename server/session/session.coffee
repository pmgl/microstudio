SHA256 = require("crypto-js/sha256")
ProjectManager = require __dirname+"/projectmanager.js"
RegexLib = require __dirname+"/../../static/js/util/regexlib.js"
ForumSession = require __dirname+"/../forum/forumsession.js"
JSZip = require "jszip"

class @Session
  constructor:(@server,@socket)->
    #console.info "new session"
    @content = @server.content
    return @socket.close() if not @content?
    @translator = @content.translator.getTranslator("en")
    @user = null
    @token = null

    @checkCookie()
    @last_active = Date.now()

    @socket.on "message",(msg)=>
      #console.info "received msg: #{msg}"

      @messageReceived msg

      @last_active = Date.now()

    @socket.on "close",()=>
      @server.sessionClosed @
      @disconnected()

    @socket.on "error",(err)=>
      if @user
        console.error "WS ERROR for user #{@user.id} - #{@user.nick}"
      else
        console.error "WS ERROR"

      console.error err

    @commands = {}
    @register "ping",(msg)=>
      @send({name:"pong"})
      @checkUpdates()

    @register "create_account",(msg)=>@createAccount(msg)
    @register "create_guest",(msg)=>@createGuestAccount(msg)
    @register "login",(msg)=>@login(msg)
    @register "send_password_recovery",(msg)=>@sendPasswordRecovery(msg)
    @register "token",(msg)=>@checkToken(msg)
    @register "delete_guest",(msg)=>@deleteGuest(msg)

    @register "send_validation_mail",(msg)=>@sendValidationMail(msg)
    @register "change_email",(msg)=>@changeEmail(msg)
    @register "change_nick",(msg)=>@changeNick(msg)
    @register "change_password",(msg)=>@changePassword(msg)
    @register "change_newsletter",(msg)=>@changeNewsletter(msg)
    @register "change_experimental",(msg)=>@changeExperimental(msg)
    @register "set_user_setting",(msg)=>@setUserSetting(msg)
    @register "set_user_profile",(msg)=>@setUserProfile(msg)

    @register "create_project",(msg)=>@createProject(msg)
    @register "import_project",(msg)=>@importProject(msg)
    @register "set_project_option",(msg)=>@setProjectOption(msg)
    @register "set_project_public",(msg)=>@setProjectPublic(msg)
    @register "set_project_tags",(msg)=>@setProjectTags(msg)
    @register "delete_project",(msg)=>@deleteProject(msg)
    @register "get_project_list",(msg)=>@getProjectList(msg)
    @register "update_code",(msg)=>@updateCode(msg)
    @register "lock_project_file",(msg)=>@lockProjectFile(msg)
    @register "write_project_file",(msg)=>@writeProjectFile(msg)
    @register "read_project_file",(msg)=>@readProjectFile(msg)
    @register "rename_project_file",(msg)=>@renameProjectFile(msg)
    @register "delete_project_file",(msg)=>@deleteProjectFile(msg)
    @register "list_project_files",(msg)=>@listProjectFiles(msg)
    @register "list_public_project_files",(msg)=>@listPublicProjectFiles(msg)
    @register "read_public_project_file",(msg)=>@readPublicProjectFile(msg)
    @register "listen_to_project",(msg)=>@listenToProject(msg)
    @register "get_file_versions",(msg)=>@getFileVersions(msg)

    @register "invite_to_project",(msg)=>@inviteToProject(msg)
    @register "accept_invite",(msg)=>@acceptInvite(msg)
    @register "remove_project_user",(msg)=>@removeProjectUser(msg)

    @register "get_public_projects",(msg)=>@getPublicProjects(msg)
    @register "get_public_project",(msg)=>@getPublicProject(msg)
    @register "clone_project",(msg)=>@cloneProject(msg)
    @register "clone_public_project",(msg)=>@clonePublicProject(msg)
    @register "toggle_like",(msg)=>@toggleLike(msg)

    @register "get_language",(msg)=>@getLanguage(msg)
    @register "get_translation_list",(msg)=>@getTranslationList(msg)
    @register "set_translation",(msg)=>@setTranslation(msg)
    @register "add_translation",(msg)=>@addTranslation(msg)

    @register "get_project_comments",(msg)=>@getProjectComments(msg)
    @register "add_project_comment",(msg)=>@addProjectComment(msg)
    @register "delete_project_comment",(msg)=>@deleteProjectComment(msg)
    @register "edit_project_comment",(msg)=>@editProjectComment(msg)

    @register "build_project",(msg)=>@buildProject(msg)
    @register "get_build_status",(msg)=>@getBuildStatus(msg)

    @register "start_builder",(msg)=>@startBuilder(msg)
    @register "backup_complete",(msg)=>@backupComplete(msg)

    @register "upload_request",(msg)=>@uploadRequest(msg)

    @register "tutorial_completed",(msg)=>@tutorialCompleted(msg)

    for plugin in @server.plugins
      if plugin.registerSessionMessages?
        plugin.registerSessionMessages @

    @forum_session = new ForumSession @

    @reserved_nicks =
      "admin":true
      "api":true
      "static":true
      "blog":true
      "news":true
      "about":true
      "discord":true
      "article":true
      "forum": true
      "community":true

  checkCookie:()->
    try
      cookie = @socket.request.headers.cookie
      if cookie? and cookie.indexOf("token")>=0
        cookie = cookie.split("token")[1]
        cookie = cookie.split("=")[1]
        if cookie?
          cookie = cookie.split(";")[0]
          @token = cookie.trim()
          @token = @content.findToken @token
          if @token?
            @user = @token.user
            @user.addListener @
            @send
              name: "token_valid"
              nick: @user.nick
              flags: if not @user.flags.censored then @user.flags else []
              info: @getUserInfo()
              settings: @user.settings
            @user.set "last_active",Date.now()
            @logActiveUser()
    catch error
      console.error error

  logActiveUser:()->
    return if not @user?
    if @user.flags.guest
      @server.stats.unique("active_guests",@user.id)
    else
      @server.stats.unique("active_users",@user.id)

  register:(name,callback)->
    @commands[name] = callback

  disconnected:()->
    if @project? and @project.manager?
      @project.manager.removeUser @
      @project.manager.removeListener @
    if @user?
      @user.removeListener @

  setCurrentProject:(project)->
    if project != @project or not @project.manager?
      if @project? and @project.manager?
        @project.manager.removeUser @
      @project = project
      if not @project.manager?
        new ProjectManager @project
      @project.manager.addUser @

  messageReceived:(msg)->
    if typeof msg != "string"
      return @bufferReceived msg

    #console.info msg
    try
      msg = JSON.parse msg
      if msg.name?
        c = @commands[msg.name]
        c(msg) if c?
    catch err
      console.info err

    @server.stats.inc("websocket_requests")
    @logActiveUser() if @user?

  sendCodeUpdated:(file,code)->
    @send
      name: "code_updated"
      file: file
      code: code
    return

  sendProjectFileUpdated:(type,file,version,data,properties)->
    @send
      name: "project_file_updated"
      type: type
      file: file
      version: version
      data: data
      properties: properties

  sendProjectFileDeleted:(type,file)->
    @send
      name: "project_file_deleted"
      type: type
      file: file

  createGuestAccount:(data)->
    return if not @server.rate_limiter.accept("create_account_ip",@socket.remoteAddress)
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    loop
      nick = ""
      for i in [0..9] by 1
        nick += chars.charAt(Math.floor(Math.random()*chars.length))

      break if not @content.findUserByNick(nick)

    @user = @content.createUser
      nick: nick
      flags: { guest: true }
      language: data.language
      date_created: Date.now()
      last_active: Date.now()
      creation_ip: @socket.remoteAddress

    @user.addListener @

    @send
      name:"guest_created"
      nick: nick
      flags: @user.flags
      info: @getUserInfo()
      settings: @user.settings
      token: @content.createToken(@user).value
      request_id: data.request_id
    @logActiveUser()

  deleteGuest:(data)->
    if @user? and @user.flags.guest
      @user.delete()

      @send
        name:"guest_deleted"
        request_id: data.request_id

  createAccount:(data)->
    return @sendError(@translator.get("email not specified"),data.request_id) if not data.email?
    return @sendError(@translator.get("nickname not specified"),data.request_id) if not data.nick?
    return @sendError(@translator.get("password not specified"),data.request_id) if not data.password?

    return @sendError(@translator.get("email already exists"),data.request_id) if @content.findUserByEmail(data.email)
    return @sendError(@translator.get("nickname already exists"),data.request_id) if @content.findUserByNick(data.nick)
    return @sendError(@translator.get("nickname already exists"),data.request_id) if @reserved_nicks[data.nick]

    return @sendError(@translator.get("Incorrect nickname. Use 5 characters minimum, only letters, numbers or _"),data.request_id) if not RegexLib.nick.test(data.nick)
    return @sendError(@translator.get("Incorrect e-mail address"),data.request_id) if not RegexLib.email.test(data.email)
    return @sendError(@translator.get("Password too weak"),data.request_id) if data.password.trim().length<6

    return if not @server.rate_limiter.accept("create_account_ip",@socket.remoteAddress)

    salt = ""
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for i in [0..15] by 1
      salt += chars.charAt(Math.floor(Math.random()*chars.length))

    hash = salt+"|"+SHA256(salt+data.password)

    if @user? and @user.flags.guest
      @server.content.changeUserNick @user,data.nick
      @server.content.changeUserEmail @user,data.email

      @user.setFlag("guest",false)
      @user.setFlag("newsletter",data.newsletter)
      @user.set("hash",hash)
      @user.resetValidationToken()
    else
      @user = @content.createUser
        nick: data.nick
        email: data.email
        flags: { newsletter: data.newsletter }
        language: data.language
        hash: hash
        date_created: Date.now()
        last_active: Date.now()
        creation_ip: @socket.remoteAddress

      @user.addListener @

    @send
      name:"account_created"
      nick: data.nick
      email: data.email
      flags: @user.flags
      info: @getUserInfo()
      settings: @user.settings
      notifications: [@server.content.translator.getTranslator(data.language).get("Account created successfully!")]
      token: @content.createToken(@user).value
      request_id: data.request_id

    @sendValidationMail()
    @logActiveUser()

  login:(data)->
    return if not data.nick?
    return if not @server.rate_limiter.accept("login_ip",@socket.remoteAddress)
    return if not @server.rate_limiter.accept("login_user",data.nick)

    user = @content.findUserByNick data.nick
    if not user?
      user = @content.findUserByEmail data.nick

    if user? and user.hash?
      hash = user.hash
      s = hash.split("|")
      h = SHA256(s[0]+data.password)
      #console.info "salt: #{s[0]}"
      #console.info "hash: #{h}"
      #console.info "recorded hash: #{s[1]}"
      if h.toString() == s[1]
        @user = user
        @user.addListener @
        @send
          name:"logged_in"
          token: @content.createToken(@user).value
          nick: @user.nick
          email: @user.email
          flags: if not @user.flags.censored then @user.flags else {}
          info: @getUserInfo()
          settings: @user.settings
          notifications: @user.notifications
          request_id: data.request_id
        @user.notifications = []
        @logActiveUser()
      else
        @sendError "wrong password",data.request_id
    else
      @sendError "unknown user",data.request_id

  getUserInfo:()->
    return
      size: @user.getTotalSize()
      early_access: @user.early_access
      max_storage: @user.max_storage
      description: @user.description
      stats: @user.progress.exportStats()
      achievements: @user.progress.exportAchievements()

  sendPasswordRecovery:(data)->
    if data.email?
      user = @content.findUserByEmail data.email
      if user?
        if @server.rate_limiter.accept("send_mail_user",user.id)
          @server.content.sendPasswordRecoveryMail(user)
    @send
      name: "send_password_recovery"
      request_id: data.request_id

  checkToken:(data)->
    token = @content.findToken data.token
    if token?
      @user = token.user
      @user.addListener @
      @send
        name: "token_valid"
        nick: @user.nick
        email: @user.email
        flags: if not @user.flags.censored then @user.flags else {}
        info: @getUserInfo()
        settings: @user.settings
        notifications: @user.notifications
        request_id: data.request_id
      @user.notifications = []
      @user.set "last_active",Date.now()
      @logActiveUser()
    else
      @sendError "invalid token",data.request_id

  send:(data)->
    @socket.send JSON.stringify data

  sendError:(error,request_id)->
    @send
      name: "error"
      error: error
      request_id: request_id

  importProject:(data)->
    return @sendError("Bad request") if not data.request_id?
    return @sendError("not connected",data.request_id) if not @user?
    return @sendError("Email validation is required",data.request_id) if @server.PROD and not @user.flags.validated
    return @sendError("Rate limited",data.request_id) if not @server.rate_limiter.accept("import_project_user",@user.id)
    #return @sendError("wrong data") if not data.zip_data? or typeof data.zip_data != "string"

    #split = data.zip_data.split(",")
    #return @sendError("unrecognized data") if not split[1]?
    buffer = data.data #Buffer.from(split[1],'base64')

    return @sendError("storage space exceeded",data.request_id) if buffer.byteLength>@user.max_storage-@user.getTotalSize()

    zip = new JSZip
    projectFileName = "project.json"
    zip.loadAsync(buffer).then ((contents) =>
      if not zip.file(projectFileName)?
        @sendError("[ZIP] Missing #{projectFileName}; import aborted",data.request_id)
        console.log "[ZIP] Missing #{projectFileName}; import aborted"
        return

      zip.file(projectFileName).async("string").then ((text) =>
        try
          projectInfo = JSON.parse(text)
        catch err
          @sendError("Incorrect JSON data",data.request_id)
          console.error err
          return

        @content.createProject @user,projectInfo,((project)=>
          @setCurrentProject project
          project.manager.importFiles contents,()=>
            project.set "files",projectInfo.files or {}
            @send
              name:"project_imported"
              id: project.id
              request_id: data.request_id
          ),true
      ),()=>
        @sendError("Malformed ZIP file",data.request_id)
    ),()=>
      @sendError("Malformed ZIP file",data.request_id)

  createProject:(data)->
    return @sendError("not connected") if not @user?
    return if not @server.rate_limiter.accept("create_project_user",@user.id)

    @content.createProject @user,data,(project)=>
      @send
        name:"project_created"
        id: project.id
        request_id: data.request_id

  clonePublicProject:(data)->
    return @sendError("not connected") if not @user?
    return if not @server.rate_limiter.accept("create_project_user",@user.id)
    return @sendError("") if not data.project?

    project = @server.content.projects[data.project]
    if project? and project.public
      @content.createProject @user,{
        title: project.title
        slug: project.slug
        public: false
      },((clone)=>
        clone.setType project.type
        clone.setOrientation project.orientation
        clone.setAspect project.aspect
        clone.setGraphics project.graphics
        clone.set "files",JSON.parse JSON.stringify project.files
        man = @getProjectManager(project)

        folders = ["ms","sprites","maps","sounds","sounds_th","music","music_th","doc"]
        files = []
        funk = ()=>
          if folders.length>0
            folder = folders.splice(0,1)[0]
            man.listFiles folder,(list)=>
              for f in list
                files.push
                  file: f.file
                  folder: folder
              funk()
          else if files.length>0
            f = files.splice(0,1)[0]
            src = "#{project.owner.id}/#{project.id}/#{f.folder}/#{f.file}"
            dest = "#{clone.owner.id}/#{clone.id}/#{f.folder}/#{f.file}"
            @server.content.files.copy src,dest,()=>
              funk()
          else
            @send
              name:"project_created"
              id: clone.id
              request_id: data.request_id

        funk()),true


  cloneProject:(data)->
    return @sendError("not connected") if not @user?
    return if not @server.rate_limiter.accept("create_project_user",@user.id)
    return @sendError("") if not data.project?

    project = @server.content.projects[data.project]
    if project?
      manager = @getProjectManager project
      if manager.canRead(@user)
        @content.createProject @user,{
          title: data.title or project.title
          slug: project.slug
          public: false
        },((clone)=>
          clone.setType project.type
          clone.setOrientation project.orientation
          clone.setAspect project.aspect
          clone.setGraphics project.graphics
          clone.set "files",JSON.parse JSON.stringify project.files
          man = @getProjectManager(project)

          folders = ["ms","sprites","maps","sounds","sounds_th","music","music_th","doc"]
          files = []
          funk = ()=>
            if folders.length>0
              folder = folders.splice(0,1)[0]
              man.listFiles folder,(list)=>
                for f in list
                  files.push
                    file: f.file
                    folder: folder
                funk()
            else if files.length>0
              f = files.splice(0,1)[0]
              src = "#{project.owner.id}/#{project.id}/#{f.folder}/#{f.file}"
              dest = "#{clone.owner.id}/#{clone.id}/#{f.folder}/#{f.file}"
              @server.content.files.copy src,dest,()=>
                funk()
            else
              @send
                name:"project_created"
                id: clone.id
                request_id: data.request_id

          funk()),true

  getProjectManager:(project)->
    if not project.manager?
      new ProjectManager project
    project.manager

  setProjectPublic:(data)->
    return @sendError("not connected") if not @user?
    return if data.public and not @user.flags["validated"]

    if not data.project?
      if @user.flags.admin and data.id
        project = @content.projects[data.id]
        if project?
          @content.setProjectPublic(project,data.public)
          @send
            name:"set_project_public"
            id: project.id
            public: project.public
            request_id: data.request_id
    else
      project = @user.findProject(data.project)
      if project?
        @content.setProjectPublic(project,data.public)
        @send
          name:"set_project_public"
          id: project.id
          public: project.public
          request_id: data.request_id

  setProjectTags:(data)->
    return @sendError("not connected") if not @user?
    return if data.public and not @user.flags["validated"]
    return if not data.project?

    project = @user.findProject(data.project)
    if not project? and @user.flags.admin
      project = @content.projects[data.project]

    if project? and data.tags?
      @content.setProjectTags(project,data.tags)
      @send
        name:"set_project_tags"
        id: project.id
        tags: project.tags
        request_id: data.request_id

  setProjectOption:(data)->
    return @sendError("not connected") if not @user?
    return @sendError("no value") if not data.value?

    project = @user.findProject(data.project)
    if project?
      switch data.option
        when "title"
          if not project.setTitle data.value
            @send
              name:"error"
              value: project.title
              request_id: data.request_id

        when "slug"
          if not project.setSlug data.value
            @send
              name:"error"
              value: project.slug
              request_id: data.request_id

        when "description"
          project.set "description",data.value

        when "code"
          if not project.setCode data.value
            @send
              name:"error"
              value: project.code
              request_id: data.request_id

        when "platforms"
          project.setPlatforms data.value if Array.isArray data.value

        when "controls"
          project.setControls data.value if Array.isArray data.value

        when "type"
          project.setType data.value if typeof data.value == "string"

        when "orientation"
          project.setOrientation data.value if typeof data.value == "string"

        when "aspect"
          project.setAspect data.value if typeof data.value == "string"

        when "graphics"
          if @user.flags.m3d
            project.setGraphics data.value if typeof data.value == "string"

      if project.manager?
        project.manager.propagateOptions @

      project.touch()

  deleteProject:(data)->
    return @sendError("not connected") if not @user?

    project = @user.findProject(data.project)
    if project?
      @user.deleteProject project
      @send
        name:"project_deleted"
        id: project.id
        request_id: data.request_id

  getProjectList:(data)->
    return @sendError("not connected") if not @user?

    source = @user.listProjects()
    list = []
    for p in source
      if not p.deleted
        list.push
          id: p.id
          owner:
            id: p.owner.id
            nick: p.owner.nick
          title: p.title
          slug: p.slug
          code: p.code
          description: p.description
          tags: p.tags
          platforms: p.platforms
          controls: p.controls
          type: p.type
          orientation: p.orientation
          aspect: p.aspect
          graphics: p.graphics
          date_created: p.date_created
          last_modified: p.last_modified
          public: p.public
          size: p.getSize()
          users: p.listUsers()

    source = @user.listProjectLinks()
    for link in source
      if not link.project.deleted
        p = link.project
        list.push
          id: p.id
          owner:
            id: p.owner.id
            nick: p.owner.nick
          accepted: link.accepted
          title: p.title
          slug: p.slug
          code: p.code
          description: p.description
          tags: p.tags
          platforms: p.platforms
          controls: p.controls
          type: p.type
          orientation: p.orientation
          aspect: p.aspect
          graphics: p.graphics
          date_created: p.date_created
          last_modified: p.last_modified
          public: p.public
          users: p.listUsers()

    @send
      name: "project_list"
      list: list
      request_id: if data? then data.request_id else undefined

  lockProjectFile:(data)->
    return @sendError("not connected") if not @user?
    #console.info JSON.stringify data

    project = @content.projects[data.project] if data.project?
    if project?
      @setCurrentProject project
      project.manager.lockFile(@,data.file)

  writeProjectFile:(data)->
    return @sendError("not connected") if not @user?

    project = @content.projects[data.project] if data.project?
    if project?
      @setCurrentProject project
      project.manager.writeProjectFile(@,data)

      if typeof data.file == "string"
        if data.file.startsWith "ms/"
          @user.progress.recordTime "time_coding"
          if data.characters?
            @user.progress.incrementLimitedStat "characters_typed",data.characters
          if data.lines?
            @user.progress.incrementLimitedStat "lines_of_code",data.lines
          @checkUpdates()
        else if data.file.startsWith "sprites/"
          @user.progress.recordTime "time_drawing"
          if data.pixels?
            @user.progress.incrementLimitedStat "pixels_drawn",data.pixels
            @checkUpdates()
        else if data.file.startsWith "maps/"
          @user.progress.recordTime "time_mapping"
          if data.cells?
            @user.progress.incrementLimitedStat "map_cells_drawn",data.cells
            @checkUpdates()

  renameProjectFile:(data)->
    return @sendError("not connected") if not @user?

    project = @content.projects[data.project] if data.project?
    if project?
      @setCurrentProject project
      project.manager.renameProjectFile(@,data)

  deleteProjectFile:(data)->
    return @sendError("not connected") if not @user?

    project = @content.projects[data.project] if data.project?
    if project?
      @setCurrentProject project
      project.manager.deleteProjectFile(@,data)

  readProjectFile:(data)->
    #console.info "session.readProjectFile "+JSON.stringify data
    return @sendError("not connected") if not @user?

    project = @content.projects[data.project] if data.project?
    if project?
      @setCurrentProject project
      project.manager.readProjectFile(@,data)

  listProjectFiles:(data)->
    return @sendError("not connected") if not @user?

    project = @content.projects[data.project] if data.project?
    if project?
      @setCurrentProject project
      project.manager.listProjectFiles @,data

  listPublicProjectFiles:(data)->
    project = @content.projects[data.project] if data.project?
    if project?
      manager = @getProjectManager project
      manager.listProjectFiles @,data

  readPublicProjectFile:(data)->
    project = @content.projects[data.project] if data.project?
    if project? and project.public
      manager = @getProjectManager project
      project.manager.readProjectFile(@,data)

  listenToProject:(data)->
    user = data.user
    project = data.project
    if user? and project?
      user = @content.findUserByNick(user)
      if user?
        project = user.findProjectBySlug(project)
        if project?
          if @project? and @project.manager?
            @project.manager.removeListener @

          @project = project
          new ProjectManager @project if not @project.manager?
          @project.manager.addListener @

  getFileVersions:(data)->
    user = data.user
    project = data.project
    if user? and project?
      user = @content.findUserByNick(user)
      if user?
        project = user.findProjectBySlug(project)
        if project?
          new ProjectManager project if not project.manager?
          project.manager.getFileVersions (res)=>
            @send
              name: "project_file_versions"
              data: res
              request_id: data.request_id

  getPublicProjects:(data)->
    switch data.ranking
      when "new"
        source = @content.new_projects
      when "top"
        source = @content.top_projects
      else
        source = @content.hot_projects

    list = []
    for p,i in source
      break if list.length>=300
      if p.public and not p.deleted and not p.owner.flags.censored
        list.push
          id: p.id
          title: p.title
          description: p.description
          type: p.type
          tags: p.tags
          slug: p.slug
          owner: p.owner.nick
          owner_info:
            tier: p.owner.flags.tier
            profile_image: p.owner.flags.profile_image
          likes: p.likes
          liked: @user? and @user.isLiked(p.id)
          tags: p.tags
          date_published: p.first_published

    @send
      name: "public_projects"
      list: list
      request_id: data.request_id

  getPublicProject:(msg)->
    owner = msg.owner
    project = msg.project
    if owner? and project?
      owner = @content.findUserByNick(owner)
      if owner?
        p = owner.findProjectBySlug(project)
        if p? and p.public
          res =
            id: p.id
            title: p.title
            description: p.description
            type: p.type
            tags: p.tags
            slug: p.slug
            owner: p.owner.nick
            owner_info:
              tier: p.owner.flags.tier
              profile_image: p.owner.flags.profile_image
            likes: p.likes
            liked: @user? and @user.isLiked(p.id)
            tags: p.tags
            date_published: p.first_published

          @send
            name: "get_public_project"
            project: res
            request_id: msg.request_id

  toggleLike:(data)->
    return @sendError("not connected") if not @user?
    return @sendError("not validated") if not @user.flags.validated

    project = @content.projects[data.project]
    if project?
      if @user.isLiked(project.id)
        @user.removeLike(project.id)
        project.likes--
      else
        @user.addLike(project.id)
        project.likes++
        if project.likes>=5
          project.owner.progress.unlockAchievement("community/5_likes")

      @send
        name:"project_likes"
        likes: project.likes
        liked: @user.isLiked(project.id)
        request_id: data.request_id

  inviteToProject:(data)->
    return @sendError("not connected",data.request_id) if not @user?

    user = @content.findUserByNick(data.user)
    return @sendError("user not found",data.request_id) if not user?

    project = @user.findProject(data.project)
    return @sendError("project not found",data.request_id) if not project?

    @setCurrentProject project
    project.manager.inviteUser @,user

  acceptInvite:(data)->
    return @sendError("not connected") if not @user?

    for link in @user.project_links
      if link.project.id == data.project
        link.accept()
        @setCurrentProject link.project
        if link.project.manager?
          link.project.manager.propagateUserListChange()
        for li in @user.listeners
          li.getProjectList()

    return

  removeProjectUser:(data)->
    return @sendError("not connected") if not @user?

    project = @content.projects[data.project] if data.project?
    return @sendError("project not found",data.request_id) if not project?

    user = @content.findUserByNick(data.user) if data.user?
    return @sendError("user not found",data.request_id) if not user?

    return if @user != project.owner and @user != user

    for link in project.users
      if link.user == user
        link.remove()
        if @user == project.owner
          @setCurrentProject project
        else
          @send
            name:"project_link_deleted"
            request_id: data.request_id

        if project.manager?
          project.manager.propagateUserListChange()

        for li in user.listeners
          li.getProjectList()

    return

  sendValidationMail:(data)->
    return @sendError("not connected") if not @user?
    if @server.rate_limiter.accept("send_mail_user",@user.id)
      @server.content.sendValidationMail(@user)
      if data?
        @send
          name:"send_validation_mail"
          request_id: data.request_id
        return

  changeNick:(data)->
    return if not @user?
    return if not data.nick?

    if not RegexLib.nick.test(data.nick)
      @send
        name: "error"
        value: "Incorrect nickname"
        request_id: data.request_id
    else
      if @server.content.findUserByNick(data.nick)? or @reserved_nicks[data.nick]
        @send
          name: "error"
          value: "Nickname not available"
          request_id: data.request_id
      else
        @server.content.changeUserNick @user,data.nick
        @send
          name: "change_nick"
          nick: data.nick
          request_id: data.request_id

  changeEmail:(data)->
    return if not @user?
    return if not data.email?

    if not RegexLib.email.test(data.email)
      @send
        name: "error"
        value: "Incorrect email"
        request_id: data.request_id
    else
      if @server.content.findUserByEmail(data.email)?
        @send
          name: "error"
          value: "E-mail is already used for another account"
          request_id: data.request_id
      else
        @user.setFlag "validated",false
        @user.resetValidationToken()
        @server.content.changeUserEmail @user,data.email
        @sendValidationMail()
        @send
          name: "change_email"
          email: data.email
          request_id: data.request_id

  changeNewsletter:(data)->
    return if not @user?

    @user.setFlag "newsletter",data.newsletter
    @send
      name: "change_newsletter"
      newsletter: data.newsletter
      request_id: data.request_id

  changeExperimental:(data)->
    return if not @user? or not @user.flags.validated

    @user.setFlag "experimental",data.experimental
    @send
      name: "change_experimental"
      experimental: data.experimental
      request_id: data.request_id

  setUserSetting:(data)->
    return if not @user?

    return if not data.setting? or not data.value?
    @user.setSetting data.setting,data.value

  setUserProfile:(data)->
    return if not @user?
    if data.image?
      if data.image == 0
        @user.setFlag "profile_image",false
      else
        file = "#{@user.id}/profile_image.png"
        content = new Buffer(data.image,"base64")
        @server.content.files.write file,content,()=>
          @user.setFlag "profile_image",true
          @send
            name: "set_user_profile"
            request_id: data.request_id
        return

    if data.description?
      @user.set "description",data.description

    @send
      name: "set_user_profile"
      request_id: data.request_id

  getLanguage:(msg)->
    return if not msg.language?
    lang = @server.content.translator.languages[msg.language]
    lang = if lang? then lang.export() else "{}"

    @send
      name: "get_language"
      language: lang
      request_id: msg.request_id

  getTranslationList:(msg)->
    @send
      name: "get_translation_list"
      list: @server.content.translator.list
      request_id: msg.request_id

  setTranslation:(msg)->
    return if not @user?
    lang = msg.language
    return if not @user.flags["translator_"+lang]

    source = msg.source
    translation = msg.translation
    if not @server.content.translator.languages[lang]
      @server.content.translator.createLanguage(lang)

    @server.content.translator.languages[lang].set(@user.id,source,translation)

  addTranslation:(msg)->
    return if not @user?
    #return if not @user.flags.admin
    source = msg.source
    @server.content.translator.reference source

  getProjectComments:(data)->
    return if not data.project?

    project = @content.projects[data.project] if data.project?
    if project? and project.public
      @send
        name: "project_comments"
        request_id: data.request_id
        comments: project.comments.getAll()

  addProjectComment:(data)->
    return if not data.project?
    return if not data.text?

    project = @content.projects[data.project] if data.project?
    if project? and project.public
      if @user? and @user.flags.validated and not @user.flags.banned and not @user.flags.censored
        return if not @server.rate_limiter.accept("post_comment_user",@user.id)
        project.comments.add(@user,data.text)
        @send
          name: "add_project_comment"
          request_id: data.request_id

  deleteProjectComment:(data)->
    return if not data.project?
    return if not data.id?

    project = @content.projects[data.project] if data.project?
    if project? and project.public
      if @user?
        c = project.comments.get(data.id)
        if c? and (c.user == @user or @user.flags.admin)
          c.remove()
          @send
            name: "delete_project_comment"
            request_id: data.request_id

  editProjectComment:(data)->
    return if not data.project?
    return if not data.id?
    return if not data.text?

    project = @content.projects[data.project] if data.project?
    if project? and project.public
      if @user?
        c = project.comments.get(data.id)
        if c? and c.user == @user
          c.edit(data.text)
          @send
            name: "edit_project_comment"
            request_id: data.request_id

  tutorialCompleted:(msg)->
    return if not @user?
    return if not msg.id? or typeof msg.id != "string"
    return if not msg.id.startsWith("tutorials/")
    @user.progress.unlockAchievement(msg.id)
    @checkUpdates()

  checkUpdates:()->
    if @user?
      if @user.progress.achievements_update != @achievements_update
        @achievements_update = @user.progress.achievements_update
        @sendAchievements()

      if @user.progress.stats_update != @stats_update
        @stats_update = @user.progress.stats_update
        @sendUserStats()

  sendAchievements:()->
    return if not @user?

    @send
      name: "achievements"
      achievements: @user.progress.exportAchievements()

  sendUserStats:()->
    return if not @user?

    @send
      name: "user_stats"
      stats: @user.progress.exportStats()

  buildProject:(msg)->
    return @sendError("not connected") if not @user?

    project = @content.projects[msg.project] if msg.project?
    if project?
      @setCurrentProject project
      return if not project.manager.canWrite @user
      return if not msg.target?
      build = @server.build_manager.startBuild(project,msg.target)
      @send
        name: "build_project"
        request_id: msg.request_id
        build: if build? then build.export() else null

  getBuildStatus:(msg)->
    return @sendError("not connected") if not @user?

    project = @content.projects[msg.project] if msg.project?
    if project?
      @setCurrentProject project
      return if not project.manager.canWrite @user
      return if not msg.target?
      build = @server.build_manager.getBuildInfo(project,msg.target)
      @send
        name: "build_project"
        request_id: msg.request_id
        build: if build? then build.export() else null
        active_target: @server.build_manager.hasBuilder msg.target

  timeCheck:()->
    if Date.now()>@last_active+5*60000 # 5 minutes prevents breaking large assets uploads
      @socket.close()
      @server.sessionClosed @
      @socket.terminate()

    if @upload_request_activity? and Date.now()>@upload_request_activity+60000
      @upload_request_id = -1
      @upload_request_buffers = []

  startBuilder:(msg)->
    if msg.target?
      if msg.key == @server.config["builder-key"]
        @server.sessionClosed @
        @server.build_manager.registerBuilder @,msg.target

  backupComplete:(msg)->
    if msg.key == @server.config["backup-key"]
      @server.sessionClosed @
      @server.last_backup_time = Date.now()

  uploadRequest:(msg)=>
    return if not @user?
    return @sendError "Bad request" if not msg.size?
    return @sendError "Bad request" if not msg.request_id?
    return @sendError "Bad request" if not msg.request?
    return @sendError("Rate limited",msg.request_id) if not @server.rate_limiter.accept("file_upload_user",@user.id)
    return @sendError "File size limit exceeded" if msg.size>100000000 # 100 Mb max

    @upload_request_id = msg.request_id
    @upload_request_size = msg.size
    @upload_uploaded = 0
    @upload_request_buffers = []
    @upload_request_request = msg.request
    @upload_request_activity = Date.now()

    @send
      name:"upload_request"
      request_id: msg.request_id

  bufferReceived:(buffer)=>
    if buffer.byteLength>=4
      id = buffer.readInt32LE(0)
      if id == @upload_request_id
        len = buffer.byteLength-4

        if len>0 and @upload_uploaded<@upload_request_size
          buf = Buffer.alloc(len)
          buffer.copy buf,0,4,buffer.byteLength
          @upload_request_buffers.push buf
          @upload_uploaded += len
          @upload_request_activity = Date.now()

        if @upload_uploaded >= @upload_request_size
          msg = @upload_request_request
          buf = Buffer.alloc @upload_request_size
          count = 0
          for b in @upload_request_buffers
            b.copy buf,count,0,b.byteLength
            count += b.byteLength

          msg.data = buf
          msg.request_id = id
          try
            if msg.name?
              c = @commands[msg.name]
              c(msg) if c?
          catch error
            console.error error
        else
          @send
            name:"next_chunk"
            request_id: id

module.exports = @Session
