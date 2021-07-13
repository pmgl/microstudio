class @Synth
  constructor:(@app)->
    @synth_window = new FloatingWindow(@app,"synth-window",@,{fixed_size:true})

    @knobs = []
    @sliders = []

    knobs = document.getElementsByClassName("knob")
    for k in knobs
      @knobs.push new Knob(k,null,@)

    sliders = document.getElementsByClassName("synth-slider")
    for s in sliders
      @sliders.push new Slider(s,null,@)

    @waveforms = ["saw","square","sine"] #,"voice","string"]

    for i in [1..2]
      for j in @waveforms
        new WaveFormButton "osc"+i,j,@

    @filtertypes = ["lowpass","bandpass","highpass"]
    for f in @filtertypes
      new FilterTypeButton f,@

    @polyphony = ["poly","mono"]

    new PolyphonyButton "poly",@
    new PolyphonyButton "mono",@

    new FilterSlopeButton @

    @sync_button = new TextToggleButton "sync","SYNC",(s)=>@syncChanged(s)

    @lfo1_audio = new TextToggleButton "lfo1-audio","AUDIO",(s)=>@lfoAudioChanged("lfo1",s)
    @lfo2_audio = new TextToggleButton "lfo2-audio","AUDIO",(s)=>@lfoAudioChanged("lfo2",s)

    @lfowaveforms = ["saw","square","sine","triangle","random","randomstep","invsaw"]

    for i in [1..2]
      for j in @lfowaveforms
        new WaveFormButton "lfo"+i,j,@

    @keyboard = new SynthKeyboard document.getElementById("synth-keyboard"),5,{
      noteOn:()->
      noteOff:()->
    }
    @mod_wheel = new SynthWheel document.getElementById("synth-modwheel")
    @pitch_wheel = new SynthWheel document.getElementById("synth-pitchwheel")

    @velocity_outputs = [
      "OFF"

      "Mod"

      "Cutoff"
      "Resonance"

      "Osc1 Mod"
      "Osc1 Amp"

      "Osc2 Mod"
      "Osc2 Amp"

      "Noise Amp"
      "Noise Color"

      "Env1 Attack"
      "Env2 Attack"
      "Env2 Amt"

      "LFO1 Amt"
      "LFO1 Rate"

      "LFO2 Amt"
      "LFO2 Rate"
    ]

    @modulation_outputs = [
      "OFF"

      "Amp"
      "Mod"

      "Osc1 Amp"
      "Osc1 Mod"

      "Osc2 Amp"
      "Osc2 Mod"

      "Noise Amp"
      "Noise Color"

      "Cutoff"
      "Resonance"

      "LFO 1 Amt"
      "LFO 1 Rate"

      "LFO 2 Amt"
      "LFO 2 Rate"
    ]

    @lfo1_outputs = [
      "OFF"

      "Pitch"
      "Mod"
      "Amp"

      "Osc1 Pitch"
      "Osc1 Mod"
      "Osc1 Amp"

      "Osc2 Pitch"
      "Osc2 Mod"
      "Osc2 Amp"

      "Noise Amp"
      "Noise Color"

      "Cutoff"
      "Resonance"

      "LFO 2 Amt"
      "LFO 2 Rate"
    ]

    @lfo2_outputs = [
      "OFF"

      "Pitch"
      "Mod"
      "Amp"

      "Osc1 Pitch"
      "Osc1 Mod"
      "Osc1 Amp"

      "Osc2 Pitch"
      "Osc2 Mod"
      "Osc2 Amp"

      "Noise Amp"
      "Noise Color"

      "Cutoff"
      "Resonance"
    ]

    @env2_outputs = [
      "OFF"

      "Cutoff"
      "Resonance"

      "Pitch"
      "Mod"
      "Amp"

      "Osc1 Pitch"
      "Osc1 Mod"
      "Osc1 Amp"

      "Osc2 Pitch"
      "Osc2 Mod"
      "Osc2 Amp"

      "Noise Amp"
      "Noise Color"

      "LFO1 Amt"
      "LFO1 Rate"

      "LFO2 Amt"
      "LFO2 Rate"
    ]

    @fx1_types = [
      "None"
      "Distortion"
      "Bit Crusher"
      "Chorus"
      "Flanger"
      "Phaser"
      "Delay"
    ]

    @fx2_types = [
      "None"
      "Delay"
      "Reverb"
      "Chorus"
      "Flanger"
      "Phaser"
    ]

    new SynthSelector "lfo1-out",@lfo1_outputs,(index)=>
      @app.audio_controller.sendParam("lfo1.out",index-1)

    new SynthSelector "lfo2-out",@lfo2_outputs,(index)=>
      @app.audio_controller.sendParam("lfo2.out",index-1)

    new SynthSelector "env2-out",@env2_outputs,(index)=>
      @app.audio_controller.sendParam("env2.out",index-1)

    new SynthSelector "velocity-out",@velocity_outputs,(index)=>
      @app.audio_controller.sendParam("velocity.out",index-1)

    new SynthSelector "modulation-out",@modulation_outputs,(index)=>
      @app.audio_controller.sendParam("modulation.out",index-1)

    new SynthSelector "fx1-type",@fx1_types,(index)=>
      @app.audio_controller.sendParam("fx1.type",index-1)

    new SynthSelector "fx2-type",@fx2_types,(index)=>
      @app.audio_controller.sendParam("fx2.type",index-1)

    @combine_modes = ["+","×","~"]

    @combine = 0
    document.getElementById("combine-button").addEventListener "click",()=>
      @combine = (@combine+1)%@combine_modes.length
      document.getElementById("combine-button").innerText = @combine_modes[@combine]
      @app.audio_controller.sendParam "combine",@combine

  knobChange:(id,value)->
    @app.audio_controller.sendParam(id.replace("-","."),value)

  waveFormChange:(osc,form)->
    wf = if osc.startsWith("lfo") then @lfowaveforms else @waveforms
    for f in wf
      c = document.getElementById "#{osc}-#{f}"
      if f == form
        c.classList.add "selected"
      else
        c.classList.remove "selected"

    @app.audio_controller.sendParam "#{osc}.type",wf.indexOf form

  filterTypeChange:(type)->
    for t in @filtertypes
      c = document.getElementById "filter-#{t}"
      if t == type
        c.classList.add "selected"
      else
        c.classList.remove "selected"

    @app.audio_controller.sendParam "filter.type",@filtertypes.indexOf type

  polyphonyTypeChange:(poly)->
    for p in @polyphony
      c = document.getElementById "polyphony-#{p}"
      if p == poly
        c.classList.add "selected"
      else
        c.classList.remove "selected"

    @app.audio_controller.sendParam "polyphony",@polyphony.indexOf poly

  filterSlopeChanged:(selected)->
    document.getElementById("filter-slope").classList[if selected then "add" else "remove"]("selected")
    @app.audio_controller.sendParam "filter.slope",if selected then 1 else 0

  syncChanged:(selected)->
    document.getElementById("sync").classList[if selected then "add" else "remove"]("selected")
    @app.audio_controller.sendParam "sync",if selected then 1 else 0

  lfoAudioChanged:(lfo,selected)->
    document.getElementById("#{lfo}-audio").classList[if selected then "add" else "remove"]("selected")
    @app.audio_controller.sendParam "#{lfo}.audio",if selected then 1 else 0

