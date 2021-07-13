marked = require "marked"
sanitizeHTML = require "sanitize-html"
allowedTags = sanitizeHTML.defaults.allowedTags.concat ["img"]

class @ForumPost
  constructor:(@category,@record)->
    data = @record.get()

    @id = data.id
    @author = @category.forum.content.users[data.author]

    @title = data.title
    @text = data.text
    @media = data.media
    @date = data.date
    @activity = data.activity
    @edits = data.edits

    @views = data.views or 0
    @progress = data.progress or 0
    @status = data.status
    @deleted = data.deleted
    @likes = data.likes or []
    @watch = data.watch or []
    @users_watching = []
    # @reactions = data.reactions or []
    @pinned = data.pinned

    @replies = []

    @slug = @slugify @title
    @people = []

    @permissions = data.permissions or {
      reply: "user"
    }

    @reverse = data.reverse

  addReply:(reply)->
    @replies.push reply
    if not reply.deleted
      @addPeople reply.author

  addPeople:(author)->
    @sort_people = true
    for p in @people
      if p.author == author
        p.replies += 1
        return
    @people.push
      author: author
      replies: 1

  getPeople:()->
    if @sort_people
      @sort_people = false
      @people.sort (a,b)->a.replies-b.replies

    @people

  set:(prop,value)->
    data = @record.get()
    data[prop] = value
    @record.set(data)
    @[prop] = value

  setCategoryId:(id)->
    data = @record.get()
    data["category"] = id
    @record.set(data)

  edit:(text)->
    @set "text",text
    @set "edits",@edits+1
    @updateActivity()

  setTitle:(title)->
    @set "title",title
    @slug = @slugify @title

  addLike:(id)->
    index = @likes.indexOf(id)
    if index<0
      @likes.push id
      @set "likes",@likes
    return @likes.length

  removeLike:(id)->
    index = @likes.indexOf(id)
    if index>=0
      @likes.splice index,1
      @set "likes",@likes
    return @likes.length

  isLiked:(id)->
    @likes.indexOf(id)>=0

  addWatch:(id)->
    index = @watch.indexOf(id)
    if index<0
      @watch.push id
      @set "watch",@watch

  removeWatch:(id)->
    index = @watch.indexOf(id)
    if index>=0
      @watch.splice index,1
      @set "watch",@watch

  isWatching:(id)->
    @watch.indexOf(id)>=0

  view:(ip)->
    return if not ip?

    if not @views_buffer? or Date.now()>@views_buffer_expiration
      @views_buffer_expiration = Date.now()+2*60*60*1000 # one view per 2 hours per ip
      @views_buffer = {}

    return if @views_buffer[ip]

    @views_buffer[ip] = true
    @set "views",@views+1

  updateActivity:()->
    @set "activity",Date.now()
    @category.updateActivity()

  getPath:()->
    path = "/"
    if @category.language != "en"
      path += "#{@category.language}/"
    path += "community/#{@category.slug}/"
    path += "#{@slug}/#{@id}/"

  slugify:(text)->
    res = text.normalize('NFD').replace(/[\s]/g, "-").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase()
    res = "_" if res.length == 0
    res

  getHTMLText:()->
    sanitizeHTML marked(@text),{allowedTags:allowedTags}

module.exports = @ForumPost
