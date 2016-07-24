import Dictaphone, { events, formatTime } from 'record-audio-js';

import './demo.css';

function __log(e, data) {
  const _e = typeof e === 'object' ? JSON.stringify(e) : e;
  log.innerHTML += "<p>" + _e + " " + (data || '') + "</p>";
}

function createDict() {
  const player = document.getElementById("player"),
    player_time = document.getElementById("time"),
    rec = document.getElementById("rec"),
    stop = document.getElementById("stop"),
    pp = document.getElementById("play_pause"),
    rew = document.getElementById("rew"),
    ff = document.getElementById("ff"),
    pb = document.getElementById("progress_bar"),
    save = document.getElementById("save");

  const dictaphone = new Dictaphone(player);
  rec.addEventListener("click", function(){dictaphone.startRecording()})
  stop.addEventListener("click", function(){dictaphone.stopRecording()})
  pp.addEventListener("click", function(){dictaphone.togglePlayback()})
  rew.addEventListener("click", function(){dictaphone.rewind(3)})
  ff.addEventListener("click", function(){dictaphone.rewind(0)})

  function updateProgress(time, duration) {
    console.log(123, arguments)
    player_time.innerHTML = formatTime(time) +" / "+ formatTime(duration)
    if(time > 0 && time <= duration)
      pb.value = time
    else
      pb.value = 0
    pb.max = duration;
  }

  dictaphone.on('progress', data => updateProgress(data.time, data.duration));
  Object.keys(events).forEach(key => dictaphone.on(events[key], data => key !== 'progress' && __log(`${key}: ${JSON.stringify(data)}`)))


  // save.addEventListener("click", function(){exportWAV()})
}

(function(window) {
  document.addEventListener("DOMContentLoaded", createDict);

})(window);
