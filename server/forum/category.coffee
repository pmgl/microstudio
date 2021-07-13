class @ForumCategory
  constructor:(@forum,@record)->
    data = @record.get()

    @id = data.id
    @language = data.language
    @name = data.name
    @slug = data.slug
    @description = data.description
    @hue = data.hue or 0
    @activity = data.activity
    @deleted = data.deleted
    @hidden = data.hidden or false
    @watch = data.watch or []

    @permissions = data.permissions or {
      post: "user"
      reply: "user"
    }

    @options = data.options or {
      post_progress: false
      post_close: false
      post_sortorder: false
    }

    @posts = []

    @path = if @language == "en" then "/community/#{@slug}/" else "/#{@language}/community/#{@slug}/"

  set:(prop,value)->
    data = @record.get()
    data[prop] = value
    @record.set(data)
    @[prop] = value

  addPost:(post)->
    @posts.push post
    @sorted = false

  removePost:(post)->
    index = @posts.indexOf(post)
    if index>=0
      @posts.splice(index,1)
      @sorted = false

  updateActivity:()->
    @set "activity",Date.now()
    @updateSort()
    @forum.updateActivity()

  updateSort:()->
    @sorted = false

  getSortedPosts:()->
    if not @sorted
      @posts.sort (a,b)-> b.activity-a.activity

    @posts

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

module.exports = @ForumCategory
