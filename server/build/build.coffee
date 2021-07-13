class @Build
  constructor:(@project,@target)->
    @status = "request"
    @status_text = "Queued"
    @progress = 0

    @version_check = @project.last_modified

  export:()->
    result =
      target: @target
      progress: @progress
      status: @status
      status_text: @status_text
      error: @error

module.exports = @Build
