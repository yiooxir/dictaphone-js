import Recorder from './Recorder';

const defaultConfig = {
  worker: null,
  workerPath: 'recordWorker',
};

export const events = {
  PLAY: 'play',
  PAUSE: 'pause',
  START_REC: 'startRecording',
  STOP_REC: 'stopRecording',
  PROGRESS: 'progress',
  PAUSE: 'pause',
  REWIND: 'rewind',
  ERROR: 'error'
};

export default class Dictaphone {
  constructor(player, config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.player = player;
    this.recorder = this.getRecorder();
    this.playing = false;
    this.recording = false;
    this.master_recording = null;
    this.progressBarStep = 0.1; // in sec;
    this.subscribers = {};
  }

  destroy() {
    this.subscribers = [];
    // todo remove media URL
  }

  on(message, callback) {
    if (!this.subscribers[message]) {
      this.subscribers[message] = [];
    }
    this.subscribers[message].push(callback);
  }

  emit(message, data) {
    if(!this.subscribers[message]) return;
    this.subscribers[message].forEach(e => e(data));
  }

  startRecording () {
    if (this.recording || this.playing) {
      return;
    }

    this.recorder && this.recorder.record();
    this.recording = true;
    this.emit(events.START_REC, {position: this.player.currentTime});
  }

  stopRecording() {
    const that = this;

    if (!this.recording) {
      return;
    }

    this.recorder && this.recorder.stop();
    this.recording = false;
    this._createMasterRecording(() => {
      setTimeout(() => {this.emit(events.STOP_REC, {duration: that.player.duration})}, 200);
    });
    this.recorder.clear();
  }

  togglePlayback () {
    this.playing ? this.pause() : this.play();
  }

  play() {
    let _time = this.player.currentTime;

    if (_time >= this.player.duration) {
      return;
    }

    this.playing = true;
    this.emit(events.PLAY, {time: this.player.currentTime});
    this.player.play();

    const loop = setInterval(() => {
      if( this.playing && _time < this.player.duration ) {
        this.emit(events.PROGRESS, {time: this.player.currentTime, duration: this.player.duration});
        _time = _time + this.progressBarStep;
      } else {
        clearInterval(loop);
        this.playing = false;
        this.emit(events.PAUSE, {time: this.player.currentTime})
      }
    }, this.progressBarStep * 1000);
  }

  pause() {
    if (this.recording) {
      this.emit(events.ERROR, 'Protect to call pause while recording');
    }
    this.playing = false;
    this.player.pause();
    this.emit(events.PAUSE, {time: this.player.currentTime})
  }

  rewind(time) {
    let _time = time;

    if (this.recording || time < 0) {
      this.emit(events.ERROR, 'Protect to call rewind while recording');
      return;
    }

    this.playing && this.pause();

    if (time > this.player.duration) {
      _time = this.player.duration;
    }

    this.player.currentTime = _time;

    this.emit(events.REWIND, {toTime: _time});
  }

  rewindToBegin() {
    this.rewind(0);
  }

  rewindToEnd() {
    this.rewind(this.player.duration);
  }

  _createMasterRecording(callback) {
    const that = this;
    this.recorder && this.recorder.exportWAV((blob) => {
      if(that.master_recording){
        that._concatenateRecordings(that.master_recording, blob, (blob) => callback(blob));
      } else {
        that.master_recording = blob;
        that.player.src = URL.createObjectURL(that.master_recording);
        callback(blob);
      }
    });
  }

  _concatenateRecordings(blob1, blob2, callback) {
    const duration = this.player.duration;
    const position = this.player.currentTime;
    const blob1Size = blob1.size-44;
    let blob2_data = blob2.slice(44);
    let blob1_data = blob1.slice(44, (blob1Size/duration)*position)

    if(blob1_data.size%2 != 0)
      blob1_data = new Blob([blob1_data, new Blob([0])], {type: 'audio/wav'})



    if(blob2_data.size%2 != 0)
      blob2_data = new Blob([blob2_data, new Blob([0])], {type: 'audio/wav'})

    let concatenated_blob = new Blob([blob1_data, blob2_data], {type: 'audio/wav'})

    if(concatenated_blob.size % 2 != 0)
      concatenated_blob = new Blob([concatenated_blob, new Blob([0])], {type: 'audio/wav'})


    let header = blob2.slice(0,44)

    let fr = new FileReader()
    fr.readAsArrayBuffer(header)

    fr.onload = () => {
      const view = new DataView(fr.result)
      view.setUint32(4, 36+concatenated_blob.size, true)
      view.setUint32(40, concatenated_blob.size, true)
      this.master_recording = new Blob([view, concatenated_blob], {type: 'audio/wav'})
      this.player.src = URL.createObjectURL(this.master_recording);
      callback(this.master_recording);
    }
  }

  getRecorder() {
    try{
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
    } catch(e){
      console.warn('No web audio support in this browser!');
      this.emit('error', 'No web audio support in this browser!')
    }

    navigator.getUserMedia({audio: true}, stream => this.startUserMedia(stream), (e) => {
      console.warn('No live audio input: ' + e);
      this.emit('error', 'No live audio input: ' + e);
    });
  }

  startUserMedia(stream) {
    const audio_context = new AudioContext();

    const input = audio_context.createMediaStreamSource(stream)
    this.recorder = new Recorder(input, this.config);
  }
}
