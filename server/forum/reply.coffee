`const { marked } = require("marked")`
sanitizeHTML = require "sanitize-html"
allowedTags = sanitizeHTML.defaults.allowedTags.concat ["img"]

class @ForumReply
  constructor:(@post,@record)->
    data = @record.get()

    @id = data.id
    @author = @post.category.forum.content.users[data.author]

    @text = data.text
    @date = data.date
    @edits = data.edits or 0
    @activity = data.activity
    @media = data.media

    @deleted = data.deleted
    @likes = data.likes or []
    @pinned = data.pinned

  isDeleted:()->
    @deleted or not @author? or @author.flags.deleted

  set:(prop,value)->
    data = @record.get()
    data[prop] = value
    @record.set(data)
    @[prop] = value

  edit:(text)->
    @set "text",text
    @set "edits",@edits+1
    @set "activity",Date.now()

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

  updateActivity:()->
    @set "activity",Date.now()
    @post.updateActivity()

  getHTMLText:()->
    sanitizeHTML marked(@text),{allowedTags:allowedTags}

module.exports = @ForumReply
