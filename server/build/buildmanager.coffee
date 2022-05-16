Builder = require __dirname+"/builder.js"
Build = require __dirname+"/build.js"

class @BuildManager
  constructor:(@server)->
    @builders = {}
    @builds = {}
    @jobs = []

  registerBuilder:(session,target)->
    builder = new Builder @,session,target

    if not @builders[target]
      @builders[target] = [builder]
    else
      @builders[target].push(builder)

  unregisterBuilder:(builder)->
    target = builder.target
    if @builders[target]?
      index = @builders[target].indexOf(builder)
      if index >= 0
        @builders[target].splice index,1

  getActiveBuilders:()->
    s = ""
    for key,value of @builders
      if value.length>0
        if s.length>0
          s += ", "
        s += key+" (#{value.length})"

    s

  getActiveBuildersData:()->
    obj = {}
    for key,value of @builders
      obj[key] = value.length

    obj

  startBuild:(project,target)->
    key = project.id+"-"+target
    if not @builds[key]
      @builds[key] = new Build(project,target)

    @jobs.push @builds[key]

    @builds[key]

  hasBuilder:(target)->
    if @builders[target]?
      for b in @builders[target]
        if b.isActive()
          return true
    false

  getBuildInfo:(project,target)->
    key = project.id+"-"+target
    build = @builds[key]
    if build?
      if build.downloaded and build.version_check != project.last_modified
        delete @builds[key]
        return null

      if build.builder? and not build.builder.isActive()
        delete @builds[key]
        return null

    build

  getJob:(target)->
    for build,i in @jobs
      if build.status == "request" and build.target == target
        build.status = "starting"
        @jobs.splice i,1
        return build
    return null

  createLinks:(app)->
    @addDownloadBuild(app)

  addDownloadBuild:(app)->
    # /user/project[/code]/download/<target>/
    app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?download\/[^\/\|\?\&\.]+\/$/,(req,res)=>
      #console.info "download build"
      access = @server.webapp.getProjectAccess req,res
      return if not access?
      #console.info "access ok"

      user = access.user
      project = access.project
      manager = @server.webapp.getProjectManager(project)
      split = req.path.split("/")
      #console.info JSON.stringify split
      target = split[split.length-2]

      if project?
        #console.info "project ok, target = #{target}"
        key = project.id+"-"+target
        build = @builds[key]
        #console.info JSON.stringify build.export()
        if build? and build.progress == 100 and build.file_info? and build.builder?
          #console.info "build ok"
          build.builder.startDownload(build,res)

module.exports = @BuildManager
