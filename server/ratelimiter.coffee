class @RateLimiter
  constructor:(@server)->
    @map = {}

    @map.request = new RateLimiterClass(@,1,1000*100) # > 1000 home page loads per minute (> 5000 realtime)
    @map.request_ip = new RateLimiterClass(@,1,100*100) # > 100 home page loads per minute per ip (> 500 realtime)

    @map.login_ip = new RateLimiterClass(@,1,20) # 20 tentatives de login par minute de la même IP
    @map.login_user = new RateLimiterClass(@,2,10) # 10 tentatives de login par username par 2 minutes
    @map.delete_account = new RateLimiterClass(@,5,5) # 5 tentatives de suppression par user par 5 minutes

    @map.send_mail_user = new RateLimiterClass(@,5,5) # 5 mails max en 5 minutes

    @map.create_account_ip = new RateLimiterClass(@,30,30) # 30 comptes pour 30 minutes => classroom check

    @map.create_project_user = new RateLimiterClass(@,60,10) # max 10 projects per hour
    @map.import_project_user = new RateLimiterClass(@,60,10) # max 10 projects per hour
    @map.file_upload_user = new RateLimiterClass(@,10,10) # max 10 large file uploads per ten minutes

    @map.create_file_user = new RateLimiterClass(@,5,40) # max 40 new files per 5 minutes
    #@map.change_file_user = new RateLimiterClass(@,10,200)

    @map.post_comment_user = new RateLimiterClass(@,10,10) # max 10 new comments per 10 minutes

    @map.create_forum_post = new RateLimiterClass(@,60,10) # max 10 new posts per hour
    @map.create_forum_reply = new RateLimiterClass(@,10,10) # max 10 new replies per 10 minutes
    @map.search_forum = new RateLimiterClass(@,1,15) # max 15 searches per minute

    @interval = setInterval (()=>@log()),5000

  accept:(type,key)->
    if @map[type]?
      @map[type].accept(key)
    else
      false

  close:()->
    clearInterval @interval

  log:()->
    for key,limiter of @map
      limiter.checkTime()
      max = Math.round(limiter.max_count/limiter.quantity*100)
      if max>10
        console.info "rate limiter #{key} at #{max}% for #{limiter.maxer}"
    return

class RateLimiterClass
  constructor:(@rate_limiter,@minutes,@quantity)->
    @current = Math.floor(Date.now()/(@minutes*60000))
    @requests = {}
    @max_count = 0
    @maxer = ""

  checkTime:()->
    now = Math.floor(Date.now()/(@minutes*60000))
    if now != @current
      @current = now
      @requests = {}
      @max_count = 0
      @maxer = ""

  accept:(key)->
    @checkTime()

    return false if not key?
    if not @requests[key]?
      @requests[key] = 0

    if @requests[key] >= @quantity
      false
    else
      @requests[key]++
      if @requests[key]>@max_count
        @max_count = @requests[key]
        @maxer = key
      true

module.exports = @RateLimiter
