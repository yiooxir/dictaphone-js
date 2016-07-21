import recorderWorker from './recorderWorker';
import InlineWorker from 'inline-worker';

export default class Recorder {
  constructor(source, cfg) {
    this.config = cfg || {};
    this.bufferLen = this.config.bufferLen || 4096;
    this.context = source.context;
    this.node = (this.context.createScriptProcessor ||
    this.context.createJavaScriptNode).call(this.context, this.bufferLen, 2, 2);
    // this.worker = new Worker();
    this.worker = new InlineWorker(recorderWorker);
    this.recording = false;
    this.callback = () => {};

    this.worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate
      }
    });

    this.init(source);
  }

  init(source) {
    const that = this;

    this.worker.onmessage = e => {
      const blob = e.data;
      that.callback(blob);
    }

    this.node.onaudioprocess = e => {
      if (!that.recording) return;
      this.worker.postMessage({
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
    this.worker.postMessage({ command: 'clear' });
  }

  getBuffer(cb) {
    this.callback = cb || this.config.callback;
    this.worker.postMessage({ command: 'getBuffer' })
  }

  exportWAV(cb, _type) {
    this.callback = cb || this.config.callback;
    // todo add mime type to constructor
    const type = _type || this.config.type || 'audio/wav';
    if (!this.callback) throw new Error('Callback not set');
    this.worker.postMessage({
      command: 'exportWAV',
      type: type
    });
  }
}