class @WaveFormButton
  constructor:(@osc,@form,@listener)->
    @canvas = document.getElementById("#{@osc}-#{@form}")
    @canvas.width = 30
    @canvas.height = 15
    @update()
    @canvas.addEventListener "click",()=>
      @listener.waveFormChange @osc,@form

  update:()->
    w = @canvas.width
    h = @canvas.height
    margin = 3
    wmargin = 6

    context = @canvas.getContext "2d"

    context.beginPath()
    context.strokeStyle = "#000"
    context.lineWidth = 1

    switch @form
      when "saw"
        context.moveTo wmargin,h-margin
        context.lineTo wmargin,margin
        context.lineTo w-wmargin,h-margin
        context.lineTo w-wmargin,margin

      when "square"
        context.moveTo wmargin,h-margin
        context.lineTo wmargin,margin
        context.lineTo w/2,margin
        context.lineTo w/2,h-margin
        context.lineTo w-wmargin,h-margin
        context.lineTo w-wmargin,margin

      when "sine"
        context.moveTo wmargin,h/2
        for i in [0..40] by 1
          a = i/40*Math.PI*2
          context.lineTo wmargin+(w-2*wmargin)*i/40,h/2+(h/2-margin)*Math.sin(a)

      when "triangle"
        ww = w-2*wmargin
        context.moveTo wmargin,h/2
        context.lineTo w/2-ww/4,margin
        context.lineTo w/2+ww/4,h-margin
        context.lineTo w-wmargin,h/2

      when "random"
        random = new Random(1)
        context.moveTo wmargin,h/2
        for i in [0..20] by 1
          context.lineTo wmargin+(w-2*wmargin)*i/20,h/2+(h/2-margin)*(random.next()*2-1)

      when "randomstep"
        random = new Random(1)
        context.moveTo wmargin,h/2
        level = 0
        for i in [0..5] by 1
          context.lineTo wmargin+(w-2*wmargin)*i/5,h/2+(h/2-margin)*level
          level = random.next()*2-1
          context.lineTo wmargin+(w-2*wmargin)*i/5,h/2+(h/2-margin)*level

    context.stroke()


