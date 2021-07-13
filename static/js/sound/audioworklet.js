// AudioWorklet polyfill
// Jari Kleimola 2017-18 (jari@webaudiomodules.org)
//
// loosely based on https://github.com/GoogleChromeLabs/houdini-samples/blob/master/animation-worklet/anim-worklet.js
// feature detection borrowed from Google's AudioWorklet demo page
//
AudioContext = window.AudioContext || window.webkitAudioContext;

(function(scope) {
  "use strict";

  // namespace to avoid global scope pollution
  window.AWPF = window.AWPF || {}
  AWPF.hasSAB = window.SharedArrayBuffer !== undefined;
  AWPF.origin = "";

  // --------------------------------------------------------------------------
  //
  //
  AWPF.PolyfillAudioWorklet = function() {
    var imports = {};
    var importedScripts = [];

    function importOnWorker(src) {
      if (!AWPF.worker.onmessage) AWPF.worker.onmessage = onmessage;
      return new Promise(function(resolve, reject) {
        if (importedScripts.indexOf(src) < 0) {
          imports[src] = { resolve:resolve, reject:reject };
          AWPF.worker.postMessage({ type:"import", url:src });
          importedScripts.push(src);
        }
        else resolve();
      });
    }

    var onmessage = function (e) {
      var msg = e.data;
      switch (msg.type) {
        case "load":
          var script = imports[msg.url];
          if (script) {
            if (!msg.error) script.resolve();
            else script.reject(Error('Failed to load ' + msg.url));
            delete imports[msg.url];
          }
          else console.log("throw: already registered");
          // else throw new Error("InvalidStateError");
          break;
        case "register":
          AWPF.descriptorMap[msg.name] = msg.descriptor;
          break;
        case "state":
          var node = AWPF.workletNodes[msg.node];
          if (node) {
            if (msg.state == "running")
              node.processor = msg.processor;
            var event = new CustomEvent('statechange', { detail: msg.state });
            node.onprocessorstatechange(event);
          }
          break;
        case "process":
          var node = AWPF.workletNodes[msg.node];
          node.onRender(msg.buf);
          break;
      }
    }

    return { addModule:importOnWorker }
  }

  // --------------------------------------------------------------------------
  //
  //
  AWPF.AudioWorkletNode = function (context, nodeName, options) {

    if (AWPF.descriptorMap[nodeName] === undefined)
      throw new Error("NotSupportedException");
    // TODO step 9

    this.id = AWPF.workletNodes.length;
    AWPF.workletNodes.push(this);

    var messageChannel = new MessageChannel();
    this.port = messageChannel.port1;

    // -- SPN min bufsize is 256, and it has max one input and max one output port
    //
    options = options || {}
    options.buflenAWP = options.buflenAWP || 128;
    options.buflenSPN = options.buflenSPN || 256;
    options.numberOfInputs = options.numberOfInputs || 0;
    if (options.numberOfOutputs === undefined)      options.numberOfOutputs = 1;
    if (options.outputChannelCount === undefined)   options.outputChannelCount = [1];
    if (options.inputChannelCount === undefined)    options.inputChannelCount  = [];
  //if (options.inputChannelCount.length  != options.numberOfInputs)  throw new Error("InvalidArgumentException");
    if (options.outputChannelCount.length != options.numberOfOutputs) throw new Error("InvalidArgumentException");

    var nslices = (options.buflenSPN / options.buflenAWP) | 0;
    var bytesPerBuffer = options.buflenAWP * nslices * 4;

    function configurePort (type, options) {
      var nports = (type == "input") ? options.numberOfInputs : options.numberOfOutputs;
      if (nports > 0) {
        var nchannels = 0;
        var channelCount = (type == "input") ? options.inputChannelCount : options.outputChannelCount;
        if (channelCount.length > 0) nchannels = channelCount[0];
        if (nchannels <= 0) throw new Error("InvalidArgumentException");
        var port = new Array(nchannels);
        for (var c=0; c<nchannels; c++)
          if (AWPF.hasSAB)
            port[c] = new SharedArrayBuffer(bytesPerBuffer);
          else {
            port[c] = new Array(2);
            for (var pingpong = 0; pingpong < 2; pingpong++) {
              var ab = new ArrayBuffer(bytesPerBuffer);
              port[c][pingpong] = new Float32Array(ab);
            }
          }
        return port;
      }
      return null;
    }

    // -- io configuration is currently static
    var audioIn  = configurePort("input",  options);
    var audioOut = configurePort("output", options);

    // -- create processor
    this.processorState = "pending";
    var args = { node:this.id, name:nodeName, options:options, hasSAB:AWPF.hasSAB }
    args.audio = { input:audioIn, output:audioOut }
    AWPF.worker.postMessage({ type:"createProcessor", args:args }, [messageChannel.port2])

    this.onprocessorstatechange = function (e) {
      this.processorState = e.detail;
      if (!AWPF.hasSAB && this.processorState == "running")
        render();
      console.log("state:", e.detail);
    }

    // -- fix for blocked SABs -------------------------------------------------

    if (!AWPF.hasSAB) {
      var curbuf = 0;
      var newBufferAvailable = false;
      var self = this;

      var render = function () {
        var msg = { type:"process", processor:self.processor, time:context.currentTime, buf:[] };
        for (var c=0; c<audioOut.length; c++)
          msg.buf.push(audioOut[c][curbuf].buffer);
        AWPF.worker.postMessage(msg, msg.buf);
        curbuf = ((curbuf + 1) % 2) | 0;
        newBufferAvailable = false;
      }

      this.onRender = function (buf) {
        audioOut[0][curbuf ? 0:1] = new Float32Array(buf[0]);
        audioOut[1][curbuf ? 0:1] = new Float32Array(buf[1]);
        newBufferAvailable = true;
      }
    }

    // -- ScriptProcessorNode -------------------------------------------------

    let ninChannels  = options.inputChannelCount[0] || 0;
    let noutChannels = options.outputChannelCount[0];
    var spn = context.createScriptProcessor(options.buflenSPN, ninChannels, noutChannels);
    this.input = spn;

    this.connect = function (dst) {
      spn.onaudioprocess = onprocess.bind(this);
      spn.connect(dst)
    }

    this.disconnect = function () {
      spn.onaudioprocess = null;
      spn.disconnect();
    }

    if (AWPF.hasSAB)  var outbuf = new Float32Array(audioOut[0]);  // spn limitation

    var onprocess = function (ape) {
      if (this.processor === undefined) return;

      var ibuff = ape.inputBuffer;
      var obuff = ape.outputBuffer;
      var outL  = obuff.getChannelData(0);

      if (AWPF.hasSAB) {
        outL.set(outbuf);
        var msg = { type:"process", processor:this.processor, time:context.currentTime };
        AWPF.worker.postMessage(msg);
      }
      else {
        for (var c=0; c<audioOut.length; c++)
          obuff.getChannelData(c).set(audioOut[c][curbuf]);
        if (newBufferAvailable)
          render();
      }
    }
  }

  // --------------------------------------------------------------------------

  // -- borrowed from Google's AudioWorklet demo page
  AWPF.AudioWorkletAvailable = function (actx) {
    return actx.audioWorklet &&
      actx.audioWorklet instanceof AudioWorklet &&
      typeof actx.audioWorklet.addModule === 'function' &&
      window.AudioWorkletNode;
  }

  AWPF.polyfill = function (scope, forcePolyfill) {
    return new Promise( function (resolve) {

      if (!forcePolyfill && AWPF.AudioWorkletAvailable(scope))
        resolve();
      else {
        AWPF.descriptorMap = {}; // node name to parameter descriptor map (should be in BAC)
        AWPF.workletNodes  = [];
        AWPF.audioWorklet = AWPF.PolyfillAudioWorklet();
        AWPF.context = scope;
        if (!forcePolyfill || !AWPF.AudioWorkletAvailable(scope))
          scope.audioWorklet = AWPF.audioWorklet;
        window.AudioWorkletNode = AWPF.AudioWorkletNode;

        fetch(AWPF.origin + "audioworker.js").then(function (resp) {
          resp.text().then(function (s) {
            var u = window.URL.createObjectURL(new Blob([s]));
            AWPF.worker = new Worker(u);
            AWPF.worker.postMessage({ type:"init", sampleRate:scope.sampleRate });

            console.warn('Using Worker polyfill of AudioWorklet');
            AWPF.isAudioWorkletPolyfilled = true;
            resolve();
          })
        })
      }
    })
  }
})();
