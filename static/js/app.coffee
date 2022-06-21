app = null

window.addEventListener "load",()->
  app = new App()

class App
  constructor:()->
    @languages =
      microscript2: LANGUAGE_MICROSCRIPT2
      microscript: LANGUAGE_MICROSCRIPT
      python: LANGUAGE_PYTHON
      javascript: LANGUAGE_JAVASCRIPT
      lua: LANGUAGE_LUA

    @translator = new Translator @
    @app_state = new AppState @

    @appui = new AppUI @
    @explore = new Explore @
    @client = new Client @

    @user_progress = new UserProgress @

    @about = new About @

    @documentation = new Documentation @
    @editor = new Editor @
    @doc_editor = new DocEditor @
    @sprite_editor = new SpriteEditor @
    @map_editor = new MapEditor @
    @assets_manager = new AssetsManager @
    @audio_controller = new AudioController @
    @sound_editor = new SoundEditor @
    @music_editor = new MusicEditor @
    @runwindow = new RunWindow @
    @debug = new Debug @
    @options = new Options @
    @tab_manager = new TabManager @
    @lib_manager = new LibManager @
    @sync = new Sync @
    @publish = new Publish @
    @user_settings = new UserSettings @
    @connected = false
    @tutorial = new TutorialWindow @
    @tutorials = new Tutorials @
    @client.start()

  setToken:(@token,@username)->
    @client.setToken @token

  createGuest:()->
    @client.sendRequest {
      name: "create_guest"
      language: if window.navigator.language? then window.navigator.language.substring(0,2) else "en"
    },(msg)=>
      switch msg.name
        when "error"
          console.error msg.error
          alert @translator.get(msg.error) if msg.error?

        when "guest_created"
          @setToken msg.token
          @nick = msg.nick
          @user =
            nick: msg.nick
            flags: msg.flags
            settings: msg.settings
            info: msg.info
          @connected = true
          @userConnected(msg.nick)

  createAccount:(nick,email,password,newsletter)->
    @client.sendRequest {
      name: "create_account"
      nick: nick
      email: email
      password: password
      newsletter: newsletter
      language: if window.navigator.language? then window.navigator.language.substring(0,2) else "en"
    },(msg)=>
      switch msg.name
        when "error"
          console.error msg.error
          alert @translator.get(msg.error) if msg.error?

        when "account_created"
          @setToken msg.token
          @nick = nick
          @user =
            nick: msg.nick
            email: msg.email
            flags: msg.flags
            settings: msg.settings
            info: msg.info
          @connected = true
          @userConnected(nick)

  login:(nick,password)->
    @client.sendRequest {
      name: "login"
      nick: nick
      password: password
    },(msg)=>
      switch msg.name
        when "error"
          console.error msg.error
          alert @translator.get(msg.error) if msg.error?

        when "logged_in"
          @setToken msg.token
          @nick = msg.nick
          @user =
            nick: msg.nick
            email: msg.email
            flags: msg.flags
            settings: msg.settings
            info: msg.info

          if msg.notifications? and msg.notifications.length>0
            for n in msg.notifications
              @appui.showNotification n
          @connected = true
          @userConnected(msg.nick)
          @appui.showNotification @translator.get "Welcome back!"

  sendPasswordRecovery:(email)->
    if not RegexLib.email.test(email)
      alert(@translator.get("incorrect email"))
    else
      @client.sendRequest {
        name: "send_password_recovery"
        email: email
      },(msg)=>
        document.getElementById("forgot-password-panel").innerHTML = @translator.get("Thank you. Please check your mail.")
        setTimeout (()=>@appui.hide "login-overlay"),5000

  createProject:(title,slug,options,callback)->
    if options? and typeof options == "function" and not callback?
      callback = options
      options =
        language: "microscript_v2"

    @client.sendRequest {
      name: "create_project"
      title: title
      slug: slug
      type: options.type
      graphics: options.graphics
      language: options.language
      libs: options.libs
    },(msg)=>
      switch msg.name
        when "error"
          console.error msg.error
          alert @translator.get(msg.error) if msg.error?

        when "project_created"
          @getProjectList (list)=>
            @projects = list
            @appui.updateProjects()
            for p in list
              if p.id == msg.id
                @openProject p
                callback() if callback?

      return

  importProject:(file)->
    return if @importing
    console.info "importing #{file.name}"
    reader = new FileReader()
    reader.addEventListener "load",()=>
      # return if not reader.result.startsWith("data:application/x-zip-compressed;base64,")
      # mime-type returned by browser may vary ; let's just check ZIP extension
      return if not file.name.toLowerCase().endsWith(".zip")
      @importing = true

      @client.sendUpload {
        name: "import_project"
      },reader.result,((msg)=>
        console.log "[ZIP] #{msg.name}"
        switch msg.name
          when "error"
            @appui.showNotification @translator.get msg.error
            @appui.resetImportButton()
            @importing = false

          when "project_imported"
            @updateProjectList(msg.id)
            @appui.showNotification @translator.get "Project imported successfully"
            @appui.resetImportButton()
            @importing = false
            @tab_manager.resetPlugins()
            @lib_manager.resetLibs()

      ),(progress)=>
        @appui.setImportProgress(progress)

    reader.readAsArrayBuffer(file)

  updateProjectList:(open_when_fetched)->
    @getProjectList (list)=>
      @projects = list
      @appui.updateProjects()
      if open_when_fetched?
        for p in @projects
          if p.id == open_when_fetched
            @openProject p
            break

  getProjectList:(callback)->
    @client.sendRequest {
      name: "get_project_list"
    },(msg)=>
      callback(msg.list) if callback?

  openProject:(project,useraction = true)->
    @project = new Project @,project
    @appui.setProject(@project,useraction)
    @editor.setCode("")
    @editor.projectOpened()
    @sprite_editor.projectOpened()
    @map_editor.projectOpened()
    @sound_editor.projectOpened()
    @music_editor.projectOpened()
    @assets_manager.projectOpened()
    @runwindow.projectOpened()
    @debug.projectOpened()
    @options.projectOpened()
    @tab_manager.projectOpened()
    @lib_manager.projectOpened()
    @sync.projectOpened()
    @publish.loadProject(@project)
    @project.load()
    if not @tutorial.shown
      tuto = @getProjectTutorial(project.slug)
      if tuto?
        t = new Tutorial(tuto)
        t.load ()=>
          @tutorial.start(t)

  deleteProject:(project)->
    if project.owner.nick == @nick
      @client.sendRequest {
        name: "delete_project"
        project: project.id
      },(msg)=>
        @updateProjectList()
    else
      @client.sendRequest
        name:"remove_project_user"
        project: project.id
        user: @nick

  projectTitleExists:(title)->
    return false if not @projects
    for p in @projects
      return true if p.title == title
    false

  cloneProject:(project)->
    title = project.title + " (#{@translator.get("copy")})"
    count = 1
    while @projectTitleExists(title)
      count += 1
      title = project.title + " (#{@translator.get("copy")} #{count})"

    @client.sendRequest {
      name: "clone_project"
      project: project.id
      title: title
    },(msg)=>
      @appui.setMainSection("projects")
      @appui.backToProjectList()
      @updateProjectList()
      @appui.showNotification(@translator.get("Project cloned! Here is your copy."))

  writeProjectFile:(project_id,file,content,callback)->
    @client.sendRequest {
      name:"write_project_file"
      project: project_id
      file:file
      content: content
    },(msg)=>

  readProjectFile:(project_id,file,callback)->
    @client.sendRequest {
      name:"read_project_file"
      project: project_id
      file: file
    },(msg)=>
      callback msg.content

  #listProjectFiles:(project_id,folder,callback)->
  #  @client.sendRequest {
  #    name:"list_project_files"
  #    project: project_id
  #    folder: folder
  #  },(msg)=>
  #    callback msg.content

  userConnected:(nick)->
    @appui.userConnected(nick)
    @updateProjectList()
    @user_settings.update()
    @user_progress.init()

  disconnect:()->
    if not @user.email? or @user.flags.guest
      @client.sendRequest {
        name: "delete_guest"
      },(msg)=>
        @setToken(null)
        location.reload()
    else
      @setToken(null)
      location.reload()

  fetchPublicProjects:()->
    @client.sendRequest {
      name: "get_public_projects"
      ranking: "hot"
      tags: []
    },(msg)=>

  serverMessage:(msg)->
    switch msg.name
      when "project_user_list"
        @updateProjectUserList msg
      when "project_list"
        @projects = msg.list
        @appui.updateProjects()
      when "project_file_locked"
        if @project? and msg.project == @project.id
          @project.fileLocked(msg)
      when "project_file_update"
        if @project? and msg.project == @project.id
          @project.fileUpdated(msg)
      when "project_file_deleted"
        if @project? and msg.project == @project.id
          @project.fileDeleted(msg)
      when "project_options_updated"
        if @project? and msg.project == @project.id
          @project.optionsUpdated(msg)
          @options.projectOpened()
          @tab_manager.projectOpened()
          @lib_manager.projectOpened()
      when "user_stats"
        if @user?
          @user.info.stats = msg.stats
          @user_progress.update()
          @user_progress.updateStatsPage()

      when "achievements"
        if @user?
          @user.info.achievements = msg.achievements
          @user_progress.checkAchievements()

  updateProjectUserList:(msg)->
    if @project? and msg.project == @project.id
      @project.users = msg.users
      @options.updateUserList()

  getUserSetting:(setting)->
    if @user? and @user.settings?
      @user.settings[setting]
    else
      null

  setUserSetting:(setting,value)->
    if @user?
      if not @user.settings?
        @user.settings = {}
      @user.settings[setting] = value
      @client.sendRequest {
        name: "set_user_setting"
        setting: setting
        value: value
      },(msg)=>

  setTutorialProgress:(tutorial_id,progress)->
    tutorial_progress = @getUserSetting("tutorial_progress")
    if not tutorial_progress?
      tutorial_progress = {}

    tutorial_progress[tutorial_id] = progress
    @setUserSetting("tutorial_progress",tutorial_progress)

  getTutorialProgress:(tutorial_id)->
    tutorial_progress = @getUserSetting("tutorial_progress")
    if not tutorial_progress?
      return 0
    else
      return tutorial_progress[tutorial_id] or 0

  setProjectTutorial:(project_slug,tutorial_id)->
    project_tutorial = @getUserSetting("project_tutorial")
    if not project_tutorial?
      project_tutorial = {}

    project_tutorial[project_slug] = tutorial_id
    @setUserSetting("project_tutorial",project_tutorial)

  getProjectTutorial:(slug)->
    project_tutorial = @getUserSetting("project_tutorial")
    if not project_tutorial?
      return null
    else
      return project_tutorial[slug]

  setHomeState:()->
    if @translator.lang != "en"
      history.replaceState null,"microStudio","/#{@translator.lang}/"
    else
      history.replaceState null,"microStudio","/"

  setState:(state)->

  getTierName:(tier)->
    switch tier
      when "pixel_master" then return "Pixel Master"
      when "code_ninja" then return "Code Ninja"
      when "gamedev_lord" then return "Gamedev Lord"
      when "founder" then return "Founder"
      when "sponsor" then return "Sponsor"
      else return "Standard"

    return ""

  openUserSettings:()->
    @appui.setMainSection("usersettings")
    @user_settings.setSection("settings")
    @app_state.pushState "user.settings","/user/settings/"

  openUserProfile:()->
    @appui.setMainSection("usersettings")
    @user_settings.setSection("profile")
    @app_state.pushState "user.profile","/user/profile/"

  openUserProgress:()->
    @appui.setMainSection("usersettings")
    @user_settings.setSection("progress")
    @app_state.pushState "user.progress","/user/progress/"


if navigator.serviceWorker?
  navigator.serviceWorker.register("/app_sw.js", { scope: location.pathname }).then((reg)->
    console.log('Registration succeeded. Scope is' + reg.scope)
  ).catch (error)->
    console.log('Registration failed with' + error)
