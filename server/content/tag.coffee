class @Tag
  constructor:(@tag)->
    @targets = {}
    @uses = 0
    @users = {}
    @num_users = 0

  add:(target)->
    if not @targets[target.id]?
      @targets[target.id] = target
      @uses++
      if target.owner? and target.owner.id? and not @users[target.owner.id]
        @users[target.owner.id] = true
        @num_users += 1

  remove:(target)->
    if @targets[target.id]?
      delete @targets[target.id]
      @uses--

  test:(target)->
    @targets[target]?

module.exports = @Tag
