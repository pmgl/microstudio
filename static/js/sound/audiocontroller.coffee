class @AudioController
  constructor:(@app)->

  init:()->
    @midiScan()
    funk = ()=>
      @start()
      document.body.removeEventListener "click",funk

    document.body.addEventListener "click",funk

  start:()->
    @context = new (window.AudioContext || window.webkitAudioContext)

    if @context.audioWorklet?
      url = "/audioengine.js"
      @context.audioWorklet.addModule(url).then ()=>
        @node = new AudioWorkletNode(@context,"my-worklet-processor",{outputChannelCount: [2] })
        @node.connect(@context.destination)

  sendParam:(id,value)->
    @node.port.postMessage JSON.stringify
      name: "param"
      id: id
      value: value

  sendNote:(data)->
    @node.port.postMessage JSON.stringify
      name: "note"
      data: data

  midiScan:()->
    if navigator.requestMIDIAccess?
      navigator.requestMIDIAccess().then ((midi)=>@midiAccess(midi)),(()=>)

  midiAccess:(midi)->
    midi.inputs.forEach (port)=>port.onmidimessage = (message)=>@onMidiMessage(message)
    true

  onMidiMessage:(message)->
    console.info message.data
    @sendNote message.data
