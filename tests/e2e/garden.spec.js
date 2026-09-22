import { test, expect } from '@playwright/test'

test('sprout regression, playback, stages and full flowering', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.clock.install()
  const bar = page.getByRole('progressbar')
  const value = async () => Number(await bar.getAttribute('aria-valuenow'))
  const pixels = () => page.locator('canvas').evaluate((canvas) => canvas.toDataURL())
  await page.locator('[data-step="1"]').click()
  await page.clock.runFor(100)
  await expect(bar).toHaveAttribute('aria-valuenow', '32')
  const before = await pixels()
  await page.locator('#start').click()
  await page.clock.runFor(2500)
  expect(await value()).toBeGreaterThan(38)
  expect(await pixels()).not.toBe(before)
  await page.locator('#pause').click()
  const paused = await value()
  await page.clock.runFor(500)
  expect(await value()).toBe(paused)
  await expect(page.locator('#start')).toContainText('Continuar crecimiento')
  await page.locator('#pause').click()
  await page.clock.runFor(1000)
  expect(await value()).toBeGreaterThan(paused)
  await page.locator('#start').click()
  const mainPaused = await value()
  await page.clock.runFor(500)
  expect(await value()).toBe(mainPaused)
  await page.locator('#start').click()
  await page.clock.runFor(20000)
  await expect(bar).toHaveAttribute('aria-valuenow', '100')
  await expect(page.locator('#pause')).toBeDisabled()
  await expect(page.locator('#stage-title')).toContainText('Camila')
  await page.locator('#restart').click()
  await page.clock.runFor(1000)
  expect(await value()).toBeGreaterThan(0)
  expect(await value()).toBeLessThan(10)
  for (const [index, target] of [0, 32, 62, 100].entries()) {
    await page.locator(`[data-step="${index}"]`).click()
    await page.clock.runFor(100)
    await expect(bar).toHaveAttribute('aria-valuenow', String(target))
  }
  await page.locator('#start').click()
  await page.clock.runFor(29000)
  await expect(bar).toHaveAttribute('aria-valuenow', '100')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.screenshot({
    path: `test-results/garden-${test.info().project.name}.png`,
    fullPage: true,
  })
  expect(errors).toEqual([])
})

test('reduced motion and optional sound', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('#start').click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  await page.locator('[data-step="1"]').click()
  await page.locator('#pause').click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  await page.locator('#sound').click()
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
  await page.locator('#sound').click()
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false')
  expect(errors).toEqual([])
})
