class @Cleaner
  constructor:(@content)->
    @start()

  start:()->
    @stop()
    @users = Object.keys @content.users
    @index = 0
    @activity_limit = Date.now()-60*24*3600*1000
    @deleted = 0
    @deleted_projects = 0
    @interval = setInterval (()=>@processOne()),1000

  stop:()->
    if @interval?
      clearInterval @interval

  deleteGuest:(user)->
    console.info "Deleting guest user #{user.id} - #{user.nick} last active: "+new Date(user.last_active).toString()
    if user? and user.flags.guest
      user.delete()

  processOne:()->
    while @index < @users.length
      userid = @users[@index++]
      if userid?
        user = @content.users[userid]
        if user? and user.flags.guest
          if user.last_active<@activity_limit
            try
              @deleted += 1
              @deleted_projects += Object.keys(user.projects).length
              @deleteGuest(user)
            catch err
              console.error err
            break

    if @index >= @users.length
      @stop()
      console.info "Deleted guests: "+@deleted
      console.info "Deleted projects: "+@deleted_projects

module.exports = @Cleaner
