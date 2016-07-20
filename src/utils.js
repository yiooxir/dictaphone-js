export function formatTime(time){
  const min = Math.floor(time/60)
  const sec = Math.ceil((time-min*60))
  return `${min}:${sec}`;
}
