import recorderWorker from './recorderWorker';
import InlineWorker from 'inline-worker';
const worker = new InlineWorker(recorderWorker);

export default class Recorder {
  constructor(source, cfg) {
    this.config = Object.assign({}, {
      rate: source.context.sampleRate,
      sampleRate: source.context.sampleRate,
      numChannels: 2,
      bufferLen: 4096,
      type: 'audio/wav',
    }, cfg);
    this.bufferLen = this.config.bufferLen;
    this.context = source.context;
    this.node = (
      this.context.createScriptProcessor ||
      this.context.createJavaScriptNode
    ).call(this.context, this.bufferLen, 2, 2);
    // worker = new InlineWorker(recorderWorker);
    this.recording = false;
    this.callback = () => {};

    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.config.sampleRate,
        numChannels: this.config.numChannels
      }
    });

    this.init(source);
  }

  init(source) {
    const that = this;

    worker.onmessage = e => {
      const blob = e.data;
      that.callback(blob);
    }

    this.node.onaudioprocess = e => {
      if (!that.recording) return;
      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
        ]
      });
    }

    source.connect(that.node);
    this.node.connect(that.context.destination);
  }

  configure(cfg) {
    Object.assign({}, this.config, cfg);
  }

  record() {
    this.recording = true;
  }

  stop() {
    this.recording = false;
  }

  clear() {
    worker.postMessage({ command: 'clear' });
  }

  getBuffer(cb) {
    this.callback = cb || this.config.callback;
    worker.postMessage({ command: 'getBuffer' })
  }

  exportWAV(cb, _type, _rate) {
    this.callback = cb || this.config.callback;
    // todo add mime type to constructor
    const type = _type || this.config.type;
    const rate = _rate || this.config.rate;
    if (!this.callback) throw new Error('Callback not set');
    worker.postMessage({
      command: 'exportWAV',
      type: type,
      rate: rate
    });
  }
}
