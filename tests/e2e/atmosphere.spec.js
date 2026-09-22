import { test, expect } from '@playwright/test'

test('music produces changing notes, respects volume, and pauses the audio clock', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => {
    const NativeAudioContext = window.AudioContext
    window.__notes = 0
    window.AudioContext = class extends NativeAudioContext {
      constructor(...args) {
        super(...args)
        window.__audioContext = this
      }
      createOscillator() {
        const oscillator = super.createOscillator()
        const start = oscillator.start.bind(oscillator)
        oscillator.start = (...args) => {
          window.__notes++
          start(...args)
        }
        return oscillator
      }
      createGain() {
        const gain = super.createGain()
        const connect = gain.connect.bind(gain)
        gain.connect = (destination, ...args) => {
          if (destination === this.destination) {
            const analyser = this.createAnalyser()
            analyser.fftSize = 2048
            connect(analyser)
            window.__audioAnalyser = analyser
          }
          return connect(destination, ...args)
        }
        return gain
      }
    }
  })
  await page.goto('/')
  expect(await page.evaluate(() => window.__audioContext === undefined)).toBe(true)
  const volume = page.getByRole('slider', { name: 'Volumen de la música' })
  await volume.fill('60')
  await page.locator('#sound').click()
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
  const rms = () =>
    page.evaluate(() => {
      if (!window.__audioAnalyser) return 0
      const data = new Float32Array(window.__audioAnalyser.fftSize)
      window.__audioAnalyser.getFloatTimeDomainData(data)
      return Math.sqrt(data.reduce((sum, sample) => sum + sample * sample, 0) / data.length)
    })
  await expect.poll(rms).toBeGreaterThan(0.0001)
  const notes = await page.evaluate(() => window.__notes)
  await expect
    .poll(() => page.evaluate(() => window.__notes), { timeout: 6000 })
    .toBeGreaterThan(notes)
  await volume.fill('0')
  await expect.poll(rms).toBeLessThan(0.00001)
  await volume.fill('40')
  await expect.poll(rms).toBeGreaterThan(0.0001)
  await page.locator('#sound').click()
  await expect.poll(() => page.evaluate(() => window.__audioContext.state)).toBe('suspended')
  await page.locator('#sound').click()
  await expect.poll(() => page.evaluate(() => window.__audioContext.state)).toBe('running')
  await expect.poll(rms).toBeGreaterThan(0.0001)
  expect(errors).toEqual([])
})

test('personal note opens and closes, navigation and narrow layout work', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('link', { name: 'Tengo algo que decirte' }).click()
  await expect(page).toHaveURL(/#note$/)
  const button = page.locator('.note-button')
  await button.click()
  await expect(page.locator('#personal-note')).toBeVisible()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('button', { name: 'Guardar la notita' }).click()
  await expect(page.locator('#personal-note')).toHaveCount(0)
  if (test.info().project.name === 'mobile') await page.setViewportSize({ width: 320, height: 720 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  const slider = page.getByRole('slider')
  await slider.focus()
  const oldVolume = Number(await slider.inputValue())
  await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveValue(String(oldVolume + 1))
})
