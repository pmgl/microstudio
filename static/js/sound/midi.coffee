class @MIDI
  constructor:(@callback)->
    @scan()

  scan:()->
    if navigator.requestMIDIAccess?
      navigator.requestMIDIAccess().then ((midi)=>@midiAccess(midi)),(()=>)

  midiAccess:(midi)->
    midi.inputs.forEach (port)=>port.onmidimessage = (message)=>@onMidiMessage(message)

  onMidiMessage:(message)->
    console.info message.data
    @callback message.data
