/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import { Realm } from './realm';

const PARAMS = [];
let nextPort;

if (typeof AudioWorkletNode !== 'function') {
  self.AudioWorkletNode = function AudioWorkletNode (context, name, options) {
    const processor = getProcessorsForContext(context)[name];
    const outputChannels = options && options.outputChannelCount ? options.outputChannelCount[0] : 2;
    const scriptProcessor = context.createScriptProcessor(undefined, 2, outputChannels);

    scriptProcessor.parameters = new Map();
    if (processor.properties) {
      for (let i = 0; i < processor.properties.length; i++) {
        const prop = processor.properties[i];
        const node = context.createGain().gain;
        node.value = prop.defaultValue;
        // @TODO there's no good way to construct the proxy AudioParam here
        scriptProcessor.parameters.set(prop.name, node);
      }
    }

    const mc = new MessageChannel();
    nextPort = mc.port2;
    const inst = new processor.Processor(options || {});
    nextPort = null;

    scriptProcessor.port = mc.port1;
    scriptProcessor.processor = processor;
    scriptProcessor.instance = inst;
    scriptProcessor.onaudioprocess = onAudioProcess;
    return scriptProcessor;
  };

  Object.defineProperty((self.AudioContext || self.webkitAudioContext).prototype, 'audioWorklet', {
    get () {
      return this.$$audioWorklet || (this.$$audioWorklet = new self.AudioWorklet(this));
    }
  });

  self.AudioWorklet = class AudioWorklet {
    constructor (audioContext) {
      this.$$context = audioContext;
    }

    addModule (url, options) {
      return fetch(url).then(r => {
        if (!r.ok) throw Error(r.status);
        return r.text();
      }).then(code => {
        const context = {
          sampleRate: 0,
          currentTime: 0,
          AudioWorkletProcessor () {
            this.port = nextPort;
          },
          registerProcessor: (name, Processor) => {
            const processors = getProcessorsForContext(this.$$context);
            processors[name] = {
              realm,
              context,
              Processor,
              properties: Processor.parameterDescriptors || []
            };
          }
        };
        context.self = context;
        const realm = new Realm(context, document.documentElement);
        realm.exec(((options && options.transpile) || String)(code));
        return null;
      });
    }
  };
}

function onAudioProcess (e) {
  const parameters = {};
  let index = -1;
  this.parameters.forEach((value, key) => {
    const arr = PARAMS[++index] || (PARAMS[index] = new Float32Array(this.bufferSize));
    // @TODO proper values here if possible
    arr.fill(value.value);
    parameters[key] = arr;
  });
  this.processor.realm.exec(
    'self.sampleRate=sampleRate=' + this.context.sampleRate + ';' +
    'self.currentTime=currentTime=' + this.context.currentTime
  );
  const inputs = channelToArray(e.inputBuffer);
  const outputs = channelToArray(e.outputBuffer);
  this.instance.process([inputs], [outputs], parameters);

  // @todo - keepalive
  // let ret = this.instance.process([inputs], [outputs], parameters);
  // if (ret === true) { }
}

function channelToArray (ch) {
  const out = [];
  for (let i = 0; i < ch.numberOfChannels; i++) {
    out[i] = ch.getChannelData(i);
  }
  return out;
}

function getProcessorsForContext (audioContext) {
  return audioContext.$$processors || (audioContext.$$processors = {});
}
