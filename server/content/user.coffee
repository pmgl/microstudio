UserProgress = require __dirname+"/../gamify/userprogress.js"

class @User
  constructor:(@content,@record)->
    data = @record.get()
    @flags = data.flags or {}
    if @flags.deleted
      if data.nick?
        @record.set
          flags:
            deleted: true

    if not @flags.deleted
      @id = data.id
      @nick = data.nick
      @email = data.email
      @language = data.language or "en"
      @settings = data.settings or {}
      @hash = data.hash
      @patches = []
      @likes = data.likes or []
      @projects = {}
      @project_links = []
      @listeners = []
      @notifications = []
      @description = data.description or ""
      @last_active = data.last_active or 0
      @updateTier()
      @progress = new UserProgress @,data

  updateTier:()->
    switch @flags.tier
      when "pixel_master"
        @max_storage = 200000000
        @early_access = false

      when "code_ninja"
        @max_storage = 400000000
        @early_access = false

      when "gamedev_lord"
        @max_storage = 1000000000
        @early_access = true

      when "founder"
        @max_storage = 2000000000
        @early_access = true

      when "sponsor"
        @max_storage = 2000000000
        @early_access = true

      else
        if @flags.guest
          @max_storage = 2000000
          @early_access = false
        else
          @max_storage = 50000000
          @early_access = false

  addListener:(listener)->
    if @listeners.indexOf(listener)<0
      @listeners.push listener

  removeListener:(listener)->
    index = @listeners.indexOf listener
    if index>=0
      @listeners.splice index,1

  addProject:(project)->
    @projects[project.id] = project

  listProjects:()->
    list = []
    for key of @projects
      list.push @projects[key]
    list

  listPublicProjects:()->
    list = []
    for key,project of @projects
      list.push project if project.public
    list

  getTotalSize:()->
    size = 0
    for key,project of @projects
      size += project.getSize()
    size

  addProjectLink:(link)->
    @project_links.push link

  listProjectLinks:()->
    @project_links

  removeLink:(projectid)->
    for link,i in @project_links
      if link.project.id == projectid
        @project_links.splice i,1
        return
    return

  findProject:(id)->
    @projects[id]

  findProjectBySlug:(slug)->
    for key of @projects
      p = @projects[key]
      if p.slug == slug
        return p

    null

  deleteProject:(project)->
    delete @projects[project.id]
    project.delete()

  set:(prop,value)->
    data = @record.get()
    data[prop] = value
    @record.set(data)
    @[prop] = value

  addLike:(id)->
    if @likes.indexOf(id)<0
      @likes.push id
      @set("likes",@likes)

  removeLike:(id)->
    index = @likes.indexOf(id)
    if index>=0
      @likes.splice index,1
      @set("likes",@likes)

  isLiked:(id)->
    @likes.indexOf(id)>=0

# Flags reference
# * validated (e-mail validated)
# * deleted (account deleted)
# *
  setFlag:(flag,value)->
    if value
      @flags[flag] = value
    else
      delete @flags[flag]
    @set "flags",@flags

  setSetting:(setting,value)->
    if value
      @settings[setting] = value
    else
      delete @settings[setting]
    @set "settings",@settings

  createValidationToken:()->
    map = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    token = ""
    for i in [1..32] by 1
      token += map.charAt(Math.floor(Math.random()*map.length))
    @record.setField "validation_token",token
    token

  getValidationToken:()->
    code = @record.getField("validation_token")
    if not code?
      code = @createValidationToken()
    code

  resetValidationToken:()->
    @record.setField("validation_token")

  canPublish:()-> @flags.validated and not @flags.deleted and not @flags.banned
  showPublicStuff:()-> @flags.validated and not @flags.deleted and not @flags.banned and not @flags.censored

  notify:(text)->
    @notifications.push text

  delete:()->
    @flags.deleted = true
    @record.set
      flags:
        deleted: true

    @content.userDeleted @
    for key,project of @projects
      project.delete()

    @projects = {}
    folder = "#{@id}"
    @content.files.deleteFolder folder
    return

module.exports = @User
