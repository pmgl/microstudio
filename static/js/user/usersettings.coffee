class @UserSettings
  constructor:(@app)->
    document.getElementById("resend-validation-email").addEventListener "click",()=>@resendValidationEMail()
    #document.getElementById("change-password").addEventListener "click",()=>@changePassword()
    document.getElementById("subscribe-newsletter").addEventListener "change",()=>@newsletterChange()

    document.getElementById("usersetting-email").addEventListener "input",()=>@emailChange()

    document.getElementById("open-translation-app").addEventListener "click",()=>@openTranslationApp()
    document.getElementById("translation-app-back-button").addEventListener "click",()=>@closeTranslationApp()

    @nick_validator = new InputValidator document.getElementById("usersetting-nick"),
      document.getElementById("usersetting-nick-button"),
      document.getElementById("usersetting-nick-error"),
      (value)=>
        nick = value[0]
        @app.client.sendRequest {
          name: "change_nick"
          nick: nick
        },(msg)=>
          if msg.name == "error" and msg.value?
            @nick_validator.reset()
            @nick_validator.showError(@app.translator.get(msg.value))
          else
            @nick_validator.set(nick)
            @app.user.nick = nick
            document.getElementById("user-nick").innerText = nick
            @nickUpdated()

    @nick_validator.regex = RegexLib.nick

    @email_validator = new InputValidator document.getElementById("usersetting-email"),
      document.getElementById("usersetting-email-button"),
      document.getElementById("usersetting-email-error"),
      (value)=>
        email = value[0]
        @app.client.sendRequest {
          name: "change_email"
          email: email
        },(msg)=>
          if msg.name == "error" and msg.value?
            @email_validator.reset()
            @email_validator.showError(@app.translator.get(msg.value))
          else
            @email_validator.set(email)
            @app.user.email = email

    @email_validator.regex = RegexLib.email

    @sections = ["settings","profile","progress"]
    @initSections()

    document.getElementById("usersettings-profile").addEventListener "dragover",(event)=>
      event.preventDefault()
      document.querySelector("#usersettings-profile-image .fa-user-circle").classList.add "dragover"
      #console.info event

    document.getElementById("usersettings-profile").addEventListener "dragleave",(event)=>
      event.preventDefault()
      document.querySelector("#usersettings-profile-image .fa-user-circle").classList.remove "dragover"
      #console.info event

    document.getElementById("usersettings-profile").addEventListener "drop",(event)=>
      event.preventDefault()
      document.querySelector("#usersettings-profile-image .fa-user-circle").classList.remove "dragover"
      try
        list = []
        for i in event.dataTransfer.items
          list.push i.getAsFile()

        if list.length>0
          file = list[0]
          @profileImageDropped(file)
      catch err
        console.error err


    document.querySelector("#usersettings-profile-image").addEventListener "click",()=>
      input = document.createElement "input"
      input.type = "file"
      input.addEventListener "change",(event)=>
        files = event.target.files
        if files.length>=1
          f = files[0]
          @profileImageDropped f

      input.click()


    document.querySelector("#usersettings-profile .fa-times-circle").addEventListener "click",()=>
      @removeProfileImage()

    document.getElementById("usersettings-profile-description").addEventListener "input",()=>
      @profileDescriptionChanged()

    if window.ms_standalone
      document.getElementById("usersettings-menu-profile").style.display = "none"

  initSections:()->
    for s in @sections
      do (s)=>
        document.getElementById("usersettings-menu-#{s}").addEventListener "click",()=>
          switch s
            when "settings" then @app.openUserSettings()
            when "profile" then @app.openUserProfile()
            when "progress" then @app.openUserProgress()


  setSection:(section)->
    @current = section
    for s in @sections
      if s == section
        document.getElementById("usersettings-menu-#{s}").classList.add "selected"
        document.getElementById("usersettings-#{s}").style.display = "block"
      else
        document.getElementById("usersettings-menu-#{s}").classList.remove "selected"
        document.getElementById("usersettings-#{s}").style.display = "none"

    if @current == "progress"
      @app.user_progress.updateStatsPage()
    return

  update:()->
    document.getElementById("subscribe-newsletter").checked = @app.user.flags["newsletter"] == true
    if @app.user.flags["validated"] == true
      document.getElementById("email-not-validated").style.display = "none"
    else
      document.getElementById("email-not-validated").style.display = "block"

    @nick_validator.set(@app.user.nick)
    @email_validator.set(@app.user.email)

    translator = false
    for key,value of @app.user.flags
      if key.startsWith("translator_") and value
        translator = true

    document.getElementById("open-translation-app").style.display = if translator then "inline-block" else "none"
    @nickUpdated()

    account_type = "Standard"
    if @app.user.flags.guest
      account_type = @app.translator.get "Guest"
    else
      account_type = @app.getTierName @app.user.flags.tier

    if @app.user.flags.tier
      icon = PixelatedImage.create location.origin+"/microstudio/patreon/badges/sprites/#{@app.user.flags.tier}.png",32
      icon.style = "vertical-align: middle ; margin-right: 5px"
      div = document.getElementById("usersettings-account-type")
      div.innerHTML = ""
      div.appendChild icon
      span = document.createElement "span"
      span.innerText = account_type
      div.appendChild span
    else
      document.getElementById("usersettings-account-type").innerText = account_type

    @updateStorage()

    @updateProfileImage()

    document.getElementById("usersettings-profile-description").value = @app.user.info.description

  updateStorage:()->
    percent = Math.floor(@app.user.info.size/@app.user.info.max_storage*100)
    str = @app.translator.get "[STORAGE] used of [MAX_STORAGE] ([PERCENT] %)"
    str = str.replace("[STORAGE]",@app.appui.displayByteSize(@app.user.info.size))
    str = str.replace("[MAX_STORAGE]",@app.appui.displayByteSize(@app.user.info.max_storage))
    str = str.replace("[PERCENT]",percent)

    document.getElementById("usersettings-storage").innerText = str

  nickUpdated:()->
    document.getElementById("user-public-page").href = location.origin.replace(".dev",".io")+"/#{@app.user.nick}/"
    document.getElementById("user-public-page").innerHTML = location.host.replace(".dev",".io")+"/#{@app.user.nick} <i class='fa fa-external-link-alt'></i>"

  resendValidationEMail:()->
    @app.client.sendRequest {
      name: "send_validation_mail"
    },(msg)->
      document.getElementById("resend-validation-email").style.display = "none"
      document.getElementById("validation-email-resent").style.display = "block"

  changePassword:()->

  newsletterChange:()->
    checked = document.getElementById("subscribe-newsletter").checked
    @app.user.flags.newsletter = checked
    @app.client.sendRequest
      name: "change_newsletter"
      newsletter: checked

  nickChange:()->

  emailChange:()->

  openTranslationApp:()->
    document.getElementById("usersettings").style.display = "none"
    document.getElementById("translation-app").style.display = "block"

    if @translation_app?
      @translation_app.update()
    else
      @translation_app = new TranslationApp(@app)

  closeTranslationApp:()->
    document.getElementById("usersettings").style.display = "block"
    document.getElementById("translation-app").style.display = "none"

  profileImageDropped:(file)->
    reader = new FileReader()
    img = new Image
    reader.addEventListener "load",()=>
      img.src = reader.result

    reader.readAsDataURL(file)
    #url = "data:application/javascript;base64,"+btoa(Audio.processor)

    img.onload = ()=>
      if img.complete and img.width>0 and img.height>0
        canvas = document.createElement "canvas"
        canvas.width = 128
        canvas.height = 128
        context = canvas.getContext "2d"
        if img.width<128 and img.height<128
          context.imageSmoothingEnabled = false
        w = img.width
        h = img.height
        r = Math.max(128/w,128/h)
        w *= r
        h *= r
        context.drawImage img,64-w/2,64-h/2,w,h
        document.querySelector("#usersettings-profile-image img").src = canvas.toDataURL()
        document.querySelector("#usersettings-profile-image img").style.display = "block"
        @app.client.sendRequest {
          name: "set_user_profile"
          image: canvas.toDataURL().split(",")[1]
        },()=>
          @app.user.flags.profile_image = true
          @updateProfileImage()

  removeProfileImage:()->
    @app.client.sendRequest {
      name: "set_user_profile"
      image: 0
    },(msg)=>
      @app.user.flags.profile_image = false
      document.querySelector("#usersettings-profile-image img").style.display = "none"
      document.querySelector("#usersettings-profile-image img").src = ""
      @updateProfileImage()

  profileDescriptionChanged:()->
    if @description_timeout?
      clearTimeout @description_timeout

    @description_timeout = setTimeout (()=>@saveProfileDescription()),2000

  saveProfileDescription:()->
    @app.client.sendRequest {
      name: "set_user_profile"
      description: document.getElementById("usersettings-profile-description").value
    },(msg)=>

  updateProfileImage:()->
    if @app.user.flags.profile_image
      document.querySelector("#login-info img").style.display = "inline-block"
      document.querySelector("#login-info img").src = "/#{@app.user.nick}.png?v=#{Date.now()}"
      document.querySelector("#login-info i").style.display = "none"
      document.querySelector("#usersettings-profile-image img").src = "/#{@app.user.nick}.png?v=#{Date.now()}"
      document.querySelector("#usersettings-profile-image img").style.display = "block"
      document.querySelector("#usersettings-profile-image .fa-times-circle").style.display = "block"
    else
      document.querySelector("#login-info img").style.display = "none"
      document.querySelector("#login-info i").style.display = "inline-block"
      document.querySelector("#usersettings-profile-image .fa-times-circle").style.display = "none"
