class @JobQueue
  constructor:(@conclude)->
    @jobs = []

  add:(job)->
    @jobs.push job

  start:()->
    @next()

  next:()->
    setTimeout (()=>@processOne()),0

  processOne:()->
    if @jobs.length>0
      j = @jobs.splice(0,1)[0]
      j(@)
    else if @conclude?
      c = @conclude
      delete @conclude
      c @

module.exports = @JobQueue
