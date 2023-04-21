ForumCategory = require __dirname+"/category.js"
ForumPost = require __dirname+"/post.js"
ForumReply = require __dirname+"/reply.js"
Indexer = require __dirname+"/indexer.js"

class @Forum
  constructor:(@content)->
    @db = @content.db
    @server = @content.server

    @languages = {}
    @categories = {}
    @posts = {}
    @replies = {}

    @category_by_slug = {}

    @category_count = 0
    @post_count = 0
    @reply_count = 0
    @indexers = {}
    @load()

  close:()->
    for key,indexer in @indexers
      indexer.stop()
    return

  load:()->
    categories = @db.list("forum_categories")
    for record in categories
      @loadCategory record

    posts = @db.list("forum_posts")
    for record in posts
      @loadPost record

    replies = @db.list("forum_replies")
    for record in replies
      @loadReply record

    @updateActivity()

    return

  index:(language,text,target,uid)->
    return if not language?
    indexer = @indexers[language]
    if not indexer?
      @indexers[language] = indexer = new Indexer()
    indexer.add text,target,uid

  loadCategory:(record)->
    cat = new ForumCategory @,record
    if cat.language? and not cat.deleted
      if not @languages[cat.language]?
        @languages[cat.language] = []
      @languages[cat.language].push cat
      @category_by_slug[cat.slug] = cat
      @categories[cat.id] = cat
      @category_count++

    cat

  loadPost:(record)->
    catid = record.getField "category"
    category = @categories[catid]
    if category?
      post = new ForumPost category,record
      if not post.isDeleted()
        category.addPost(post)
        @posts[post.id] = post
        if not category.hidden
          @post_count++
          @index post.category.language,"#{post.title} #{post.category.name} #{post.author.nick}",post,post.id
          @index post.category.language,post.text,post,post.id

      post

  loadReply:(record)->
    postid = record.getField "post"
    post = @posts[postid]
    if post?
      reply = new ForumReply post,record
      if not reply.isDeleted()
        post.addReply(reply)
        @replies[reply.id] = reply
        if not post.category.hidden
          @reply_count++
          @index reply.post.category.language,reply.text,reply.post,post.id
        reply

  createPost:(category,user,title,text)->
    data =
      author: user
      category: category
      title: title
      text: text
      date: Date.now()
      activity: Date.now()
      edits: 0

    record = @db.create "forum_posts",data
    post = @loadPost record
    if post?
      post.category.updateActivity()
      post.addWatch post.author.id

      try
        for id in post.category.watch
          @sendPostNotification id,post
      catch err
        console.error err
    return post

  createReply:(post,user,text)->
    data =
      post: post.id
      author: user
      text: text
      date: Date.now()
      activity: Date.now()
      edits: 0

    post.updateActivity()

    record = @db.create "forum_replies",data
    reply = @loadReply record
    for id in post.watch
      @sendReplyNotification id,reply
    return reply

  sendPostNotification:(userid,post)->
    user = @content.users[userid]
    return if not user?
    return if not user.email?
    return if not user.flags.validated
    return if user == post.author

    translator = @content.translator.getTranslator(user.language)
    subject = translator.get("%USER% posted in %CATEGORY%").replace("%USER%",post.author.nick).replace("%CATEGORY%",post.category.name)+ " - #{translator.get("microStudio Community")}"
    text = translator.get("%USER% published a new post in %CATEGORY%:").replace("%USER%",post.author.nick).replace("%CATEGORY%",post.category.name)+"\n\n"
    text += post.title+"\n"
    text += "https://microstudio.dev#{post.getPath()}\n\n"
    text += if post.text.length<500 then post.text else post.text.substring(0,500)+" (...)"

    @server.mailer.sendMail user.email,subject,text

  sendReplyNotification:(userid,reply)->
    user = @content.users[userid]
    return if not user?
    return if not user.email?
    return if not user.flags.validated
    return if user == reply.author

    translator = @content.translator.getTranslator(user.language)
    subject = translator.get("%USER% posted a reply").replace("%USER%",reply.author.nick)+ " - #{translator.get("microStudio Community")}"
    text = translator.get("%USER% posted a reply to %POST%:").replace("%USER%",reply.author.nick).replace("%POST%",reply.post.title)+"\n\n"
    text += "https://microstudio.dev#{reply.post.getPath()}#{reply.post.replies.length-1}/\n\n"
    text += if reply.text.length<500 then reply.text else reply.text.substring(0,500)+" (...)"

    @server.mailer.sendMail user.email,subject,text

  createCategory:(language,name,slug,description,hue,permissions)->
    data =
      language: language
      name: name
      slug: slug
      description: description
      hue: hue or 0
      permissions: permissions
      deleted: false
      activity: Date.now()

    record = @db.create "forum_categories",data
    cat = @loadCategory record

  editCategory:(user,category,data)->

  editPost:(user,post,data)->

  editReply:(user,post,reply,data)->

  listCategories:(lang)->
    cats = @languages[lang]
    if cats?
      res = []
      for c in cats
        if not c.deleted and not c.hidden
          res.push c
      res.sort (a,b)-> b.activity - a.activity
      res
    else
      []

  updateActivity:()->
    @activity = 0
    for key,cat of @categories
      @activity = Math.max(@activity,cat.activity)

    @sorted = false


  getLanguages:()->
    lang = []
    for key of @languages
      lang.push key
    lang

  getCategory:(language,slug)->
    lang = @languages[language]
    return null if not lang
    lang[slug]

  escapeHTML:(s)->
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')

module.exports = @Forum
