class @AudioOutput
  constructor:()->

  start:()->
    @context = new (window.AudioContext || window.webkitAudioContext)

    if @context.audioWorklet?
      url = "synth/audioengine.js"
      @context.audioWorklet.addModule(url).then ()=>
        @node = new AudioWorkletNode(@context,"my-worklet-processor",{outputChannelCount: [2] })
        @node.connect(@context.destination)

    @addParam "Osc1 coarse","osc1_coarse"
    @addParam "Osc1 tune","osc1_tune"
    @addParam "Osc1 amp","osc1_amp"
    @addParam "Osc1 mod","osc1_mod"

    @addParam "Osc2 coarse","osc2_coarse"
    @addParam "Osc2 tune","osc2_tune"
    @addParam "Osc2 amp","osc2_amp"
    @addParam "Osc2 mod","osc2_mod"

    @addParam "Noise","noise"
    @addParam "Noise mod","noise_mod"

    @addParam "Env1 A","env1.a"
    @addParam "Env1 D","env1.d"
    @addParam "Env1 S","env1.s"
    @addParam "Env1 R","env1.r"

    @addParam "Slope","filter_slope"
    @addParam "Type","filter_type"
    @addParam "Cutoff","filter_cutoff"
    @addParam "Resonance","filter_resonance"
    @addParam "Env","filter_env_amount"

    @addParam "Env2 A","env2.a"
    @addParam "Env2 D","env2.d"
    @addParam "Env2 S","env2.s"
    @addParam "Env2 R","env2.r"

    @addParam "LFO1 form","lfo1.form"
    @addParam "LFO1 rate","lfo1.rate"
    @addParam "LFO1 amp","lfo1.amp"

    @addParam "Disto Wet","disto.wet"
    @addParam "Disto Drive","disto.drive"

    @addParam "Bitcrusher Wet","bitcrusher.wet"
    @addParam "Bitcrusher Drive","bitcrusher.drive"
    @addParam "Bitcrusher Crush","bitcrusher.crush"

  addParam:(name,id)->
    h = document.createElement "h4"
    h.innerText = name
    document.body.appendChild h

    input = document.createElement "input"
    input.id = id
    input.type = "range"
    document.body.appendChild input
    input.addEventListener "input",()=>
      @sendParam id,input.value/100

  sendParam:(id,value)->
    @node.port.postMessage JSON.stringify
      name: "param"
      id: id
      value: value

  sendNote:(data)->
    @node.port.postMessage JSON.stringify
      name: "note"
      data: data
