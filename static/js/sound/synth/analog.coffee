class @Analog
  constructor:()->
    @osc1_wave = 0
    @osc1_pw = 0
    @osc1_pitch = 0
    @osc1_tune = 0
    @osc1_amp = 0

    @osc2_wave = 0
    @osc2_pw = 0
    @osc2_pitch = 0
    @osc2_tune = 0
    @osc2_amp = 0

    @noise_type = 0
    @noise_amp = 0

    @filter_type = 0
    @filter_cutoff = 0
    @filter_resonance = 0

    @lfo1_wave = 0
    @lfo1_rate = 0
    @lfo1_out1 = 0
    @lfo1_out2 = 0
    @lfo1_out1_target = 0
    @lfo1_out2_target = 0

    @lfo2_wave = 0
    @lfo2_rate = 0
    @lfo2_out1 = 0
    @lfo2_out2 = 0
    @lfo2_out1_target = 0
    @lfo2_out2_target = 0

    @env1_a = 0
    @env1_d = 0
    @env1_s = 0
    @env1_r = 0
    @env1_out1 = 0
    @env1_out2 = 0

    @env2_a = 0
    @env2_d = 0
    @env2_s = 0
    @env2_r = 0
    @env2_out1 = 0
    @env2_out2 = 0

    @glide = 0

    # modulation sources
    # * keyboard
    # * velocity
    # * mod wheel
    # * envelope1
    # * envelope2
    # * lfo1
    # * lfo2
