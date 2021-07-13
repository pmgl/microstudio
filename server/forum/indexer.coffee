class @Indexer
  constructor:()->
    @queue = []
    @words = {}
    @memory = 0
    @start()

  start:()->
    @stop()
    @interval = setInterval (()=>@processOne()),1000

  stop:()->
    if @interval?
      clearInterval @interval

  add:(text,target,uid)->
    @queue.push
      text: text
      target: target
      uid: uid

  processOne:()->
    try
      if @queue.length>0
        job = @queue.splice(0,1)[0]
        words = job.text.match(/\b(\w+)\b/g)
        if words?
          for word in words
            @push word,job.target,job.uid

        if @queue.length == 0
          console.info "index size = #{@memory} ; words = #{Object.keys(@words).length}"
    catch err
      console.error err

    return

  push:(word,target,uid)->
    word = word.toLowerCase()
    w = @words[word]
    if not w?
      @words[word] = w = {}
      @memory += 8+word.length+40

    if not w[uid]?
      w[uid] =
        score: 1
        target: target
      @memory += 40
    else
      w[uid].score += 1

  search:(string)->
    rlist = []
    rtab = {}
    words = string.toLowerCase().match(/\b(\w+)\b/g)
    return rlist if not words?
    for word in words
      w = @words[word]
      for uid,data of w
        r = rtab[uid]
        if not r?
          r =
            score: data.score
            target: data.target
            words: {}
          r.words[word] = true
          rtab[uid] = r
          rlist.push r
        else
          r.score += data.score
          r.words[word] = true

    for r in rlist
      r.score += Object.keys(r.words).length*100

    rlist.sort (a,b)->b.score-a.score
    rlist

module.exports = @Indexer
