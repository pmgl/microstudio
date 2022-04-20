usage = require "pidusage"
User = require __dirname+"/user.js"
Project = require __dirname+"/project.js"
Tag = require __dirname+"/tag.js"
Token = require __dirname+"/token.js"
Translator = require __dirname+"/translator.js"
Forum = require __dirname+"/../forum/forum.js"
Cleaner = require __dirname+"/cleaner.js"

class @Content
  constructor:(@server,@db,@files)->
    @users = {}
    @users_by_email = {}
    @users_by_nick = {}

    @tokens = {}

    @projects = {}
    @tags = {}

    @project_count = 0
    @user_count = 0
    @guest_count = 0

    @load()
    @hot_projects = []
    @top_projects = []
    @new_projects = []
    @updatePublicProjects()

    console.info "Content loaded: #{@user_count} users and #{@project_count} projects"

    @top_interval = setInterval (()=> @sortPublicProjects()),10001
    @log_interval = setInterval (()=> @statusLog()),6000

    @translator = new Translator @
    @forum = new Forum @

    @cleaner = new Cleaner @

  close:()->
    clearInterval @top_interval
    clearInterval @log_interval
    @forum.close()
    @cleaner.stop() if @cleaner?

  statusLog:()->
    usage process.pid,(err,result)=>
      return if not result?
      console.info "------------"
      console.info "#{new Date().toString()}"
      console.info "cpu: #{Math.round(result.cpu)}%"
      console.info "memory: #{Math.round(result.memory/1000000)} mb"
      console.info "users: #{@user_count}"
      console.info "projects: #{@project_count}"
      @current_cpu = Math.round(result.cpu)
      @current_memory = Math.round(result.memory/1000000)
      @server.stats.max("cpu_max",Math.round(result.cpu))
      @server.stats.max("memory_max",@current_memory)

  load:()->
    users = @db.list("users")
    for record in users
      @loadUser record

    if @server.config.standalone
      if @user_count>1
        throw "Error, cannot run standalone if user_count>1"
      else if @user_count == 0
        user = @createUser
          nick: "microstudio"
          email: "standalone@microstudio.dev"
          flags: {validated: true}
          hash: "---"
          date_created: Date.now()
          last_active: Date.now()
          creation_ip: "127.0.0.1"

    tokens = @db.list("tokens")
    for token in tokens
      @loadToken token

    projects = @db.list("projects")
    for record in projects
      @loadProject record

    @initLikes()

    return

  loadUser:(record)->
    data = record.get()
    user = new User @,record
    return if user.flags.deleted
    @users[user.id] = user
    if user.email?
      @users_by_email[user.email] = user
    else
      @guest_count += 1
    @users_by_nick[user.nick] = user
    @user_count++
    user

  loadProject:(record)->
    data = record.get()
    project = new Project @,record
    if project.owner? and not project.deleted
      @projects[project.id] = project
      @loadTags(project)
      @project_count++
    project

  loadTags:(project)->
    for t in project.tags
      tag = @tags[t]
      if not tag?
        tag = new Tag(t)
        @tags[t] = tag
      tag.add project

    return

  loadToken:(record)->
    data = record.get()
    token = new Token @,record
    if token.user?
      @tokens[token.value] = token
    token

  initLikes:()->
    for key,user of @users
      for f in user.likes
        if @projects[f]?
          @projects[f].likes++

    return

  updatePublicProjects:()->
    @hot_projects = []
    @top_projects = []
    @new_projects = []
    for key,project of @projects
      if project.public and not project.unlisted and project.owner.flags["validated"] and not project.deleted and not project.owner.flags["censored"]
        @hot_projects.push project
        @top_projects.push project
        @new_projects.push project

    @sortPublicProjects()

  sortPublicProjects:()->
    time = Date.now()
    @top_projects.sort (a,b)-> b.likes-a.likes
    @new_projects.sort (a,b)-> b.first_published-a.first_published

    return if @top_projects.length<2 or @new_projects.length<2

    now = Date.now()
    maxLikes = Math.max(1,@top_projects[0].likes)
    maxAge = now-@new_projects[@new_projects.length-1].first_published

    note = (p)->
      hours = Math.max(0,(now-p.first_published))/1000/3600
      agemark = Math.exp(-hours/24/7)
      p.likes/maxLikes*50+50*agemark

    @hot_projects.sort (a,b)->
      note(b)-note(a)

    console.info "Sorting public projects took: #{Date.now()-time} ms"

  setProjectPublic:(project,pub)->
    project.set("public",pub)
    if pub and project.first_published == 0
      project.set "first_published",Date.now()

    if pub and not project.unlisted
      @hot_projects.push(project) if @hot_projects.indexOf(project)<0
      @top_projects.push(project) if @top_projects.indexOf(project)<0
      @new_projects.push(project) if @new_projects.indexOf(project)<0
      #@sortPublicProjects()
    else
      index = @hot_projects.indexOf(project)
      if index>=0
        @hot_projects.splice index,1
      index = @top_projects.indexOf(project)
      if index>=0
        @top_projects.splice index,1
      index = @new_projects.indexOf(project)
      if index>=0
        @new_projects.splice index,1

  projectDeleted:(project)->
    @project_count -= 1

    index = @hot_projects.indexOf(project)
    if index>=0
      @hot_projects.splice index,1
    index = @top_projects.indexOf(project)
    if index>=0
      @top_projects.splice index,1
    index = @new_projects.indexOf(project)
    if index>=0
      @new_projects.splice index,1

  addProjectTag:(project,t)->
    tag = @tags[t]
    if not tag?
      tag = new Tag(t)
      @tags[t] = tag
    tag.add project

  removeProjectTag:(project,t)->
    tag = @tags[t]
    if tag?
      tag.remove project

  setProjectTags:(project,tags)->
    for t in project.tags
      if tags.indexOf(t)<0
        @removeProjectTag(project,t)

    for t in tags
      if project.tags.indexOf(t)<0
        @addProjectTag(project,t)

    project.set "tags",tags

  createUser:(data)->
    record = @db.create "users",data
    @loadUser record

  createToken:(user)->
    value = ""
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for i in [0..31] by 1
      value += chars.charAt(Math.floor(Math.random()*chars.length))

    record = @db.create "tokens",
      value: value
      user: user.id
      date_created: Date.now()

    @loadToken record

  findUserByNick:(nick)->
    @users_by_nick[nick]

  findUserByEmail:(email)->
    @users_by_email[email]

  changeUserNick:(user,nick)->
    delete @users_by_nick[user.nick]
    user.set "nick",nick
    @users_by_nick[nick] = user

  changeUserEmail:(user,email)->
    if user.email?
      delete @users_by_email[user.email]
    else
      @guest_count -= 1
    user.set "email",email
    @users_by_email[email] = user

  userDeleted:(user)->
    delete @users_by_nick[user.nick]
    if user.email?
      delete @users_by_email[user.email]
    else
      @guest_count -= 1
    @user_count -= 1

  findToken:(token)->
    @tokens[token]

  createProject:(owner,data,callback,empty=false)->
    slug = data.slug
    if owner.findProjectBySlug(slug)
      count = 2
      while owner.findProjectBySlug(slug+count)?
        count += 1
      data.slug = slug+count

    d =
      title: data.title
      slug: data.slug
      tags: []
      likes: []
      public: data.public or false
      date_created: Date.now()
      last_modified: Date.now()
      deleted: false
      owner: owner.id
      orientation: data.orientation
      aspect: data.aspect
      type: data.type
      language: data.language
      graphics: data.graphics
      libs: data.libs
      tabs: data.tabs

    record = @db.create "projects",d
    project = @loadProject record
    if empty
      callback(project)
    else
      if project.language? and DEFAULT_CODE[project.language]?
        content = DEFAULT_CODE[project.language]
      else
        content = DEFAULT_CODE.microscript

      @files.write "#{owner.id}/#{project.id}/ms/main.ms",content,()=>
        @files.copyFile "../static/img/defaultappicon.png","#{owner.id}/#{project.id}/sprites/icon.png",()=>
          callback(project)

  getConsoleGameList:()->
    list = []
    for key,p of @projects
      if p.public and not p.deleted
        list.push
          author: p.owner.nick
          slug: p.slug
          title: p.title

    list

  sendValidationMail:(user)->
    return if not user.email?
    token = user.getValidationToken()
    translator = @translator.getTranslator(user.language)
    subject = translator.get("Microstudio e-mail validation")
    text = translator.get("Thank you for using Microstudio!")+"\n\n"
    text += translator.get("Click on the link below to validate your e-mail address:")+"\n\n"
    text += "https://microstudio.dev/v/#{user.id}/#{token}"+"\n\n"

    @server.mailer.sendMail user.email,subject,text

  sendPasswordRecoveryMail:(user)->
    return if not user.email?
    token = user.getValidationToken()
    translator = @translator.getTranslator(user.language)
    subject = translator.get("Reset your microStudio password")
    text = translator.get("Click on the link below to choose a new microStudio password:")+"\n\n"
    text += "https://microstudio.dev/pw/#{user.id}/#{token}"+"\n\n"
    @server.mailer.sendMail user.email,subject,text

  checkValidationToken:(user,token)->
    token == user.getValidationToken()

  validateEMailAddress:(user,token)->
    console.info "verifying #{token} against #{user.getValidationToken()}"
    if token? and token.length>0 and @checkValidationToken(user,token)
      user.resetValidationToken()
      user.setFlag("validated",true)
      translator = @translator.getTranslator(user.language)
      user.notify translator.get "Your e-mail address is now validated"


DEFAULT_CODE =
  python: """
def init():
  pass

def update():
  pass

def draw():
  pass
  """
  javascript: """
init = function() {
}

update = function() {
}

draw = function() {
}
  """
  lua: """
init = function()
end

update = function()
end

draw = function()
end
  """
  microscript: """
init = function()
end

update = function()
end

draw = function()
end
  """


module.exports = @Content
