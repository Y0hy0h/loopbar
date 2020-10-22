export function timecodeFromSecond (elapsedSeconds: number) {
  const elapsedMinutes = elapsedSeconds / 60
  const elapsedHours = elapsedMinutes / 60

  const hours = Math.floor(elapsedHours).toFixed(0)
  const minutes = Math.floor(elapsedMinutes % 60).toFixed(0).padStart(2, '0')
  const seconds = Math.floor(elapsedSeconds % 60).toFixed(0).padStart(2, '0')
  const fractionOfSecond = Math.floor((elapsedSeconds * 100) % 100).toFixed(0).padStart(2, '0')

  const timecode = `${hours}:${minutes}:${seconds}.${fractionOfSecond}`
  return timecode
}
