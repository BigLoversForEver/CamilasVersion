// Browser adapter: all Canvas and resize operations stay outside the domain.
export function createGardenRenderer(canvas) {
  const ctx = canvas.getContext('2d')
  let width = 0,
    height = 0,
    progress = 0,
    reducedMotion = false
  let seed = 43
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const flowers = Array.from({ length: 58 }, (_, i) => ({
    x: (i % 20) / 19 + (random() - 0.5) * 0.055,
    row: Math.floor(i / 20),
    size: 0.65 + random() * 0.55,
    delay: random() * 0.14,
    phase: random() * Math.PI * 2,
    bend: (random() - 0.5) * 25,
  }))
  function clamp(value) {
    return Math.max(0, Math.min(1, value))
  }
  function ease(value) {
    const t = clamp(value)
    return t * t * (3 - 2 * t)
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = rect.width
    height = rect.height
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()
  function leaf(x, y, size, direction) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.bezierCurveTo(
      x + direction * size * 0.15,
      y - size * 0.8,
      x + direction * size,
      y - size * 0.8,
      x + direction * size,
      y - size * 0.85,
    )
    ctx.bezierCurveTo(
      x + direction * size,
      y - size * 0.05,
      x + direction * size * 0.25,
      y + size * 0.1,
      x,
      y,
    )
    ctx.fill()
    ctx.strokeStyle = '#b6bb6845'
    ctx.lineWidth = 0.7
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + direction * size * 0.8, y - size * 0.65)
    ctx.stroke()
  }
  function flower(f, time) {
    const depth = 0.65 + f.row * 0.23
    const ground = height - 60 + f.row * 22
    const x = f.x * width
    const growth = ease((progress - f.delay - 0.07) / 0.53)
    const bloom = ease((progress - f.delay - 0.57) / 0.25)
    // Reserve space above the flowers for the stage text on narrow screens.
    const scale = width < 600 ? 0.68 : 1
    const headRadius = (16 + f.size * 10) * depth * scale
    const textBoundary = width < 600 ? 230 : 205
    const matureHeight = Math.min(
      (height * 0.4 + f.size * 35) * depth * scale,
      ground - textBoundary - headRadius * 1.4,
    )
    const stemHeight = Math.max(0, matureHeight) * growth
    const sway = reducedMotion ? 0 : Math.sin(time * 0.00065 + f.phase) * 4 * growth
    const topX = x + f.bend * growth + sway
    const topY = ground - stemHeight
    ctx.globalAlpha = 0.72 + f.row * 0.14
    if (growth < 0.06) {
      ctx.fillStyle = '#695237'
      ctx.beginPath()
      ctx.ellipse(x, ground, 3, 1.7, -0.4, 0, Math.PI * 2)
      ctx.fill()
    }
    if (growth <= 0) return
    ctx.strokeStyle = f.row === 0 ? '#789264' : '#486d42'
    ctx.lineWidth = (2 + f.row) * growth
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x, ground)
    ctx.quadraticCurveTo(x + sway, ground - stemHeight * 0.55, topX, topY)
    ctx.stroke()
    ctx.fillStyle = f.row === 0 ? '#8ca771' : '#61884e'
    const leafSize = (20 + f.size * 15) * depth * ease(growth * 1.6) * scale
    leaf(x + (topX - x) * 0.25, ground - stemHeight * 0.32, leafSize, -1)
    leaf(x + (topX - x) * 0.55, ground - stemHeight * 0.59, leafSize * 0.85, 1)
    if (growth > 0.55 && bloom < 0.1) {
      ctx.fillStyle = '#72843b'
      ctx.beginPath()
      ctx.ellipse(topX, topY, 5 * growth, 8 * growth, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    if (bloom <= 0) return
    const radius = (16 + f.size * 10) * depth * bloom * scale
    ctx.save()
    ctx.translate(topX, topY)
    ctx.rotate(f.bend * 0.009 + sway * 0.008)
    for (let layer = 0; layer < 2; layer++) {
      for (let petal = 0; petal < 15; petal++) {
        ctx.save()
        ctx.rotate((petal * Math.PI * 2) / 15 + layer * 0.2)
        ctx.fillStyle = layer === 0 ? '#d99f25' : petal % 3 === 0 ? '#f8d45a' : '#efbf3e'
        ctx.beginPath()
        ctx.ellipse(0, -radius * 0.78, radius * 0.2, radius * 0.6, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }
    ctx.fillStyle = '#74522b'
    ctx.beginPath()
    ctx.arc(0, 0, radius * 0.51, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#4c3b25'
    ctx.beginPath()
    ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2)
    ctx.fill()
    for (let dot = 0; dot < 38; dot++) {
      const angle = dot * 2.39996
      const r = Math.sqrt(dot / 38) * radius * 0.43
      ctx.fillStyle = dot % 2 ? '#ac8040' : '#8e692f'
      ctx.beginPath()
      ctx.arc(
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        Math.max(0.5, radius * 0.025),
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
    ctx.restore()
  }
  function draw(time) {
    ctx.clearRect(0, 0, width, height)
    // Layered green hills keep the garden alive even before the first seed sprouts.
    ctx.fillStyle = '#b3c49a'
    ctx.beginPath()
    ctx.moveTo(0, height)
    ctx.lineTo(0, height - 115)
    ctx.bezierCurveTo(width * 0.2, height - 165, width * 0.65, height - 70, width, height - 143)
    ctx.lineTo(width, height)
    ctx.fill()
    ctx.fillStyle = '#97ae79'
    ctx.beginPath()
    ctx.moveTo(0, height)
    ctx.lineTo(0, height - 73)
    ctx.bezierCurveTo(width * 0.25, height - 113, width * 0.65, height - 40, width, height - 90)
    ctx.lineTo(width, height)
    ctx.fill()
    ctx.fillStyle = '#7b995f'
    ctx.beginPath()
    ctx.moveTo(0, height)
    ctx.lineTo(0, height - 45)
    ctx.bezierCurveTo(width * 0.3, height - 70, width * 0.8, height - 110, width, height - 57)
    ctx.lineTo(width, height)
    ctx.fill()
    flowers.forEach((f) => flower(f, time))
    ctx.globalAlpha = 1
    for (let i = 0; i < 150; i++) {
      const x = (i / 149) * width
      const y = height - 13 + Math.sin(i * 13) * 15
      const h = 15 + (Math.sin(i * 47) + 1) * 15
      ctx.strokeStyle = i % 2 ? '#527443' : '#8ba268'
      ctx.lineWidth = 1.3
      ctx.beginPath()
      ctx.moveTo(x, y + 15)
      ctx.quadraticCurveTo(x + Math.sin(i) * 7, y - h * 0.4, x + Math.sin(i * 4) * 10, y - h)
      ctx.stroke()
    }
    if (progress > 0.65) {
      for (let i = 0; i < 12; i++) {
        const x = (i * 137 + time * 0.008) % Math.max(width, 1)
        const y = height * 0.48 + Math.sin(time * 0.0005 + i * 3) * height * 0.23
        ctx.fillStyle = '#fff2b5'
        ctx.globalAlpha = 0.35 + Math.sin(time * 0.002 + i) * 0.2
        ctx.beginPath()
        ctx.arc(x, y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      // A pair of butterflies follows a slow, looping path above the flowers.
      for (let i = 0; i < 2; i++) {
        const phase = time * 0.00028 + i * 3
        const x = width * (0.58 + Math.sin(phase) * 0.23)
        const y = height * 0.51 + Math.cos(phase * 1.7) * 17
        const flutter = reducedMotion ? 0.7 : 0.35 + Math.abs(Math.sin(time * 0.007 + i)) * 0.65
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.sin(phase) * 0.25)
        ctx.fillStyle = i ? '#f6edd0' : '#e8be5a'
        for (const side of [-1, 1]) {
          ctx.beginPath()
          ctx.ellipse(side * 4 * flutter, -2, 5 * flutter, 7, side * 0.4, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(side * 3 * flutter, 4, 3.5 * flutter, 4, -side * 0.3, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = '#687346'
        ctx.fillRect(-0.6, -5, 1.2, 11)
        ctx.restore()
      }
    }
  }

  return {
    render(nextProgress, time, motionReduced = false) {
      progress = nextProgress
      reducedMotion = motionReduced
      draw(time)
    },
    dispose() {
      observer.disconnect()
    },
  }
}
