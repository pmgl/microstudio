class AppUI
  constructor:(@app)->
    @sections = [
      "code"
      "sprites"
      "maps"
      "assets"
      "sounds"
      "music"
      "doc"
#      "server"
      "options"
      "publish"
    ]

    @menuoptions = [
      "home"
      "explore"
      "projects"
      "help"
      "tutorials"
      "about"
      "usersettings"
    ]

    @allowed_sections =
      "code": true
      "sprites": true
      "maps": true
      "doc": true
      "options": true
      "publish": true

    for s in @sections
      do (s)=>
        if document.getElementById("menuitem-#{s}")?
          document.getElementById("menuitem-#{s}").addEventListener "click",(event)=>
            @setSection(s,true)

    @updateAllowedSections()

    for s in @menuoptions
      do (s)=>
        e = document.getElementById("menu-#{s}")
        if e?
          e.addEventListener "click",(event)=>
            @setMainSection(s,true)

    @setAction "logo",()=>@setMainSection("home",true)

    #@setSection("options")
    @createLoginFunctions()

    @setAction "create-project-button",()=>
      @show "create-project-overlay"
      @focus "create-project-title"

    @setAction "import-project-button",()=>
      input = document.createElement "input"
      input.type = "file"
      input.accept = "application/zip"
      input.addEventListener "change",(event)=>
        files = event.target.files
        if files.length>=1
          f = files[0]
          @app.importProject f

      input.click()

    @setAction "create-project-window",(event)=>
      event.stopPropagation()

    @setAction "home-action-explore",()=>
      @setMainSection("explore")

    @setAction "home-action-create",()=>
      @setMainSection("projects")

    document.getElementById("create-project-overlay").addEventListener "mousedown",(event)=>
      @hide "create-project-overlay"

    document.getElementById("create-project-window").addEventListener "mousedown",(event)=>
      event.stopPropagation()

    @setAction "create-project-submit",()=>
      title = @get("create-project-title").value
      slug = RegexLib.slugify(title)
      if title.length>0 and slug.length>0
        @app.createProject(title,slug)
        @hide "create-project-overlay"
        @get("create-project-title").value = ""

    @doc_splitbar = new SplitBar("doc-section","horizontal")
    @code_splitbar = new SplitBar("code-section","horizontal")
    @runtime_splitbar = new SplitBar("runtime-container","vertical")
    @runtime_splitbar.setPosition(67)
    @sprites_splitbar = new SplitBar("sprites-section","horizontal")
    @sprites_splitbar.setPosition(20)
    @maps_splitbar = new SplitBar("maps-section","horizontal")
    @maps_splitbar.setPosition(20)
    @mapeditor_splitbar = new SplitBar("mapeditor-container","horizontal")
    @mapeditor_splitbar.setPosition(80)

    @setAction "backtoprojects",()=>
      if @app.project?
        @app.project.savePendingChanges ()=>
          @backToProjectList(true)
      else
        @backToProjectList(true)

    @get("create_nick").addEventListener "input",()=>
      value = @get("create_nick").value
      if value != RegexLib.fixNick(value)
        @get("create_nick").value = RegexLib.fixNick(value)

    @startSaveStatus()

    @last_activity = Date.now()

    document.addEventListener "mousemove",()=>
      @last_activity = Date.now()

    document.addEventListener "keydown",()=>
      @last_activity = Date.now()

    document.querySelector("#projects-search input").addEventListener "input",()=>
      search = document.querySelector("#projects-search input").value.toLowerCase()
      list = document.getElementById("project-list").childNodes
      if search.trim().length>0
        for p in list
          ok = p.dataset.title.toLowerCase().indexOf(search)>=0
          ok |= p.dataset.description.toLowerCase().indexOf(search)>=0
          ok |= p.dataset.tags.toLowerCase().indexOf(search)>=0
          if ok
            p.style.display = "inline-block"
          else
            p.style.display = "none"
      else
        for p in list
          p.style.display = "inline-block"

    document.querySelector("#home-section").addEventListener "scroll",()=>
      scroll = Math.min(60,document.querySelector("#home-section").scrollTop)
      document.querySelector("#home-header-background").style.height = "#{scroll}px"
      #document.querySelector("#home-section .part1").style["padding-top"] = "#{160-scroll}px"


    document.getElementById("myprojects").addEventListener "dragover",(event)=>
      event.preventDefault()

    document.getElementById("myprojects").addEventListener "drop",(event)=>
      event.preventDefault()
      if event.dataTransfer.items and event.dataTransfer.items[0]?
        @app.importProject(event.dataTransfer.items[0].getAsFile())

    setInterval (()=>@checkActivity()),10000

    @reboot_date = 1622710800000
    @checkRebootMessage()

  checkRebootMessage:()->
    if @reboot_date and Date.now()<@reboot_date+1000*60*2
      document.querySelector(".main-container").style.top = "100px"
      div = document.createElement "div"
      div.classList.add "meta-message"
      funk = ()=>
        minutes = Math.max(0,@reboot_date-Date.now())/60000
        if minutes>=120
          hours = Math.floor(minutes/60)
          div.innerHTML = "<i class='fas fa-info-circle'></i> "+@app.translator.get("microStudio is getting a new server! Migration planned on %DATE% at %TIME%. Downtime will last 1 hour.").replace("%DATE%",new Date(@reboot_date).toLocaleDateString()).replace("%TIME%",new Date(@reboot_date).toLocaleTimeString())
        else if minutes>=2
          minutes = Math.floor(minutes)
          div.innerHTML = "<i class='fas fa-exclamation-circle'></i> "+@app.translator.get("Downtime will start in %MINUTES% minutes").replace("%MINUTES%",minutes)
        else
          div.innerHTML = "<i class='fas fa-exclamation-circle'></i> "+@app.translator.get("Downtime will start immediately")

      funk()
      setInterval (()=>funk()),30000
      document.body.appendChild div

  addWarningMessage:(text)->
    document.querySelector(".main-container").style.top = "100px"
    div = document.createElement "div"
    div.classList.add "meta-message"
    div.innerHTML = "<i class='fas fa-exclamation-circle'></i> #{text}"
    document.body.appendChild div

  checkActivity:()->
    t = Date.now()-@last_activity
    if @app.project?
      if t>60*60*1000
        @backToProjectList(true)
      else
        @app.client.sendRequest
          name: "ping"

  backToProjectList:(useraction)->
    @hide "projectview"
    @show "myprojects"
    @app.runwindow.projectClosed()
    @app.project = null
    @project = null
    @app.updateProjectList()
    if useraction
      @app.app_state.pushState "projects","/projects/"

  setSection:(section,useraction)->
    @current_section = section

    for s in @sections
      do (s)=>
        element = document.getElementById("#{s}-section")
        menuitem = document.getElementById("menuitem-#{s}")
        return if not element? or not menuitem?
        if s == section
          element.style.display = "block"
          menuitem.classList.add "selected"
        else
          element.style.display = "none"
          menuitem.classList.remove "selected"

        return

    if section == "sprites"
      @app.sprite_editor.spriteview.windowResized()

    if section == "code"
      @code_splitbar.update()
      @runtime_splitbar.update()
      @app.runwindow.windowResized()

    if section == "sprites"
      @sprites_splitbar.update()
      if @sprites_splitbar.position/100*@sprites_splitbar.total_width<64
        @sprites_splitbar.setPosition 100*150/@sprites_splitbar.total_width
      else if @sprites_splitbar.position>90
        @sprites_splitbar.setPosition 50

    if section == "maps"
      if @mapeditor_splitbar.position>90
        @mapeditor_splitbar.setPosition 80

      if @maps_splitbar.position/100*@maps_splitbar.total_width<90
        @maps_splitbar.setPosition 100*210/@maps_splitbar.total_width
      else if @maps_splitbar.position>90
        @maps_splitbar.setPosition 50
      @maps_splitbar.update()
      @mapeditor_splitbar.update()

    if section == "doc"
      @doc_splitbar.update()

    if section == "sounds"
      @app.sound_editor.update()
      #@app.audio_controller.init()

    if section == "music"
      @app.music_editor.update()

    if section == "options"
      @app.options.update()

    if useraction and @app.project?
      @app.app_state.pushState "project.#{@app.project.slug}.#{section}","/projects/#{@app.project.slug}/#{section}/"

  accountRequired:(callback)->
    @logged_callback = callback

    @setDisplay "login-overlay","block"
    @hide "login-panel"
    @hide "create-account-panel"
    @hide "forgot-password-panel"
    @show "guest-panel"

  setMainSection:(section,useraction=false)->
    if section == "projects" and not @app.user?
      @accountRequired()
      return

    if useraction
      if section == "home"
        @app.app_state.pushState "home",if @app.translator.lang == "fr" then "/fr" else "/"
      else if section == "projects" and @project? and @current_section?
        @app.app_state.pushState "project.#{@project.slug}.#{@current_section}","/projects/#{@project.slug}/#{@current_section}/"
      else if section == "explore" and @app.explore.project
        p = @app.explore.project
        @app.app_state.pushState "project_details","/i/#{p.owner}/#{p.slug}/",{project: p}
      else
        name = {"help":"documentation"}[section] || section
        @app.app_state.pushState name,"/#{name}/"

    for s in @menuoptions
      do (s)=>
        element = document.getElementById("#{s}-section")
        menuitem = document.getElementById("menu-#{s}")
        if s == section
          element.style.display = "block"
          menuitem.classList.add "selected" if menuitem?
        else
          element.style.display = "none"
          menuitem.classList.remove "selected" if menuitem?

    if section == "projects" and not @app.project?
      @hide "projectview"
      @show "myprojects"

    if section == "projects"
      @code_splitbar.update()
      @runtime_splitbar.update()
      @app.runwindow.windowResized()

    if section == "explore"
      @app.explore.update()

    if section == "about"
      @app.about.setSection("about")

    if section == "tutorials"
      @app.tutorials.load()

    #@app.explore.closeDetails() if section != "explore"
    return

  setDisplay:(element,value)->
    document.getElementById(element).style.display = value

  focus:(element)->
    document.getElementById(element).focus()

  get:(id)->
    document.getElementById(id)

  setAction:(id,callback)->
    @get(id).addEventListener "click",(event)=>
      event.preventDefault()
      callback(event)

  show:(element)->
    @setDisplay element,"block"

  hide:(element)->
    @setDisplay element,"none"

  createLoginFunctions:()->
    s1 = document.getElementById("switch_to_create_account")
    s2 = document.getElementById("switch_to_log_in")
    s3 = document.getElementById("switch_from_forgot_to_login")
    s4 = document.getElementById("forgot-password-link")
    s1.addEventListener "click",()=>
      @setDisplay "create-account-panel","block"
      document.getElementById("login-panel").style.display = "none"
    s2.addEventListener "click",()=>
      document.getElementById("create-account-panel").style.display = "none"
      document.getElementById("login-panel").style.display = "block"
    s3.addEventListener "click",()=>
      document.getElementById("forgot-password-panel").style.display = "none"
      document.getElementById("login-panel").style.display = "block"
    s4.addEventListener "click",()=>
      document.getElementById("forgot-password-panel").style.display = "block"
      document.getElementById("login-panel").style.display = "none"

    document.getElementById("login-window").addEventListener "click",(event)=>
      event.stopPropagation()

    document.getElementById("login-overlay").addEventListener "mousedown",(event)=>
      document.getElementById("login-overlay").style.display = "none"

    document.getElementById("login-window").addEventListener "mousedown",(event)=>
      event.stopPropagation()

    @setAction "login-button",()=>
      @showLoginPanel()

    @setAction "guest-action-login",()=>
      @showLoginPanel()

    @setAction "guest-action-create",()=>
      @showCreateAccountPanel()

    @setAction "create-account-button",()=>
      @showCreateAccountPanel()

    @setAction "create-account-toggle-terms",()=>
      @toggleTerms()

    @setAction "guest-action-guest",()=>
      @app.createGuest()
      document.getElementById("login-overlay").style.display = "none"

    document.querySelector(".username").addEventListener "mouseup",(event)=>
      event.stopPropagation()

    document.querySelector(".username").addEventListener "click",(event)=>
      e = document.querySelector(".usermenu")
      if @app.user.flags.guest or not @app.user.email?
        e.classList.add "guest"
        e.classList.remove "regular"
      else
        e.classList.add "regular"
        e.classList.remove "guest"

      if e.style.height == "0px"
        num = 0
        for c in e.childNodes
          if c.offsetParent?
            num += 1
        e.style.height = "#{42*num}px"
        if ! @usermenuclose
          @usermenuclose = document.body.addEventListener "mouseup",(event)=>
            e.style.height = "0px"
      else
        e.style.height = "0px"

    document.querySelector(".usermenu .logout").addEventListener "click",(event)=>
      @app.disconnect()

    document.querySelector(".usermenu .settings").addEventListener "click",(event)=>
      @setMainSection("usersettings")
      @app.user_settings.setSection("settings")

    document.querySelector(".usermenu .profile").addEventListener "click",(event)=>
      @setMainSection("usersettings")
      @app.user_settings.setSection("profile")

    document.querySelector(".usermenu .progress").addEventListener "click",(event)=>
      @setMainSection("usersettings")
      @app.user_settings.setSection("progress")

    document.querySelector("#header-progress-summary").addEventListener "click",(event)=>
      @setMainSection("usersettings")
      @app.user_settings.setSection("progress")

    document.querySelector(".usermenu .create-account").addEventListener "click",(event)=>
      @showCreateAccountPanel()

    document.querySelector(".usermenu .discard-account").addEventListener "click",(event)=>
      @app.disconnect()

    document.querySelector("#language-setting").addEventListener "mouseup",(event)=>
      event.stopPropagation()

    document.querySelector("#language-setting").addEventListener "click",(event)=>
      e = document.querySelector("#language-menu")
      if not e.classList.contains "language-menu-open"
        e.classList.add "language-menu-open"
        document.querySelector("#language-setting").style.width = "0px"
        if ! @languagemenuclose
          @languagemenuclose = document.body.addEventListener "mouseup",(event)=>
            e.classList.remove "language-menu-open"
            document.querySelector("#language-setting").style.width = "32px"
      else
        e.classList.remove "language-menu-open"
        document.querySelector("#language-setting").style.width = "32px"

    document.querySelector("#language-choice-it").addEventListener "click",(event)=>@setLanguage("it")
    document.querySelector("#language-choice-de").addEventListener "click",(event)=>@setLanguage("de")
    document.querySelector("#language-choice-pl").addEventListener "click",(event)=>@setLanguage("pl")
    document.querySelector("#language-choice-fr").addEventListener "click",(event)=>@setLanguage("fr")
    document.querySelector("#language-choice-en").addEventListener "click",(event)=>@setLanguage("en")

    document.querySelector("#switch-to-it").addEventListener "click",(event)=>
      event.preventDefault()
      @setLanguage("it")

    document.querySelector("#switch-to-de").addEventListener "click",(event)=>
      event.preventDefault()
      @setLanguage("de")

    document.querySelector("#switch-to-pl").addEventListener "click",(event)=>
      event.preventDefault()
      @setLanguage("pl")

    document.querySelector("#switch-to-fr").addEventListener "click",(event)=>
      event.preventDefault()
      @setLanguage("fr")

    document.querySelector("#switch-to-en").addEventListener "click",(event)=>
      event.preventDefault()
      @setLanguage("en")

    @setAction "login-submit",()=>
      @app.login @get("login_nick").value,@get("login_password").value

    @setAction "create-account-submit",()=>
      if not @get("create-account-tos").checked
        return alert(@app.translator.get("You must accept the terms of use in order to create an account."))
      @app.createAccount @get("create_nick").value,@get("create_email").value,@get("create_password").value,@get("create-account-newsletter").checked

    @setAction "forgot-submit",()=>
      @app.sendPasswordRecovery(document.getElementById("forgot_email").value)

  showLoginPanel:()->
    @setDisplay "login-overlay","block"
    @show "login-panel"
    @hide "create-account-panel"
    @hide "forgot-password-panel"
    @hide "guest-panel"

  showCreateAccountPanel:()->
    @setDisplay "login-overlay","block"
    @hide "login-panel"
    @show "create-account-panel"
    @hide "forgot-password-panel"
    @hide "guest-panel"

  userConnected:(nick)->
    return if @nick == nick
    @hide "login-button"
    @hide "create-account-button"
    @nick = nick
    if @app.user.flags.guest or not @app.user.email?
      @get("user-nick").innerHTML = @app.translator.get("Guest")
      document.querySelector(".username i").classList.remove("fa-user")
      document.querySelector(".username i").classList.add("fa-user-clock")
      document.querySelector(".username").classList.add("guest")
    else
      document.querySelector(".username i").classList.add("fa-user")
      document.querySelector(".username i").classList.remove("fa-user-clock")
      document.querySelector(".username").classList.remove("guest")
      @get("user-nick").innerHTML = nick
      if @project?
        @get("project-name").innerHTML = @project.title
        PixelatedImage.setURL @get("project-icon"),location.origin+"/#{@project.owner.nick}/#{@project.slug}/#{@project.code}/icon.png",32

    @get("user-nick").style.display = "inline-block"
    #@show "user-info"
    @show("login-info")
    @hide "login-overlay"

    @updateAllowedSections()
    @setMainSection "projects",location.pathname.length<4 # home page with language variation => record jump to /projects/

    if @app.user.info.size>@app.user.info.max_storage
      text = @app.translator.get "Your account is out of space!"
      text += " "+@app.translator.get("You are using %USED% of the %ALLOWED% you are allowed." ).replace("%USED%",@displayByteSize(@app.user.info.size)).replace("%ALLOWED%",@displayByteSize(@app.user.info.max_storage))
      text += " <a href='https://microstudio.dev/community/tips/your-account-is-out-of-space/109/' target='_blank'>#{@app.translator.get("More info...")}</a>"
      @addWarningMessage text
    #if not @project?
    #  @show "myprojects"
    #  @hide "projectview"
      #@get("menu-projects").style.display = "inline-block"
    #@setMainSection "projects"

  updateAllowedSections:()->
    if @app.user?
      #if @app.user.flags.admin
      @allowed_sections.sounds = true
      @allowed_sections.music = true

      if @app.user.flags.m3d
        document.getElementById("project-option-graphics").style.display = "block"
        @allowed_sections.assets = @app.project? and @app.project.graphics == "M3D"
        if @app.project? and @app.project.graphics == "M3D"
          @app.assets_manager.init()

    for s in @sections
      e = document.getElementById("menuitem-#{s}")
      if e?
        if @allowed_sections[s]
          e.style.display = "block"
        else
          e.style.display = "none"

    return

  userDisconnected:()->
    @get("login-button").style.display = "block"
    @get("user-nick").innerHTML = "nick"
    #@hide "menu-projects"
    @hide "login-info"
    @nick = null
    @project = null
    #@get("user-info").style.display = "none"

  showLoginButton:()->
    @get("login-button").style.display = "block"
    @get("create-account-button").style.display = "block"

  popMenu:()->
    document.querySelector("header").style.transform = "translateY(0%)"

  createProjectBox:(p)->
    element = document.createElement "div"
    element.classList.add "project-box"
    element.id = "project-box-#{p.slug}"

    element.dataset.title = p.title
    element.dataset.description = p.description
    element.dataset.tags = p.tags.join(",")

    buttons = document.createElement "div"
    buttons.classList.add "buttons"
    element.appendChild buttons

    export_href = "/#{p.owner.nick}/#{p.slug}/#{p.code}/export/project/"
    export_button = document.createElement "div"
    export_button.classList.add "export"
    export_button.innerHTML = "<a href='#{export_href}' download='#{p.slug}_files.zip'><i class='fa fa-download'></i> #{@app.translator.get("Export")}</a>"

    buttons.appendChild export_button

    export_button.addEventListener "click",(event)=>
      event.stopPropagation()
      event.stopImmediatePropagation()

    clone_button = document.createElement "div"
    clone_button.classList.add "clone"
    clone_button.innerHTML = "<i class='fa fa-copy'></i> #{@app.translator.get("Clone")}"

    buttons.appendChild clone_button

    clone_button.addEventListener "click",(event)=>
      event.stopPropagation()
      event.stopImmediatePropagation()
      if confirm(@app.translator.get("Do you want to clone this project?"))
        @app.cloneProject p

    delete_button = document.createElement "div"
    delete_button.classList.add "delete"
    if p.owner.nick == @app.nick
      delete_button.innerHTML = "<i class='fa fa-trash-alt'></i> #{@app.translator.get("Delete")}"
    else
      delete_button.innerHTML = "<i class='fa fa-times'></i> #{@app.translator.get("Quit")}"

    buttons.appendChild delete_button

    delete_button.addEventListener "click",(event)=>
      event.stopPropagation()
      event.stopImmediatePropagation()
      if confirm(if p.owner.nick == @app.nick then @app.translator.get("Really delete this project?") else @app.translator.get("Really quit this project?"))
        @app.deleteProject p

    title = document.createElement "div"
    title.classList.add "project-title"
    title.innerText = p.title
    element.appendChild title

    element.appendChild document.createElement "br"

    icon = PixelatedImage.create location.origin+"/#{p.owner.nick}/#{p.slug}/#{p.code}/icon.png",144
    element.appendChild icon

    element.addEventListener "click",()=>
      @app.openProject p

    element

  updateProjects:()->
    list = @get("project-list")
    list.innerHTML = ""
    return if not @app.projects?

    document.querySelector("#projects-search input").value = ""
    @app.projects.sort (a,b)-> b.last_modified-a.last_modified

    pending = []
    count = 0

    for p in @app.projects
      if p.owner.nick == @app.nick or p.accepted
        element = @createProjectBox p
        list.appendChild element
        count++
      else
        pending.push p

    if count == 0
      h2 = document.createElement "h2"
      h2.innerHTML = @app.translator.get("Your projects will be displayed here.")+"<br />"+@app.translator.get("Time to create your first project!")
      list.appendChild h2

    if pending.length>0
      div = document.createElement "div"
      div.classList.add "project-invites-list"

      div.innerHTML = "<h2><i class='fa fa-users'></i> Pending invitations</h2>"

      for p in pending
        e = document.createElement "div"
        e.classList.add "invite"

        e.innerHTML = """
        <div class="buttons">
           <div class="accept" title="Accept" onclick="app.appui.acceptInvite(#{p.id})"><i class="fa fa-check"></i></div><div class="reject" title="Reject" onclick="app.appui.rejectInvite(#{p.id})"><i class="fa fa-times"></i></div>
        </div>
        <img src="/#{p.owner.nick}/#{p.slug}/#{p.code}/icon.png"/> #{p.title} by #{p.owner.nick}
        """

        div.appendChild e



      list.insertBefore div,list.firstChild
      ## create list of projects to accept or reject

    if @logged_callback?
      c = @logged_callback
      @logged_callback = null
      c()
    else
      @app.app_state.projectsFetched()

    return

  acceptInvite:(projectid)->
    for p in @app.projects
      if p.id == projectid and p.owner.nick != @app.nick and not p.accepted
        @app.client.sendRequest
          name: "accept_invite"
          project: projectid
    return

  rejectInvite:(projectid)->
    for p in @app.projects
      if p.id == projectid and p.owner.nick != @app.nick
        @app.client.sendRequest
          name: "remove_project_user"
          user: @app.nick
          project: projectid
    return

  setProject:(@project,useraction=true)->
    @get("project-name").innerHTML = @project.title
    PixelatedImage.setURL @get("project-icon"),location.origin+"/#{@project.owner.nick}/#{@project.slug}/#{@project.code}/icon.png",32
    @setSection "code",useraction
    @show "projectview"
    @hide "myprojects"
    @project.addListener @
    @code_splitbar.setPosition(50)
    @runtime_splitbar.setPosition(50)
    @app.runwindow.terminal.start()
    @updateActiveUsers()
    @updateAllowedSections()

  projectUpdate:(change)->
    if change == "spritelist"
      icon = @project.getSprite "icon"
      if icon?
        icon.addImage @get("project-icon"),32

        img = document.querySelector "#project-box-#{@project.slug} img"
        if img?
          icon.addImage img,144
    else if change == "title"
      @get("project-name").innerHTML = @project.title
    else if change == "locks"
      @updateActiveUsers()

  updateActiveUsers:()->
    element = document.querySelector(".projectheader #active-project-users")
    list = element.childNodes
    names = {}
    for i in [list.length-1..0] by -1
      e = list[i]
      name = e.id.split("-")[2]
      if not @project.friends[name]?
        element.removeChild(e)
      else
        names[name] = true

    for key of @project.friends
      if not names[key]
        div = document.createElement "div"
        div.style = "background:#{@createFriendColor(key)}"
        div.id = "active-user-#{key}"
        i = document.createElement "i"
        i.classList.add "fa"
        i.classList.add "fa-user"
        div.appendChild i
        span = document.createElement "span"
        span.innerText = key
        div.appendChild span
        element.appendChild div

    return

  createFriendColor:(friend)->
    seed = 137
    for i in [0..friend.length-1] by 1
      seed = (seed+friend.charCodeAt(i)*31+97)%360
    return "hsl(#{seed},50%,50%)"

  startSaveStatus:()->
    @savetick = 0
    setInterval (()=>@checkSaveStatus()),500

  checkSaveStatus:()->
    return if not @project?
    e = document.getElementById("save-status")
    switch @save_status
      when "saving"
        if @project.pending_changes.length == 0
          @save_status = "saved"
          e.classList.remove "fa-ellipsis-h"
          e.classList.add "fa-check"
          e.style.color = "hsl(160,50%,70%)"
          e.style.opacity = 1
          e.style.transform = "scale(1.1)"
        else
          @savetick = (@savetick+1)%2
          t = .9+@savetick*.2
          e.style.transform = "scale(#{t})"
      when "saved"
        e.style.opacity = 0
        e.style.transform = "scale(.9)"
        @save_status = ""
      else
        if @project.pending_changes.length > 0
          @save_status = "saving"
          e.classList.add "fa-ellipsis-h"
          e.classList.remove "fa-check"
          e.style.color = "hsl(0,50%,70%)"
          e.style.opacity = 1
          e.style.transform = "scale(1)"

  toggleTerms:()->
    if @terms_shown
      @terms_shown = false
      @get("create-account-terms").style.display = "none"
    else
      @terms_shown = true
      @get("create-account-terms").style.display = "block"
      @app.about.load "terms",(text)=>
        @get("create-account-terms").innerHTML = DOMPurify.sanitize marked text

  showNotification:(text)->
    document.querySelector("#notification-bubble span").innerText = text
    document.getElementById("notification-container").style.transform = "translateY(0px)"
    setTimeout (()=>
      document.getElementById("notification-container").style.transform = "translateY(-150px)"
      ),5000

  setLanguage:(lang)->
    return if document.cookie? and document.cookie.indexOf("language=#{lang}")>=0
    date = new Date()
    date.setTime(date.getTime()+1000*3600*24*60)
    document.cookie = "language=#{lang};expires=#{date.toUTCString()};path=/"

    window.location = location.origin+(if lang != "en" then "/#{lang}/" else "")  #+"?t=#{Date.now()}"

  displayByteSize:(size)->
    if size<1000
      return "#{size} #{@app.translator.get("Bytes")}"
    else if size<10000
      return "#{(size/1000).toFixed(1)} #{@app.translator.get("Kb")}"
    else if size<1000000
      return "#{Math.floor(size/1000)} #{@app.translator.get("Kb")}"
    else if size<10000000
      return "#{(size/1000000).toFixed(1)} #{@app.translator.get("Mb")}"
    else if size<1000000000
      return "#{Math.floor(size/1000000)} #{@app.translator.get("Mb")}"
    else
      return "#{(size/1000000000).toFixed(1)} #{@app.translator.get("Gb")}"

  createUserTag:(nick,tier,pic=false,picmargin)->
    div = document.createElement "a"
    div.classList.add "usertag"
    if tier
      div.classList.add tier

    i = document.createElement "i"
    i.classList.add "fa"
    i.classList.add "fa-user"

    div.appendChild i
    span = document.createElement "span"
    span.innerText = nick
    div.appendChild span

    if tier
      icon = PixelatedImage.create location.origin+"/microstudio/patreon/badges/sprites/#{tier}.png",32
      icon.alt = icon.title = @app.getTierName tier
      div.appendChild icon

    div.href = "/#{nick}/"
    div.target = "_blank"

    div.addEventListener "click",(event)->event.stopPropagation()

    if pic
      pic = document.createElement "img"
      pic.src = "/#{nick}.png"
      pic.classList.add "profile"
      div.appendChild pic

      if picmargin
        div.style["margin-left"] = "#{picmargin}px"

    div

  setImportProgress:(progress)->
    document.getElementById("import-project-button").innerHTML = """<i class="fa fa-upload"></i> Uploading... """
    progress = Math.round(progress)
    document.getElementById("import-project-button").style.background = "linear-gradient(90deg,hsl(200,50%,40%) 0%,hsl(200,50%,40%) #{progress}%,hsl(200,20%,20%) #{progress}%)"

  resetImportButton:()->
    document.getElementById("import-project-button").innerHTML = """<i class="fa fa-upload"></i> #{@app.translator.get("Import Project")}"""
    document.getElementById("import-project-button").style.removeProperty "background"