class @FilterTypeButton
  constructor:(@type,@listener)->
    @canvas = document.getElementById("filter-#{@type}")
    @canvas.width = 30
    @canvas.height = 15
    @update()
    @canvas.addEventListener "click",()=>
      @listener.filterTypeChange @type

  update:()->
    w = @canvas.width
    h = @canvas.height
    margin = 3
    wmargin = 6

    context = @canvas.getContext "2d"

    context.fillStyle = "#000"
    context.font = "7pt Ubuntu"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText @type.substring(0,@type.indexOf("pass")).toUpperCase(),w/2,h/2

class @PolyphonyButton
  constructor:(@type,@listener)->
    @canvas = document.getElementById("polyphony-#{@type}")
    @canvas.width = 30
    @canvas.height = 15
    @update()
    @canvas.addEventListener "click",()=>
      @listener.polyphonyTypeChange @type

  update:()->
    w = @canvas.width
    h = @canvas.height
    margin = 3
    wmargin = 6

    context = @canvas.getContext "2d"

    context.fillStyle = "#000"
    context.font = "7pt Ubuntu"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText @type.toUpperCase(),w/2,h/2

class @FilterSlopeButton
  constructor:(@listener)->
    @canvas = document.getElementById("filter-slope")
    @canvas.width = 30
    @canvas.height = 15
    @update()
    @selected = true
    @canvas.addEventListener "click",()=>
      @selected = not @selected
      @listener.filterSlopeChanged @selected

  update:()->
    w = @canvas.width
    h = @canvas.height
    margin = 3
    wmargin = 6

    context = @canvas.getContext "2d"

    context.fillStyle = "#000"
    context.font = "7pt Ubuntu"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText "24 dB",w/2,h/2

class @TextToggleButton
  constructor:(@id,@text,@callback)->
    @canvas = document.getElementById(@id)
    @canvas.width = 30
    @canvas.height = 15
    @update()
    @selected = true
    @canvas.addEventListener "click",()=>
      @selected = not @selected
      @callback @selected

  update:()->
    w = @canvas.width
    h = @canvas.height
    margin = 3
    wmargin = 6

    context = @canvas.getContext "2d"

    context.fillStyle = "#000"
    context.font = "7pt Ubuntu"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText @text,w/2,h/2


class @SynthSelector
  constructor:(@id,@values,@callback)->
    @element = document.getElementById @id
    @previous = document.querySelector "##{@id} .fa-caret-left"
    @next = document.querySelector "##{@id} .fa-caret-right"
    @screen = document.querySelector "##{@id} .screen"
    @previous.addEventListener "click",()=>@doPrevious()
    @next.addEventListener "click",()=>@doNext()
    @setIndex(0)

  setIndex:(@index)->
    @screen.innerText = @values[@index]

  doPrevious:()->
    @setIndex (@index-1+@values.length)%@values.length
    @callback @index

  doNext:()->
    @setIndex (@index+1)%@values.length
    @callback @index
