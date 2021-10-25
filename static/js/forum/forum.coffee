class @Forum
  constructor:()->
    @client = new Client @
    @client.start()
    @translator = new Translator @

    @setTimeInfo()
    @setOtherInfo()
    @addLinks()
    @updateUserCapabilities()

    @plug "create-post-button",()=> document.getElementById("edit-post").style.display = "block"
    @plug "create-post-button",()=> document.getElementById("edit-post").style.display = "block"
    @plug "edit-post-cancel",()=>
      if document.getElementById("edit-post")
        document.getElementById("edit-post").style.display = "none"

      if @current_edit
        @cancelCurrentEdit()

    @plug "edit-post-preview",()=> @togglePreview()
    @plug "edit-post-post",()=> @sendPost()

    setInterval (()=>@setTimeInfo()),30000
    @update()

    p = location.pathname.split("/")
    if p[1] != "community"
      p.splice(1,0)

    if p.length >= 6
      reply = p[5]
      e = document.getElementById "post-reply-#{reply}"
      if e?
        e.scrollIntoView()
    console.info p

    if window.post?
      document.getElementById("edit-post-cancel").style.display = "none"

    e = document.getElementById("edit-post-progress")
    if e?
      e.addEventListener "input",()=>
        @updateProgressLabel()

    document.querySelector("header .username").addEventListener "click",()=>
      @login()

    document.querySelector(".theme").addEventListener "click",()=>
      @toggleTheme()

    if document.querySelector("#searchbar input")?
      document.querySelector("#searchbar input").addEventListener "input",()=>
        @send_search = Date.now()+1000

      document.querySelector("#searchbar i").addEventListener "click",()=>
        if document.querySelector("#searchbar input").value.trim() != ""
          document.querySelector("#searchbar input").value = ""
          @send_search = Date.now()

    setInterval (()=>@checkSendSearch()),500

    @sort_modes = ["activity","likes","views","replies","created","relevance"]
    @current_sort = 0
    @sort_functions =
      activity: (a,b)->b.dataset.postActivity-a.dataset.postActivity
      likes: (a,b)->b.dataset.postLikes-a.dataset.postLikes
      views: (a,b)->b.dataset.postViews-a.dataset.postViews
      replies: (a,b)->b.dataset.postReplies-a.dataset.postReplies
      created: (a,b)->b.dataset.postCreated-a.dataset.postCreated
      relevance: (a,b)->b.dataset.score-a.dataset.score

    if document.querySelector("#sorting")?
      document.querySelector("#sorting").addEventListener "click",()=>
        @rotateSort()

    @checkEmbedded()

  rotateSort:()->
    @current_sort = (@current_sort+1)%@sort_modes.length
    if @current_sort == @sort_modes.length-1 and document.querySelector("#searchbar input").value == ""
      @current_sort = 0
    @applySort()

  applySort:()->
    sort = @sort_modes[@current_sort]
    document.querySelector("#sorting span").innerText = @translator.get(sort.substring(0,1).toUpperCase()+sort.substring(1,sort.length))
    list = document.querySelectorAll('[data-post-id]')
    tab = {}
    res = []
    if list?
      for e in list
        res.push e

      res.sort(@sort_functions[sort])
      for e in res
        document.querySelector(".posts").appendChild e

    return

  checkSendSearch:()->
    if @send_search and Date.now()>@send_search
      @send_search = null
      if document.querySelector("#searchbar input").value.trim() != ""
        @search document.querySelector("#searchbar input").value,(results)=>
          console.info results
          list = document.querySelectorAll('[data-post-id]')
          tab = {}
          if list?
            for e in list
              e.style.display = "none"
              tab[e.dataset.postId] = e
              e.dataset.score = 0

          for res in results
            e = tab[res.id]
            if e?
              e.dataset.score = res.score
              e.style.display = "block"

          @current_sort = @sort_modes.length-1
          @applySort()
          document.querySelector("#searchbar i").classList.add "fa-times"
          document.querySelector("#searchbar i").classList.remove "fa-search"
      else
        list = document.querySelectorAll('[data-post-id]')
        if list?
          for e in list
            e.style.display = "block"
        @current_sort = 0
        @applySort()
        document.querySelector("#searchbar i").classList.remove "fa-times"
        document.querySelector("#searchbar i").classList.add "fa-search"

  login:()->
    if @user
      location.href = "/"
    else
      location.href = "/login/"

  plug:(id,click)->
    element = document.getElementById(id)
    if element?
      element.addEventListener "click",click


  toggleTheme:()->
    if document.body.classList.contains("dark")
      theme = "light"
    else
      theme = "dark"

    document.cookie = "theme=#{theme};expires=#{new Date(Date.now()+3600000*24*365).toUTCString()};path=/"
    location.reload()

  setTimeInfo:()->
    list = document.querySelectorAll('[data-activity]')
    if list?
      for e in list
        date = new Date(parseInt(e.dataset.activity))
        e.title = "#{@translator.get("Last activity:")} #{date.toLocaleString()}"
        dt = Date.now()-e.dataset.activity
        dt /= 60000
        if dt<1
          e.innerText = @translator.get "now"
        else if dt<60
          e.innerText = @translator.get("%MINUTES%m").replace("%MINUTES%",Math.floor(dt))
        else
          dt /= 60
          if dt<24
            e.innerText = @translator.get("%HOURS%h").replace("%HOURS%",Math.floor(dt))
          else
            dt /= 24
            if dt<365
              e.innerText = @translator.get("%DAYS%d").replace("%DAYS%",Math.floor(dt))
            else
              dt /= 365
              e.innerText = @translator.get("%YEARS%y").replace("%YEARS%",Math.floor(dt))

  setOtherInfo:()->
    list = document.querySelectorAll('[data-views]')
    if list?
      for e in list
        e.title = "#{@translator.get("Views:")} #{e.dataset.views}"

    list = document.querySelectorAll('[data-replies]')
    if list?
      for e in list
        e.title = "#{@translator.get("Replies:")} #{e.dataset.replies}"

    return

  getHue:(tag)->
    hue = 0
    for i in [0..tag.length-1] by 1
      hue += tag.charCodeAt(i)*10

    hue%360

  addEditBars:()->
    list = document.querySelectorAll('[data-author]')
    if list?
      for e in list
        if e.dataset.author == @user.nick or @user.flags.admin
          @createEditBar(e)

    return

  createEditBar:(e)->
    div = document.createElement "div"
    div.classList.add "edit-bar"

    edit = document.createElement "div"
    edit.classList.add "edit"
    edit.innerHTML = """<i class="fas fa-pencil-alt"></i> #{@translator.get "Edit"}"""
    div.appendChild edit

    del = document.createElement "div"
    del.classList.add "delete"
    del.innerHTML = """<i class="fa fa-times"></i> #{@translator.get "Delete"}"""
    div.appendChild del

    e.parentNode.insertBefore div,e

    edit.addEventListener "click",()=>
      if e.dataset.type == "post"
        @client.sendRequest {
          name: "get_raw_post"
          post: window.post.id
        },(msg)=>
          if msg.text?
            @editPostOrReply e,msg.text,div,msg.progress,msg.status
      else
        @client.sendRequest {
          name: "get_raw_reply"
          reply: e.parentNode.dataset.replyId
        },(msg)=>
          if msg.text?
            @editPostOrReply e,msg.text,div

    del.addEventListener "click",()=>
      if e.dataset.type == "post"
        if confirm(@translator.get "Do you really want to delete this whole post?")
          @editPost {
            deleted: true
          },()=>
            url = location.origin
            if community.language != "en"
              url += "/#{community.language}"
            url += "/community/#{community.category}/"
            window.location.href = url
      else
        if confirm(@translator.get "Do you really want to delete your reply?")
          id = e.parentNode.dataset.replyId
          index = e.parentNode.id.split("-")[2]
          @editReply id,{
            deleted: true
          },()=>
            url = location.origin
            if community.language != "en"
              url += "/#{community.language}"
            url += "/community/#{community.category}/#{post.slug}/#{post.id}/"
            window.location.href = url

  editPostOrReply:(element,text,edit_bar,progress,status)->
    @cancelCurrentEdit()
    document.getElementById("edit-post-text").value = text
    element.style.display = "none"
    div = document.getElementById "edit-post-content"
    element.parentNode.insertBefore div,element
    edit_bar.style.display = "none"

    @current_edit =
      element: element
      edit_bar: edit_bar
      text: text
      progress: progress
      status: status or ""

    div.parentNode.scrollIntoView()
    if element.dataset.type == "post"
      document.querySelector("#edit-post-content h2").innerText = @translator.get "Editing post"
      if @user.flags.admin
        document.getElementById("edit-post-reserved").style.display = "block"
        document.getElementById("edit-post-progress").value = progress
        document.getElementById("edit-post-status").value = status or ""
        @updateProgressLabel()
    else
      document.querySelector("#edit-post-content h2").innerText = @translator.get "Editing reply"

    document.getElementById("edit-post-cancel").style.display = "inline-block"

  cancelCurrentEdit:()->
    if @current_edit
      document.querySelector(".post-container").appendChild(document.getElementById "edit-post-content")
      document.getElementById("edit-post-text").value = ""
      @current_edit.element.style.display = "block"
      @current_edit.edit_bar.style.display = "block"
      @current_edit = null
      document.querySelector("#edit-post-content h2").innerText = @translator.get "Post Reply"
      document.getElementById("edit-post-cancel").style.display = "none"
      document.getElementById("edit-post-reserved").style.display = "none"

  update:()->
    list = document.querySelectorAll('[data-progress]')
    if list?
      for e in list
        progress = e.dataset.progress
        e.style.background = "linear-gradient(90deg, hsl(190,80%,40%) 0%, hsl(190,80%,40%) #{progress}%,hsl(190,10%,70%) #{progress}%)"

    list = document.querySelectorAll('[data-colorize]')
    if list?
      for e in list
        hue = @getHue(e.dataset.colorize)
        e.style.background = "hsl(#{hue},40%,50%)"

  filterPerms:()->
    if not @user.flags.admin
      list = document.querySelectorAll('[data-perm]')
      if list?
        for e in list
          if e.dataset.perm == "admin"
            e.disabled = true
            e.selected = false

  addLinks:()->
    list = document.querySelectorAll('[data-link]')
    if list?
      for e in list
        do (e)->
          e.addEventListener "click",()->
            link = e.dataset.link
            navigator.clipboard.writeText link
            e.classList.remove "fa-link"
            e.classList.add "fa-check"
            setTimeout (()->
              e.classList.remove "fa-check"
              e.classList.add "fa-link"
            ),5000

    return

  userConnected:(nick)->
    if @user.flags.admin
      console.info "admin"

    @filterPerms()
    @updateUserCapabilities()
    @createLikeButtons()
    @createWatchButton()

    if not @edit_bars_added
      @edit_bars_added = true
      @addEditBars()


  updateUserCapabilities:()->
    if not @user?
      document.querySelector("#edit-post-content").style.display = "none"
      setTimeout (()=>
        if not @user?
          document.querySelector("header .username i").classList.remove "fa-user"
          document.querySelector("header .username i").classList.add "fa-sign-in-alt"
          document.querySelector("header .username").style.display = "block"
        ),2000
      e = document.querySelector("#create-post-button")
      if e? then e.style.display = "none"
    else
      canpost = @user.flags.validated
      canreply = @user.flags.validated

      if not @user.flags.validated
        document.querySelector("#validate-your-email").style.display = "block"

      if community.permissions? and community.permissions.post != "user" and not @user.flags.admin
        canpost = false

      document.querySelector("header .username").style.display = "block"
      document.querySelector("header .username span").innerText = @user.nick
      if @user.flags.profile_image
        document.querySelector("header .username img").style.display = "inline-block"
        document.querySelector("header .username i").style.display = "none"
        document.querySelector("header .username img").src = "/#{@user.nick}.png"
      if canpost
        document.querySelector("#edit-post-content").style.display = "block"
        e = document.querySelector("#create-post-button")
        if e? then e.style.display = "block"
      else
        document.querySelector("#edit-post-content").style.display = "none"
        e = document.querySelector("#create-post-button")
        if e? then e.style.display = "none"

      if post? and (post.permissions.reply == "admin" or post.post_permissions.reply == "admin") and not @user.flags.admin
        document.querySelector("#edit-post-content").style.display = "none"

  serverMessage:(msg)->
    console.info msg

  updateProgressLabel:()->
    document.getElementById("edit-post-progress-label").innerText = document.getElementById("edit-post-progress").value+" %"

  sendPost:()->
    if @last_posted? and Date.now()<@last_posted+5000
      #console.info "wait"
      return
    @last_posted = Date.now()
    document.getElementById("edit-post-post").style.background = "rgba(128,128,128,.2)"
    setTimeout (()=> document.getElementById("edit-post-post").style.background = ""),5000

    if window.post?
      if @current_edit?
        if @current_edit.element.dataset.type == "post"
          text = document.getElementById("edit-post-text").value
          progress = document.getElementById("edit-post-progress").value
          status = document.getElementById("edit-post-status").value
          if text == @current_edit.text and progress == @current_edit.progress and status == @current_edit.status
            return @cancelCurrentEdit()

          data =
            text: if text != @current_edit.text then text else undefined
            progress: if progress != @current_edit.progress then progress else undefined
            status: if status != @current_edit.status then status else undefined

          @editPost data,()=>
            url = location.origin
            if community.language != "en"
              url += "/#{community.language}"
            url += "/community/#{community.category}/#{post.slug}/#{post.id}/"
            window.location.href = url
        else
          text = document.getElementById("edit-post-text").value
          id = @current_edit.element.parentNode.dataset.replyId
          index = @current_edit.element.parentNode.id.split("-")[2]
          @editReply id,{
            text: text
          },()=>
            url = location.origin
            if community.language != "en"
              url += "/#{community.language}"
            url += "/community/#{community.category}/#{post.slug}/#{post.id}/#{index}/"
            window.location.href = url
      else
        text = document.getElementById("edit-post-text").value
        @createReply text,(index)=>
          url = location.origin
          if community.language != "en"
            url += "/#{community.language}"
          url += "/community/#{community.category}/#{post.slug}/#{post.id}/#{index}/"
          window.location.href = url
    else
      category = document.getElementById("edit-post-category").value
      title = document.getElementById("edit-post-title").value
      text = document.getElementById("edit-post-text").value
      @createPost title,text,category,()=>
        url = location.origin
        if community.language != "en"
          url += "/#{community.language}"
        url += "/community/#{category}/"
        window.location.href = url


  createCategory:(title,slug,description,hue)->
    @client.sendRequest {
      name: "create_forum_category"
      language: community.language
      title: title
      slug: slug
      description: description
      hue: hue
    },(msg)->
      console.info msg

  createPost:(title,text,category,callback)->
    @client.sendRequest {
      name: "create_forum_post"
      category: category
      title: title
      text: text
    },(msg)->
      console.info msg
      callback() if callback?

  createReply:(text,callback)->
    @client.sendRequest {
      name: "create_forum_reply"
      post: window.post.id
      text: text
    },(msg)->
      console.info msg
      callback(msg.index) if callback?

  editCategory:(fields)->
    fields.category = community.category
    fields.name = "edit_forum_category"
    @client.sendRequest fields,(msg)->
      console.info msg

  editPost:(fields,callback)->
    fields.post = window.post.id
    fields.name = "edit_forum_post"
    @client.sendRequest fields,(msg)->
      console.info msg
      callback() if callback?

  editReply:(reply,fields,callback)->
    fields.reply = reply
    fields.name = "edit_forum_reply"
    @client.sendRequest fields,(msg)->
      console.info msg
      callback() if callback?

  checkEmbedded:()->
    list = document.querySelectorAll("p")
    if list
      for e in list
        t = e.innerText.split(" ")
        if t[0] == ":embed" and t[1]? and t[1].startsWith("https://microstudio.io/")
          iframe = document.createElement "iframe"
          iframe.src = t[1]
          e.innerHTML = ""
          e.appendChild iframe

  togglePreview:()->
    if not @preview
      @preview = true
      document.getElementById("edit-post-preview-area").style.display = "block"
      document.getElementById("edit-post-text").style.display = "none"
      document.getElementById("edit-post-preview-area").innerHTML = marked document.getElementById("edit-post-text").value
      document.querySelector("#edit-post-preview i").classList.add "fa-keyboard"
      document.querySelector("#edit-post-preview i").classList.remove "fa-eye"
      document.querySelector("#edit-post-preview span").innerText = @translator.get "Write"
      @checkEmbedded()
    else
      @preview = false
      document.getElementById("edit-post-preview-area").style.display = "none"
      document.getElementById("edit-post-text").style.display = "block"
      document.querySelector("#edit-post-preview i").classList.remove "fa-keyboard"
      document.querySelector("#edit-post-preview i").classList.add "fa-eye"
      document.querySelector("#edit-post-preview span").innerText = @translator.get "Preview"


  setWatchButton:(watch,text,callback)->
    wdiv = document.querySelector ".watch"
    wtext = document.querySelector ".watch .text"
    wbutton = document.querySelector ".watch .button"

    if text?
      wtext.style.display = "block"
      wtext.innerText = text
      if @watch_text_timeout?
        clearTimeout @watch_text_timeout
      @watch_text_timeout = setTimeout (()=>wtext.style.display = "none"),10000
    else
      wtext.style.display = "none"

    if watch
      wbutton.innerHTML = "<i class='fas fa-minus-circle'></i> "+@translator.get "Unwatch"
      wbutton.classList.add "unwatch"
    else
      wbutton.innerHTML = "<i class='fas fa-envelope'></i> "+@translator.get "Watch"
      wbutton.classList.remove "unwatch"

    if callback?
      wbutton.addEventListener "click",callback

    wdiv.style.display = "block"

  createWatchButton:()->
    if @user? and @user.flags.validated
      if window.post?
        @client.sendRequest {
          name: "get_post_watch"
          post: window.post.id
        },(msg)=>
          @setWatchButton msg.watch,null,()=>
            @client.sendRequest {
              name: "set_post_watch"
              post: window.post.id
              watch: not msg.watch
            },(m)=>
              msg.watch = not msg.watch
              t = if msg.watch then @translator.get("You will receive e-mail notifications when new replies to this post are published.") else @translator.get("You will no longer receive notifications.")
              @setWatchButton msg.watch,t

      else if community.category != "all"
        @client.sendRequest {
          name: "get_category_watch"
          category: community.category
        },(msg)=>
          @setWatchButton msg.watch,null,()=>
            @client.sendRequest {
              name: "set_category_watch"
              category: community.category
              watch: not msg.watch
            },(m)=>
              msg.watch = not msg.watch
              t = if msg.watch then @translator.get("You will receive e-mail notifications when new posts are published in this category.") else @translator.get("You will no longer receive notifications.")
              @setWatchButton msg.watch,t

  createLikeButtons:()->
    if @user?
      if window.post?
        @client.sendRequest {
          name: "get_my_likes"
          post: window.post.id
        },(msg)=>
          p = document.querySelector "[data-likes-post]"
          @createPostLikeButton p,msg.data.post
          list = document.querySelectorAll('[data-likes-reply]')
          if list?
            for r in list
              id = r.dataset.likesReply|0
              @createReplyLikeButton r,msg.data.replies.indexOf(id)>=0
          console.info msg

      else if community.category != "all"
        @client.sendRequest {
          name: "get_my_likes"
          category: community.category
        },(msg)=>
          list = document.querySelectorAll('[data-likes-post]')
          if list?
            for p in list
              id = p.dataset.likesPost|0
              @createPostLikeButton p,msg.data.indexOf(id)>=0
          console.info msg
      else
        @client.sendRequest {
          name: "get_my_likes"
          language: community.language
        },(msg)=>
          list = document.querySelectorAll('[data-likes-post]')
          if list?
            for p in list
              id = p.dataset.likesPost|0
              @createPostLikeButton p,msg.data.indexOf(id)>=0
          console.info msg

      list = document.querySelectorAll('.post-likes')
      #if list?
      #  for like in list
      #    @createLikeButton(like)

      return

  createPostLikeButton:(element,liked)->
    element.style.cursor = "pointer"
    element.addEventListener "click",()=>
      @client.sendRequest {
        name: "set_post_like"
        post: element.dataset.likesPost
        like: not liked
      },(msg)=>
        element.querySelector("span").innerText = msg.likes
        liked = not liked
        if liked
          element.classList.add "self"
        else
          element.classList.remove "self"
    if liked
      element.classList.add "self"


  createReplyLikeButton:(element,liked)->
    element.style.cursor = "pointer"
    element.addEventListener "click",()=>
      @client.sendRequest {
        name: "set_reply_like"
        reply: element.dataset.likesReply
        like: not liked
      },(msg)=>
        element.querySelector("span").innerText = msg.likes
        liked = not liked
        if liked
          element.classList.add "self"
        else
          element.classList.remove "self"

    if liked
      element.classList.add "self"

  search:(string,callback)->
    words = string.toLowerCase().match(/\b(\w+)\b/g)
    if words?
      for w in words
        if w.length>=2 and w.charAt(w.length-1) != "s"
          string += " #{w}s"
        else if w.length>=3 and w.charAt(w.length-1) == "s"
          string += " #{w.substring(0,w.length-1)}"

      console.info "search string: #{string}"
    @client.sendRequest {
      name: "search_forum"
      language: community.language
      string: string
    },(msg)=>
      if callback?
        callback(msg.results)
      else
        console.info msg

window.addEventListener "load",()=>
  window.forum = new @Forum

if navigator.serviceWorker? and not window.skip_service_worker
  path = location.pathname.split("/")
  if path[2] == "community"
    sw = "/#{path[1]}/community/forum_sw.js"
    path = "/#{path[1]}/community/"
  else
    sw = '/community/forum_sw.js'
    path = "/community/"

  navigator.serviceWorker.register(sw, { scope: location.origin+path }).then((reg)->
    console.log('Registration succeeded. Scope is' + reg.scope)
  ).catch (error)->
    console.log('Registration failed with' + error)
