import { test, expect } from '@playwright/test'
const key = 'camila.garden.first-planted-at.v1'

test('first planting persists, ticks in real time, and survives pause, replay and reload', async ({
  page,
}) => {
  const now = new Date('2026-09-22T03:00:00Z')
  await page.clock.install({ time: now })
  await page.goto('/')
  await expect(page.locator('.age-empty')).toBeVisible()
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(null)
  await page.locator('#start').click()
  const plantedAt = await page.evaluate((key) => localStorage.getItem(key), key)
  expect(plantedAt).not.toBeNull()
  await page.locator('#pause').click()
  await page.clock.fastForward(3_661_000)
  await expect(page.locator('[data-age="hours"]')).toHaveText('01')
  await expect(page.locator('.age-ticking')).toContainText('01 min')
  await page.locator('#restart').click()
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(plantedAt)
  await page.reload()
  await expect(page.locator('[data-age="hours"]')).toHaveText('01')
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(plantedAt)
})

test('old planting shows calendar units and fits the screen', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-03-18T16:35:25Z') })
  await page.addInitScript(({ key }) => localStorage.setItem(key, '2023-01-15T12:30:10.000Z'), {
    key,
  })
  await page.goto('/')
  for (const [unit, value] of Object.entries({
    years: '03',
    months: '02',
    days: '03',
    hours: '04',
  }))
    await expect(page.locator(`[data-age="${unit}"]`)).toHaveText(value)
  await page.locator('.garden-age').scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page
    .locator('.garden-age')
    .screenshot({ path: `test-results/counter-${test.info().project.name}.png` })
})

test('unavailable storage does not stop planting or the counter', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError')
    }
  })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.locator('#start').click()
  await expect(page.locator('.age-since')).toBeVisible()
  expect(errors).toEqual([])
})
