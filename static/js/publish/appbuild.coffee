class @AppBuild
  constructor:(@app,@target)->
    @button = document.querySelector "##{@target}-export .publish-button"
    @button.addEventListener "click",()=>@buttonClicked()

  loadProject:(@project)->
    if @interval?
      clearInterval @interval
      @interval = null
    @updateBuildStatus()

  buttonClicked:()->
    if not @build?
      @app.client.sendRequest {
        name:"build_project"
        project: @project.id
        target: @target
      },(msg)=>
        @handleBuildStatus(msg.build)
    else if @build.progress == 100
      loc = "/#{@project.owner.nick}/#{@project.slug}/"
      if not @project.public
        loc += @project.code+"/"
      console.info loc+"download/#{@target}/"+"?v=#{@project.last_modified}"
      window.location = loc+"download/#{@target}/"+"?v=#{@project.last_modified}"

  updateBuildStatus:()->
    @app.client.sendRequest {
      name:"get_build_status"
      project: @project.id
      target: @target
    },(msg)=>
      if msg.active_target
        document.querySelector("#publish-box-#{@target}").style.display = "block"
      else
        document.querySelector("#publish-box-#{@target}").style.display = "none"
      @handleBuildStatus(msg.build)

  handleBuildStatus:(@build)->
    if not @build?
      @button.style.background = "hsl(160,50%,50%)"
      @button.innerHTML = '<i class="fa fa-wrench"></i> '+@app.translator.get "Build"
      if @interval?
        clearInterval @interval
        @interval = null
    else if @build.progress<100
      @setBuildProgress(@build.status_text,@build.progress)
      if not @interval?
        @interval = setInterval (()=>@updateBuildStatus()),1000
    else
      @button.style.background = "hsl(200,50%,50%)"
      @button.innerHTML = '<i class="fa fa-download"></i> '+@app.translator.get "Download"

  setBuildProgress:(text,progress)->
    @button.style.background =  "linear-gradient(90deg,hsl(30,50%,50%) 0%,hsl(30,50%,50%) #{progress}%,rgba(255,255,255,.1) #{progress}%)"
    @button.innerHTML = '<i class="fa fa-sync-alt"></i> '+text
