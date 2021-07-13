class Voice
  @oscillators = [SawOscillator,SquareOscillator,SineOscillator,VoiceOscillator,StringOscillator]

  constructor:(@engine)->
    @osc1 = new SineOscillator @
    @osc2 = new SineOscillator @
    @noise = new Noise @
    @lfo1 = new LFO @
    @lfo2 = new LFO @
    @filter = new Filter @
    @env1 = new AmpEnvelope @
    @env2 = new ModEnvelope @
    @filter_increment = 0.0005*44100/@engine.sampleRate
    @modulation = 0
    @noteon_time = 0

  init:(layer)->
    if @osc1 not instanceof Voice.oscillators[layer.inputs.osc1.type]
      @osc1 = new Voice.oscillators[layer.inputs.osc1.type] @

    if @osc2 not instanceof Voice.oscillators[layer.inputs.osc2.type]
      @osc2 = new Voice.oscillators[layer.inputs.osc2.type] @

    @osc1.init(layer.inputs.osc1,layer.inputs.sync)
    @osc2.init(layer.inputs.osc2,layer.inputs.sync)
    @noise.init(layer,layer.inputs.sync)
    @lfo1.init(layer.inputs.lfo1,layer.inputs.sync)
    @lfo2.init(layer.inputs.lfo2,layer.inputs.sync)
    @filter.init(layer)
    @env1.init(layer.inputs.env1)
    @env2.init(layer.inputs.env2)

    @updateConstantMods()

  update:()->
    return if not @layer?

    if @osc1 not instanceof Voice.oscillators[@layer.inputs.osc1.type]
      @osc1 = new Voice.oscillators[@layer.inputs.osc1.type] @,@layer.inputs.osc1

    if @osc2 not instanceof Voice.oscillators[@layer.inputs.osc2.type]
      @osc2 = new Voice.oscillators[@layer.inputs.osc2.type] @,@layer.inputs.osc2

    @osc1.update(@layer.inputs.osc1,@layer.inputs.sync)
    @osc2.update(@layer.inputs.osc2,@layer.inputs.sync)

    @env1.update()
    @env2.update()

    @lfo1.update()
    @lfo2.update()
    @filter.update()

    @updateConstantMods()

  updateConstantMods:()->
    @osc1_on = @inputs.osc1.amp>0 or @inputs.lfo1.out == 5 or @inputs.lfo2.out == 5 or @inputs.env2.out == 7 or @inputs.velocity.out == 4 or @inputs.modulation.out == 2
    @osc2_on = @inputs.osc2.amp>0 or @inputs.lfo1.out == 8 or @inputs.lfo2.out == 8 or @inputs.env2.out == 10 or @inputs.velocity.out == 6 or @inputs.modulation.out == 4
    @noise_on = @inputs.noise.amp>0 or @inputs.lfo1.out == 9 or @inputs.lfo2.out == 9 or @inputs.env2.out == 11 or @inputs.velocity.out == 7 or @inputs.modulation.out == 6

    @osc1_amp = DBSCALE(@inputs.osc1.amp,3)
    @osc2_amp = DBSCALE(@inputs.osc2.amp,3)
    @osc1_mod = @inputs.osc1.mod
    @osc2_mod = @inputs.osc2.mod
    @noise_amp = DBSCALE(@inputs.noise.amp,3)
    @noise_mod = @inputs.noise.mod

    if @inputs.velocity.amp>0
      p = @inputs.velocity.amp
      p *= p
      p *= 4
      #amp = Math.pow(@velocity,p) #Math.exp((-1+@velocity)*5)
      norm = @inputs.velocity.amp*4
      amp = Math.exp(@velocity*norm)/Math.exp(norm)
      #amp = @inputs.velocity.amp*amp+(1-@inputs.velocity.amp)
    else
      amp = 1

    @osc1_amp *= amp
    @osc2_amp *= amp
    @noise_amp *= amp


    c = Math.log(1024*@freq/22000)/(10*Math.log(2))
    @cutoff_keymod = (c-.5)*@inputs.filter.follow
    @cutoff_base = @inputs.filter.cutoff+@cutoff_keymod

    @env2_amount = @inputs.env2.amount

    @lfo1_rate = @inputs.lfo1.rate
    @lfo1_amount = @inputs.lfo1.amount
    @lfo2_rate = @inputs.lfo2.rate
    @lfo2_amount = @inputs.lfo2.amount


    #   "Mod"
    #
    #   "Filter Cutoff"
    #   "Filter Resonance"
    #
    #   "Osc1 Mod"
    #   "Osc1 Amp"
    #
    #   "Osc2 Mod"
    #   "Osc2 Amp"
    #
    #   "Noise Amp"
    #   "Noise Color"
    #
    #   "Env1 Attack"
    #   "Env2 Attack"
    #   "Env2 Amount"
    #
    #   "LFO1 Amount"
    #   "LFO1 Rate"
    #
    #   "LFO2 Amount"
    #   "LFO2 Rate"
    # ]

    switch @inputs.velocity.out
      when 0 # Oscs Mod
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc1_mod = Math.min(1,Math.max(0,@osc1_mod+mod))
        @osc2_mod = Math.min(1,Math.max(0,@osc2_mod+mod))

      when 1 # Filter Cutoff
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @cutoff_base += mod

      when 3 # Osc1 Mod
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc1_mod = Math.min(1,Math.max(0,@osc1_mod+mod))

      when 4 # Osc1 Amp
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc1_amp = Math.max(0,@osc1_amp+mod)

      when 5 # Osc2 Mod
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc2_mod = Math.min(1,Math.max(0,@osc2_mod+mod))

      when 6 # Osc2 Amp
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @osc2_amp = Math.max(0,@osc2_amp+mod)

      when 7 # Noise Amp
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @noise_amp = Math.max(0,@noise_amp+mod)

      when 8 # Noise Color
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @noise_mod = Math.min(1,Math.max(0,@noise_mod+mod))

      when 9 # Env1 Attack
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        a = Math.max(0,Math.min(@inputs.env1.a+mod,1))
        @env1.update(a)

      when 10 # Env2 Attack
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        a = Math.max(0,Math.min(@inputs.env2.a+mod,1))
        @env2.update(a)

      when 11 # Env2 Amount
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @env2_amount = Math.max(0,Math.min(1,@env2_amount+mod))

      when 12 # LFO1 Amount
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @lfo1_amount = Math.max(0,@lfo1_amount+mod)

      when 13 # LFO1 Rate
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @lfo1_rate = Math.min(1,Math.max(0,@lfo1_rate+mod))

      when 14 # LFO2 Amount
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @lfo2_amount = Math.max(0,@lfo2_amount+mod)

      when 15 # LFO2 Rate
        mod = @velocity*(@inputs.velocity.amount-.5)*2
        @lfo2_rate = Math.min(1,Math.max(0,@lfo2_rate+mod))


    if @freq?
      c = Math.log(1024*@freq/22000)/(10*Math.log(2))
      @cutoff_keymod = (c-.5)*@inputs.filter.follow

  noteOn:(layer,@key,velocity,legato=false)->
    @velocity = velocity/127

    if @layer?
      @layer.removeVoice @

    @layer = layer
    @inputs = @layer.inputs
    if legato and @on
      @freq = 440*Math.pow(Math.pow(2,1/12),@key-57)

      if layer.last_key?
        @glide_from = layer.last_key
        @glide = true
        @glide_phase = 0
        glide_time = (@inputs.glide*.025+Math.pow(@inputs.glide,16)*.975)*10
        @glide_inc = 1/(glide_time*@engine.sampleRate+1)
    else
      @freq = 440*Math.pow(Math.pow(2,1/12),@key-57)
      @init @layer
      @on = true
      @cutoff = 0
      @modulation = @layer.instrument.modulation
      @pitch_bend = @layer.instrument.pitch_bend
      @modulation_v = 0
      @pitch_bend_v = 0

    @noteon_time = Date.now()

  noteOff:()->
    @on = false

  process:()->
    osc1_mod = @osc1_mod
    osc2_mod = @osc2_mod
    osc1_amp = @osc1_amp
    osc2_amp = @osc2_amp

    if @glide
      k = @glide_from*(1-@glide_phase)+@key*@glide_phase
      osc1_freq = osc2_freq = 440*Math.pow(Math.pow(2,1/12),k-57)
      @glide_phase += @glide_inc
      if @glide_phase>=1
        @glide = false
    else
      osc1_freq = osc2_freq = @freq

    if Math.abs(@pitch_bend-@layer.instrument.pitch_bend)>.0001
      @pitch_bend_v += .001*(@layer.instrument.pitch_bend-@pitch_bend)
      @pitch_bend_v *= .5
      @pitch_bend += @pitch_bend_v

    if Math.abs(@pitch_bend-.5)>.0001
      p = @pitch_bend*2-1
      p *= 2
      f = Math.pow(Math.pow(2,1/12),p)
      osc1_freq *= f
      osc2_freq *= f

    noise_amp = @noise_amp
    noise_mod = @noise_mod
    lfo1_rate = @lfo1_rate
    lfo1_amount = @lfo1_amount
    lfo2_rate = @lfo2_rate
    lfo2_amount = @lfo2_amount

    cutoff = @cutoff_base
    q = @inputs.filter.resonance

    if Math.abs(@modulation-@layer.instrument.modulation)>.0001
      @modulation_v += .001*(@layer.instrument.modulation-@modulation)
      @modulation_v *= .5
      @modulation += @modulation_v

    switch @inputs.modulation.out
      when 0 # Amp
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc1_amp *= Math.max(0,1+mod)
        osc2_amp *= Math.max(0,1+mod)
        noise_amp *= Math.max(0,1+mod)

      when 1 # Mod
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 2 # Osc1 Amp
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc1_amp = Math.max(0,osc1_amp+mod)

      when 3 # Osc1 Mod
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))

      when 4 # Osc2 Amp
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc2_amp = Math.max(0,osc2_amp+mod)

      when 5 # Osc2 Mod
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 6 # Noise Amp
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        noise_amp = Math.max(0,noise_amp+mod)

      when 7 # Noise Color
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        noise_mod = Math.min(1,Math.max(0,noise_mod+mod))

      when 8 # Filter Cutoff
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        cutoff += mod

      when 9 # Filter Resonance
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        q = Math.max(0,Math.min(1,q+mod))

      when 10 # LFO1 Amount
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        lfo1_amount = Math.max(0,Math.min(1,lfo1_amount+mod))

      when 11 # LFO1 Rate
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        lfo1_rate = Math.max(0,Math.min(1,lfo1_rate+mod))

      when 12 # LFO2 Amount
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        lfo2_amount = Math.max(0,Math.min(1,lfo2_amount+mod))

      when 13 # LFO2 Rate
        mod = (@inputs.modulation.amount-.5)*2*@modulation
        lfo2_rate = Math.max(0,Math.min(1,lfo2_rate+mod))


    switch @inputs.env2.out
      when 0 # Filter Cutoff
        cutoff += @env2.process(@on)*(@env2_amount*2-1)

      when 1 # Filter Resonance
        q = Math.max(0,Math.min(1,@env2.process(@on)*(@env2_amount*2-1)))

      when 2 # Pitch
        mod = @env2_amount*2-1
        mod *= @env2.process(@on)
        mod = 1+mod
        osc1_freq *= mod
        osc2_freq *= mod

      when 3 # Mod
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 4 # Amp
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc1_amp *= Math.max(0,1+mod)
        osc2_amp *= Math.max(0,1+mod)
        noise_amp *= Math.max(0,1+mod)

      when 5 #Osc1 Pitch
        mod = @env2_amount*2-1
        mod *= @env2.process(@on)
        osc1_freq *= 1+mod

      when 6 #Osc1 Mod
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))

      when 7 #Osc1 Amp
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc1_amp = Math.max(0,osc1_amp+mod)

      when 8 #Osc2 Pitch
        mod = @env2_amount*2-1
        mod *= @env2.process(@on)
        osc1_freq *= 1+mod

      when 9 #Osc2 Mod
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 10 #Osc2 Amp
        mod = @env2.process(@on)*(@env2_amount*2-1)
        osc2_amp = Math.max(0,osc2_amp+mod)

      when 11 # Noise amp
        mod = @env2.process(@on)*(@env2_amount*2-1)
        noise_amp = Math.max(0,noise_amp+mod)

      when 12 # Noise color
        mod = @env2.process(@on)*(@env2_amount*2-1)
        noise_mod = Math.min(1,Math.max(0,noise_mod+mod))

      when 13 # LFO1 Amount
        mod = @env2.process(@on)*(@env2_amount*2-1)
        lfo1_amount = Math.min(1,Math.max(0,lfo1_amount+mod))

      when 14 # LFO1 rate
        mod = @env2.process(@on)*(@env2_amount*2-1)
        lfo1_rate = Math.min(1,Math.max(0,lfo1_rate+mod))

      when 15 # LFO2 Amount
        mod = @env2.process(@on)*(@env2_amount*2-1)
        lfo2_amount = Math.min(1,Math.max(0,lfo2_amount+mod))

      when 16 # LFO2 rate
        mod = @env2.process(@on)*(@env2_amount*2-1)
        lfo2_rate = Math.min(1,Math.max(0,lfo2_rate+mod))

    switch @inputs.lfo1.out
      when 0 # Pitch
        mod = lfo1_amount
        if @inputs.lfo1.audio
          mod = 1+mod*mod*@lfo1.process(lfo1_rate)*16
        else
          mod = 1+mod*mod*@lfo1.process(lfo1_rate)
        osc1_freq *= mod
        osc2_freq *= mod

      when 1 # Mod
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 2 # Amp
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc1_amp *= Math.max(0,1+mod)
        osc2_amp *= Math.max(0,1+mod)
        noise_amp *= Math.max(0,1+mod)

      when 3 #Osc1 Pitch
        mod = lfo1_amount
        mod = 1+mod*mod*@lfo1.process(lfo1_rate)
        osc1_freq *= mod

      when 4 #Osc1 Mod
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))

      when 5 #Osc1 Amp
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc1_amp = Math.max(0,osc1_amp+mod)

      when 6 #Osc2 Pitch
        mod = lfo1_amount
        mod = 1+mod*mod*@lfo1.process(lfo1_rate)
        osc2_freq *= mod

      when 7 #Osc2 Mod
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 8 #Osc2 Amp
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        osc2_amp = Math.max(0,osc2_amp+mod)

      when 9 # Noise amp
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        noise_amp = Math.max(0,noise_amp+mod)

      when 10 # Noise color
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        noise_mod = Math.min(1,Math.max(0,noise_mod+mod))

      when 11
        cutoff += @lfo1.process(lfo1_rate)*lfo1_amount

      when 12
        q = Math.max(0,Math.min(1,@lfo1.process(lfo1_rate)*lfo1_amount))

      when 13 # LFO2 Amount
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        lfo2_amount = Math.min(1,Math.max(0,lfo2_amount+mod))

      when 14 # LFO2 rate
        mod = @lfo1.process(lfo1_rate)*lfo1_amount
        lfo2_rate = Math.min(1,Math.max(0,lfo2_rate+mod))


    switch @inputs.lfo2.out
      when 0 # Pitch
        mod = lfo2_amount
        if @inputs.lfo2.audio
          mod = 1+mod*mod*@lfo2.process(lfo2_rate)*16
        else
          mod = 1+mod*mod*@lfo2.process(lfo2_rate)
        osc1_freq *= mod
        osc2_freq *= mod

      when 1 # Mod
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 2 # Amp
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc1_amp *= Math.max(0,1+mod)
        osc2_amp *= Math.max(0,1+mod)
        noise_amp *= Math.max(0,1+mod)

      when 3 #Osc1 Pitch
        mod = lfo2_amount
        mod = 1+mod*mod*@lfo2.process(lfo2_rate)
        osc1_freq *= mod

      when 4 #Osc1 Mod
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc1_mod = Math.min(1,Math.max(0,osc1_mod+mod))

      when 5 #Osc1 Amp
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc1_amp = Math.max(0,osc1_amp+mod)

      when 6 #Osc2 Pitch
        mod = lfo2_amount
        mod = 1+mod*mod*@lfo2.process(lfo2_rate)
        osc2_freq *= mod

      when 7 #Osc2 Mod
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc2_mod = Math.min(1,Math.max(0,osc2_mod+mod))

      when 8 #Osc2 Amp
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        osc2_amp = Math.max(0,osc2_amp+mod)

      when 9 # Noise amp
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        noise_amp = Math.max(0,noise_amp+mod)

      when 10 # Noise color
        mod = @lfo2.process(lfo2_rate)*lfo2_amount
        noise_mod = Math.min(1,Math.max(0,noise_mod+mod))

      when 11
        cutoff += @lfo2.process(lfo2_rate)*lfo2_amount

      when 12
        q = Math.max(0,Math.min(1,@lfo2.process(lfo2_rate)*lfo2_amount))

    # switch @inputs.combine
    #   when 1
    #     s1 = @osc1.process(osc1_freq,osc1_mod)*osc1_amp
    #     s2 = @osc2.process(osc2_freq,osc2_mod)*osc2_amp
    #     sig = (s1+s2)*(s1+s2)
    #     #sig = @osc1.process(osc1_freq,osc1_mod)*@osc2.process(osc2_freq,osc2_mod)*Math.max(osc1_amp,osc2_amp)*4
    #   when 2
    #     sig = @osc2.process(osc2_freq*Math.max(0,1-@osc1.process(osc1_freq,osc1_mod)*osc1_amp),osc2_mod)*osc2_amp
    #   else

    if @osc1_on
      if @osc2_on
        sig = @osc1.process(osc1_freq,osc1_mod)*osc1_amp+@osc2.process(osc2_freq,osc2_mod)*osc2_amp
      else
        sig = @osc1.process(osc1_freq,osc1_mod)*osc1_amp
    else if @osc2_on
      sig = @osc2.process(osc2_freq,osc2_mod)*osc2_amp
    else
      sig = 0

    if @noise_on
      sig += @noise.process(noise_mod)*noise_amp

    mod = @env2.process(@on)

    if not @cutoff
      @cutoff = cutoff
    else
      if @cutoff<cutoff
        @cutoff += Math.min(cutoff-@cutoff,@filter_increment)
      else if @cutoff>cutoff
        @cutoff += Math.max(cutoff-@cutoff,-@filter_increment)

      cutoff = @cutoff

    # VCF
    cutoff = Math.pow(2,Math.max(0,Math.min(cutoff,1))*10)*22000/1024

    sig *= @env1.process(@on)

      #@cutoff += 0.001*(cutoff-@cutoff)

    sig = @filter.process(sig,cutoff,q*q*9.5+.5)
