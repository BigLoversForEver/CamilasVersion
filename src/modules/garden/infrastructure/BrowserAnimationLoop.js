export function createAnimationLoop(onFrame) {
  let frameId,
    lastTime = null,
    disposed = false
  function frame(time) {
    if (disposed) return
    const elapsed = lastTime === null ? 0 : Math.min(time - lastTime, 100)
    lastTime = time
    onFrame(elapsed, time)
    frameId = requestAnimationFrame(frame)
  }
  function visibilityChanged() {
    cancelAnimationFrame(frameId)
    lastTime = null
    if (!document.hidden && !disposed) frameId = requestAnimationFrame(frame)
  }
  document.addEventListener('visibilitychange', visibilityChanged)
  frameId = requestAnimationFrame(frame)
  return () => {
    disposed = true
    cancelAnimationFrame(frameId)
    document.removeEventListener('visibilitychange', visibilityChanged)
  }
}
