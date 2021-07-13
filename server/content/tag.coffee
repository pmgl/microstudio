class @Tag
  constructor:(@tag)->
    @targets = {}
    @uses = 0

  add:(target)->
    if not @targets[target.id]?
      @targets[target.id] = target
      @uses++

  remove:(target)->
    if @targets[target.id]?
      delete @targets[target.id]
      @uses--

  test:(target)->
    @targets[target]?

module.exports = @Tag
