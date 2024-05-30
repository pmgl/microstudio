class @Comments
  constructor:(@project,data)->
    @comments = []
    @load(data)

  load:(data)->
    if data? and data.length>0
      for c in data
        user = @project.content.users[c.user]
        if user? and not user.flags.deleted
          @comments.push new Comment @,user,c
    return

  save:()->
    res = []
    for c in @comments
      res.push
        user: c.user.id
        text: c.text
        flags: c.flags
        time: c.time
    @project.set("comments",res,false)

  getAll:()->
    res = []
    for c,i in @comments
      if not c.flags.deleted and not c.user.flags.censored and not c.user.flags.deleted
        res.push
          user: c.user.nick
          user_info:
            tier: c.user.flags.tier
            profile_image: c.user.flags.profile_image
          text: c.text
          id: i
          time: c.time
    return res

  get:(id)->
    @comments[id]

  add:(user,text)->
    @comments.push new Comment @,user,
      text: text
      flags: {}
      time: Date.now()
    @save()

  remove:(comment)->
    if comment?
      comment.text = ""
      comment.flags.deleted = true
      @save()

class Comment
  constructor:(@comments,@user,data)->
    @text = data.text
    @flags = data.flags
    @time = data.time

  edit:(@text)->
    @comments.save()

  remove:()->
    @comments.remove(@)

module.exports = @Comments
