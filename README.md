# dictaphone-js
Voice recording library based only on WEB Audio API interface.
This library allows you to make a voice recording, play, pause and rewind record.
The library is fully modular. This means you can use **require** or **import** to get it.

## Demo and Example
```html
<!-- HTML -->
<div id='dictaphone'>
    <div id='playback_buttons'>
        <button id='rec'>Record</button>
        <button id='stop'>Stop</button>
        <button id='play_pause'>Play/Pause</button>
        <button id='rew'>Rewind</button>
        <button id='ff'>Fastforward</button>
        <button id='save'>Save</button>
    </div>
    <div id="recording_progress_bar">
        <progress value="0" min="0" max="0" id="progress_bar"></progress>
        <div id="progress_time"><b id="time">0:00 / 0:00</b></div>
    </div>
    <audio id='player'></audio>
</div>
```

```js

// --- JS CODE ---

const Dictaphone = require('dictaphone-js');

const player = document.getElementById("player"),
      rec = document.getElementById("rec"),
      stop = document.getElementById("stop"),
      pp = document.getElementById("play_pause"),
      rew = document.getElementById("rew"),
      ff = document.getElementById("ff");
    
// Create instance 
const dictaphone = new Dictaphone(player);    

  rec.addEventListener("click", function(){dictaphone.startRecording()});
  stop.addEventListener("click", function(){dictaphone.stopRecording()});
  pp.addEventListener("click", function(){dictaphone.togglePlayback()});
  rew.addEventListener("click", function(){dictaphone.rewind(0)});
  ff.addEventListener("click", function(){dictaphone.rewindToEnd()});

```

## Instalation and Usage

The easiest way to use Dictaphone-js is to install it from NPM and include it in your own js build process (using Webpack, etc).

```
npm install dictaphone-js --save
```

At this point you can import dictaphone-js in your application as follows:

```js
import Dictaphone from 'dictaphone-js';
// OR
const Dictaphone = require('dictaphone-js');
```

## API methods

### startRecording()

### stopRecording()

### play()

### pause()

### togglePlayback()

### rewind(time)
time | Number (sec) - required

### rewindToBegin()

### rewindToEnd()

## Events
You can add an event listener that fires when the some event happens.

```js
...
dictaphone.on('pause', function(data) { console.log(data)});
```

Dictaphone-js provides next events:

* 'play',
* 'pause',
* 'startRecording',
* 'stopRecording',
* 'progress',
* 'pause',
* 'rewind',
* 'error'

License
-------------
Popcorn.js is made available under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
