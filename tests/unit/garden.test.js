import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Garden, GROWTH_DURATION_MS } from '../../src/modules/garden/domain/Garden.js'
import { GardenSession } from '../../src/modules/garden/application/GardenSession.js'

test('growth completes at 100% and stops', () => {
  const garden = new Garden()
  garden.plant()
  garden.advance(GROWTH_DURATION_MS / 2)
  assert.equal(garden.snapshot.progress, 0.5)
  garden.advance(GROWTH_DURATION_MS)
  assert.deepEqual(garden.snapshot, { progress: 1, playing: false, complete: true, stageIndex: 3 })
})
test('sprout can resume, pause and restart', () => {
  const session = new GardenSession()
  session.selectStage(1)
  session.primaryAction()
  session.advance(2800)
  assert.ok(Math.abs(session.snapshot.progress - 0.42) < 1e-10)
  session.togglePlayback()
  const paused = session.snapshot
  session.advance(5000)
  assert.deepEqual(session.snapshot, paused)
  session.togglePlayback()
  session.advance(2800)
  assert.equal(session.snapshot.stageIndex, 2)
  session.plant()
  assert.equal(session.snapshot.progress, 0)
  assert.equal(session.snapshot.playing, true)
})
test('stage selection pauses; invalid input cannot corrupt state', () => {
  const garden = new Garden()
  for (const [index, progress] of [0, 0.32, 0.62, 1].entries()) {
    garden.selectStage(index)
    assert.equal(garden.snapshot.progress, progress)
    assert.equal(garden.snapshot.stageIndex, index)
    assert.equal(garden.snapshot.playing, false)
  }
  for (const invalid of [-1, 4, 0.5, NaN])
    assert.throws(() => garden.selectStage(invalid), RangeError)
  for (const invalid of [-1, Infinity, NaN])
    assert.throws(() => garden.advance(invalid), RangeError)
  assert.equal(garden.snapshot.progress, 1)
  assert.throws(() => {
    garden.snapshot.progress = 8
  }, TypeError)
})
test('reduced motion completes planting and explicit resume immediately', () => {
  const session = new GardenSession({ reducedMotion: true })
  session.plant()
  assert.equal(session.snapshot.complete, true)
  session.selectStage(1)
  session.togglePlayback()
  assert.equal(session.snapshot.complete, true)
})
test('seed can resume and completed garden can restart', () => {
  const session = new GardenSession()
  session.selectStage(0)
  session.primaryAction()
  session.advance(GROWTH_DURATION_MS)
  session.primaryAction()
  assert.equal(session.snapshot.progress, 0)
  assert.equal(session.snapshot.playing, true)
})
