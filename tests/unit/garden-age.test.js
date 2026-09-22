import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gardenAge } from '../../src/modules/garden/domain/GardenAge.js'
import { GardenHistory } from '../../src/modules/garden/application/GardenHistory.js'
const date = (value) => Date.parse(value)

test('calendar age separates years, months, days, hours, minutes and seconds', () => {
  assert.deepEqual(gardenAge(date('2023-01-15T12:30:10Z'), date('2026-03-18T16:35:25Z')), {
    years: 3,
    months: 2,
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 15,
  })
})
test('month ends and leap days use real calendar anniversaries', () => {
  assert.deepEqual(gardenAge(date('2025-01-31T12:00:00Z'), date('2025-02-28T12:00:00Z')), {
    years: 0,
    months: 1,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  assert.equal(gardenAge(date('2024-02-29T00:00:00Z'), date('2025-02-28T00:00:00Z')).years, 1)
  assert.equal(gardenAge(date('2024-01-31T00:00:00Z'), date('2024-03-30T00:00:00Z')).months, 1)
  assert.equal(gardenAge(date('2024-01-31T00:00:00Z'), date('2024-03-31T00:00:00Z')).months, 2)
})
test('age stays nonnegative before planting or after a backward clock adjustment', () => {
  const zero = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  assert.deepEqual(gardenAge(null, Date.now()), zero)
  assert.deepEqual(gardenAge(1000, 0), zero)
})
test('first planting survives repeated planting and a new visit', () => {
  let stored = null,
    now = 1000
  const repository = {
    load: () => stored,
    save: (value) => {
      stored = value
    },
  }
  const history = new GardenHistory({ repository, clock: () => now })
  assert.equal(history.plantedAt, null)
  history.recordFirstPlanting()
  now = 3_601_000
  history.recordFirstPlanting()
  assert.equal(stored, 1000)
  assert.equal(history.age.hours, 1)
  const nextVisit = new GardenHistory({ repository, clock: () => now })
  assert.equal(nextVisit.plantedAt, 1000)
  assert.equal(nextVisit.age.hours, 1)
})
test('another tab can supply the first planting', () => {
  let stored = null
  const repository = {
    load: () => stored,
    save: (value) => {
      stored = value
    },
  }
  const history = new GardenHistory({ repository, clock: () => 5000 })
  stored = 1000
  history.recordFirstPlanting()
  assert.equal(history.plantedAt, 1000)
})
