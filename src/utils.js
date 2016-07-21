export function formatTime(_sec){
  const sec = Math.floor(_sec);
  let hours   = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - (hours * 3600)) / 60);
  let seconds = sec - (hours * 3600) - (minutes * 60);

  hours < 10 &&  (hours = "0"+hours);
  minutes < 10 && (minutes = "0"+minutes);
  seconds < 10 && (seconds = "0"+seconds);
  return hours+':'+minutes+':'+seconds;
}
