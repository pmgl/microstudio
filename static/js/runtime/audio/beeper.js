this.Beeper = (function() {
  function Beeper(audio) {
    var i, j, k, l, len, len1, n, oct, ref, ref1, text;
    this.audio = audio;
    this.notes = {};
    this.plain_notes = {};
    text = [["C", "DO"], ["C#", "DO#", "Db", "REb"], ["D", "RE"], ["D#", "RE#", "Eb", "MIb"], ["E", "MI"], ["F", "FA"], ["F#", "FA#", "Gb", "SOLb"], ["G", "SOL"], ["G#", "SOL#", "Ab", "LAb"], ["A", "LA"], ["A#", "LA#", "Bb", "SIb"], ["B", "SI"]];
    for (i = j = 0; j <= 127; i = j += 1) {
      this.notes[i] = i;
      oct = Math.floor(i / 12) - 1;
      ref = text[i % 12];
      for (k = 0, len = ref.length; k < len; k++) {
        n = ref[k];
        this.notes[n + oct] = i;
      }
      if (oct === -1) {
        ref1 = text[i % 12];
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          n = ref1[l];
          this.plain_notes[n] = i;
        }
      }
    }
    this.current_octave = 5;
    this.current_duration = .5;
    this.current_volume = .5;
    this.current_span = 1;
    this.current_waveform = "square";
  }

  Beeper.prototype.beep = function(input) {
    var i, j, k, len, loops, lop, n, note, parsed, ref, ref1, sequence, status, t, test;
    test = "loop 0 square tempo 120 duration 500 volume 50 span 50 DO2 DO - FA SOL SOL FA -";
    status = "normal";
    sequence = [];
    loops = [];
    parsed = input.split(" ");
    for (j = 0, len = parsed.length; j < len; j++) {
      t = parsed[j];
      if (t === "") {
        continue;
      }
      switch (status) {
        case "normal":
          if (this.notes[t] != null) {
            note = this.notes[t];
            this.current_octave = Math.floor(note / 12);
            sequence.push({
              frequency: 440 * Math.pow(Math.pow(2, 1 / 12), note - 69),
              volume: this.current_volume,
              span: this.current_span,
              duration: this.current_duration,
              waveform: this.current_waveform
            });
          } else if (this.plain_notes[t] != null) {
            note = this.plain_notes[t] + this.current_octave * 12;
            sequence.push({
              frequency: 440 * Math.pow(Math.pow(2, 1 / 12), note - 69),
              volume: this.current_volume,
              span: this.current_span,
              duration: this.current_duration,
              waveform: this.current_waveform
            });
          } else if (t === "square" || t === "sine" || t === "saw" || t === "noise") {
            this.current_waveform = t;
          } else if (t === "tempo" || t === "duration" || t === "volume" || t === "span" || t === "loop" || t === "to") {
            status = t;
          } else if (t === "-") {
            sequence.push({
              frequency: 440,
              volume: 0,
              span: this.current_span,
              duration: this.current_duration,
              waveform: this.current_waveform
            });
          } else if (t === "end") {
            if (loops.length > 0 && sequence.length > 0) {
              sequence.push({
                frequency: 440,
                volume: 0,
                span: this.current_span,
                duration: 0,
                waveform: this.current_waveform
              });
              lop = loops.splice(loops.length - 1, 1)[0];
              sequence[sequence.length - 1].loopto = lop.start;
              sequence[sequence.length - 1].repeats = lop.repeats;
            }
          }
          break;
        case "tempo":
          status = "normal";
          t = Number.parseFloat(t);
          if (!Number.isNaN(t) && t > 0) {
            this.current_duration = 60 / t;
          }
          break;
        case "duration":
          status = "normal";
          t = Number.parseFloat(t);
          if (!Number.isNaN(t) && t > 0) {
            this.current_duration = t / 1000;
          }
          break;
        case "volume":
          status = "normal";
          t = Number.parseFloat(t);
          if (!Number.isNaN(t)) {
            this.current_volume = t / 100;
          }
          break;
        case "span":
          status = "normal";
          t = Number.parseFloat(t);
          if (!Number.isNaN(t)) {
            this.current_span = t / 100;
          }
          break;
        case "loop":
          status = "normal";
          loops.push({
            start: sequence.length
          });
          t = Number.parseFloat(t);
          if (!Number.isNaN(t)) {
            loops[loops.length - 1].repeats = t;
          }
          break;
        case "to":
          status = "normal";
          if (note != null) {
            n = null;
            if (this.notes[t] != null) {
              n = this.notes[t];
            } else if (this.plain_notes[t] != null) {
              n = this.plain_notes[t] + this.current_octave * 12;
            }
            if ((n != null) && n !== note) {
              for (i = k = ref = note, ref1 = n; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
                if (i !== note) {
                  sequence.push({
                    frequency: 440 * Math.pow(Math.pow(2, 1 / 12), i - 69),
                    volume: this.current_volume,
                    span: this.current_span,
                    duration: this.current_duration,
                    waveform: this.current_waveform
                  });
                }
              }
              note = n;
            }
          }
      }
    }
    if (loops.length > 0 && sequence.length > 0) {
      lop = loops.splice(loops.length - 1, 1)[0];
      sequence.push({
        frequency: 440,
        volume: 0,
        span: this.current_span,
        duration: 0,
        waveform: this.current_waveform
      });
      sequence[sequence.length - 1].loopto = lop.start;
      sequence[sequence.length - 1].repeats = lop.repeats;
    }
    return this.audio.addBeeps(sequence);
  };

  return Beeper;

})();
