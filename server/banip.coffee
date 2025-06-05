fs = require('fs')
path = require('path')

class KnownIP
  constructor:(@banip,@ip)->
    @last_requests = [0,0,0,0]
    @index = 0

  request:()->
    time = Date.now()
    @last_requests[@index] = time
    @index = (@index+1) % @last_requests.length
    dt = time - @last_requests[@index]
    if dt < 500
      @ban()

  ban:()->
    @banip.banIP(@ip)
    @banned = true

BLOCKED_IPS_FILE = path.join(__dirname, 'blocked_ips.txt');

class @BanIP
  constructor:(@server)->
    @known_ips = {}
    @banned = {}

    if fs.existsSync( BLOCKED_IPS_FILE )
      lines = fs.readFileSync(BLOCKED_IPS_FILE, 'utf-8').split('\n')
      for ip in lines
        @banned[ip] = true

    @write_stream = fs.createWriteStream(BLOCKED_IPS_FILE, { flags: 'a' })

  banIP:(ip)->
    return if not ip
    @banned[ip] = true
    try
      @write_stream.write(ip + '\n');
    catch err

  isBanned:(ip)->
    return false if not ip
    return @banned[ip] or false

  request:(ip)->
    return if not ip
    knownip = @known_ips[ip]
    if not knownip
      knownip = @known_ips[ip] = new KnownIP @, ip

    knownip.request()

module.exports = @BanIP