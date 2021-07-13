class @Oscillator
  constructor:()->
    @inputs = [{
          type: "select"
          options: ["saw","square","sine","noise"]
          value: "saw"
        },{
          type: "signal"
        }
    ]

  getState:()->
    phase: 0

  getProcessor:()->
    (context,type,freq,state,output)->
      switch type
        when "saw"
          sr = context.sampleRate
          for i in [0..output.length-1]
            output[i] = 1-2*state.phase
            state.phase += freq[i]/sr
            state.phase -= 1 if state.phase>=1

        when "square"
          sr = context.sampleRate
          for i in [0..output.length-1]
            output[i] = 1-2*state.phase
            state.phase += freq[i]/sr
            state.phase -= 1 if state.phase>=1
      return
