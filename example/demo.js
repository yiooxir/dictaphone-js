'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _recordAudioJs = require('record-audio-js');

var _recordAudioJs2 = _interopRequireDefault(_recordAudioJs);

require('./demo.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function __log(e, data) {
  var _e = (typeof e === 'undefined' ? 'undefined' : _typeof(e)) === 'object' ? JSON.stringify(e) : e;
  log.innerHTML += "<p>" + _e + " " + (data || '') + "</p>";
}

function createDict() {
  var player = document.getElementById("player"),
      player_time = document.getElementById("time"),
      rec = document.getElementById("rec"),
      stop = document.getElementById("stop"),
      pp = document.getElementById("play_pause"),
      rew = document.getElementById("rew"),
      ff = document.getElementById("ff"),
      pb = document.getElementById("progress_bar"),
      save = document.getElementById("save");

  var dictaphone = new _recordAudioJs2.default(player, {
    numChannels: 1, // Mono
    rate: 16000 // 16kHz
  });
  rec.addEventListener("click", function () {
    dictaphone.startRecording();
  });
  stop.addEventListener("click", function () {
    dictaphone.stopRecording();
  });
  pp.addEventListener("click", function () {
    dictaphone.togglePlayback();
  });
  rew.addEventListener("click", function () {
    dictaphone.rewind(3);
  });
  ff.addEventListener("click", function () {
    dictaphone.rewind(0);
  });

  function updateProgress(time, duration) {
    console.log(123, arguments);
    player_time.innerHTML = (0, _recordAudioJs.formatTime)(time) + " / " + (0, _recordAudioJs.formatTime)(duration);
    if (time > 0 && time <= duration) pb.value = time;else pb.value = 0;
    pb.max = duration;
  }

  dictaphone.on('progress', function (data) {
    return updateProgress(data.time, data.duration);
  });
  Object.keys(_recordAudioJs.events).forEach(function (key) {
    return dictaphone.on(_recordAudioJs.events[key], function (data) {
      return key !== 'progress' && __log(key + ': ' + JSON.stringify(data));
    });
  });

  // save.addEventListener("click", function(){exportWAV()})
}

(function (window) {
  document.addEventListener("DOMContentLoaded", createDict);
})(window);
