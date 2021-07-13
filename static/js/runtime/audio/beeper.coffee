class @Beeper
  constructor:(@audio)->
    @notes = {}
    @plain_notes = {}

    text = [
      ["C","DO"]
      ["C#","DO#","Db","REb"]
      ["D","RE"]
      ["D#","RE#","Eb","MIb"]
      ["E","MI"]
      ["F","FA"]
      ["F#","FA#","Gb","SOLb"]
      ["G","SOL"]
      ["G#","SOL#","Ab","LAb"]
      ["A","LA"]
      ["A#","LA#","Bb","SIb"]
      ["B","SI"]
    ]

    for i in [0..127] by 1
      @notes[i] = i
      oct = Math.floor(i/12)-1
      for n in text[i%12]
        @notes[n+oct] = i

      if oct == -1
        for n in text[i%12]
          @plain_notes[n] = i

    @current_octave = 5
    @current_duration = .5
    @current_volume = .5
    @current_span = 1
    @current_waveform = "square"

  beep:(input)->
    test = "loop 0 square tempo 120 duration 500 volume 50 span 50 DO2 DO - FA SOL SOL FA -"
    status = "normal"

    sequence = []
    loops = []

    parsed = input.split(" ")
    for t in parsed
      continue if t == ""
      switch status
        when "normal"
          if @notes[t]?
            note = @notes[t]
            @current_octave = Math.floor(note/12)
            sequence.push
              frequency: 440*Math.pow(Math.pow(2,1/12),note-69)
              volume: @current_volume
              span: @current_span
              duration: @current_duration
              waveform: @current_waveform

          else if @plain_notes[t]?
            note = @plain_notes[t]+@current_octave*12
            sequence.push
              frequency: 440*Math.pow(Math.pow(2,1/12),note-69)
              volume: @current_volume
              span: @current_span
              duration: @current_duration
              waveform: @current_waveform

          else if t in ["square","sine","saw","noise"]
            @current_waveform = t
          else if t in ["tempo","duration","volume","span","loop","to"]
            status = t
          else if t == "-"
            sequence.push
              frequency: 440
              volume: 0
              span: @current_span
              duration: @current_duration
              waveform: @current_waveform
          else if t == "end"
            if loops.length>0 and sequence.length>0
              sequence.push
                frequency: 440
                volume: 0
                span: @current_span
                duration: 0
                waveform: @current_waveform

              lop = loops.splice(loops.length-1,1)[0]
              sequence[sequence.length-1].loopto = lop.start
              sequence[sequence.length-1].repeats = lop.repeats

        when "tempo"
          status = "normal"
          t = Number.parseFloat(t)
          if not Number.isNaN(t) and t>0
            @current_duration = 60/t

        when "duration"
          status = "normal"
          t = Number.parseFloat(t)
          if not Number.isNaN(t) and t>0
            @current_duration = t/1000

        when "volume"
          status = "normal"
          t = Number.parseFloat(t)
          if not Number.isNaN(t)
            @current_volume = t/100

        when "span"
          status = "normal"
          t = Number.parseFloat(t)
          if not Number.isNaN(t)
            @current_span = t/100

        when "loop"
          status = "normal"
          loops.push
            start: sequence.length
          t = Number.parseFloat(t)
          if not Number.isNaN(t)
            loops[loops.length-1].repeats = t

        when "to"
          status = "normal"
          if note?
            n = null

            if @notes[t]?
              n = @notes[t]
            else if @plain_notes[t]?
              n = @plain_notes[t]+@current_octave*12

            if n? and n != note
              for i in [note..n]
                if i != note
                  sequence.push
                    frequency: 440*Math.pow(Math.pow(2,1/12),i-69)
                    volume: @current_volume
                    span: @current_span
                    duration: @current_duration
                    waveform: @current_waveform
              note = n

    if loops.length>0 and sequence.length>0
      lop = loops.splice(loops.length-1,1)[0]
      sequence.push
        frequency: 440
        volume: 0
        span: @current_span
        duration: 0
        waveform: @current_waveform

      sequence[sequence.length-1].loopto = lop.start
      sequence[sequence.length-1].repeats = lop.repeats

    @audio.addBeeps(sequence)
