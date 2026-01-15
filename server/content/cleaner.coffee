class @Cleaner
  constructor:(@content)->
    @start()

  start:()->
    @stop()
    @users = Object.keys @content.users
    @index = 0
    @guest_limit = Date.now() - 60*24*3600*1000
    @user_limit = Date.now() - 545*24*3600*1000
    @deleted = 0
    @deleted_projects = 0
    @deleted_users = 0
    @interval = setInterval (()=>@processOne()),1000

    console.info "USER LIMIT: " + @user_limit

  stop:()->
    if @interval?
      clearInterval @interval

  deleteGuest:(user)->
    if user? and user.flags.guest
      console.info "Deleting guest user #{user.id} - #{user.nick} last active: "+new Date(user.last_active).toString()
      user.delete()

  deleteUser:(user)->
    if user? and not user.flags.validated and user.last_active < @user_limit
      console.info "Deleting inactive, unvalidated user #{user.id} - #{user.nick} last active: "+new Date(user.last_active).toString()
      user.delete()

  processOne:()->
    while @index < @users.length
      userid = @users[@index++]
      if userid?
        user = @content.users[userid]
        if user? and user.flags.guest
          if user.last_active<@guest_limit
            try
              @deleted += 1
              @deleted_projects += Object.keys(user.projects).length
              @deleteGuest(user)
            catch err
              console.error err
            break
        else if user?
          if user.last_active < @user_limit and not user.flags.validated 
            #console.info "user abandoned: " + user.nick
            has_public = false
            for key of user.projects
              project = user.projects[ key ]
              if project.public
                has_public = true
            if not has_public
              try
                @deleted_users += 1
                @deleted_projects += Object.keys(user.projects).length
                @deleteUser(user)
                console.info "inactive, unvalidated user deleted: " + user.nick
              catch err
                console.error err
              break

    if @index >= @users.length
      @stop()
      console.info "Deleted guests: "+@deleted
      console.info "Deleted projects: "+@deleted_projects
      console.info "Deleted inactive, unvalidated users: "+@deleted_users

module.exports = @Cleaner
