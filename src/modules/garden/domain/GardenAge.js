const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000

// Calendar months, clamped to the last day of the destination month.
// UTC keeps the result stable across time zones and daylight-saving changes.
function anniversary(start, months) {
  const result = new Date(start)
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)
  const lastDay = new Date(result)
  lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0)
  result.setUTCDate(Math.min(start.getUTCDate(), lastDay.getUTCDate()))
  return result.getTime()
}

export function gardenAge(plantedAt, now) {
  const empty = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  if (plantedAt === null) return empty
  if (!Number.isFinite(plantedAt) || !Number.isFinite(now))
    throw new RangeError('Invalid garden date')
  if (now <= plantedAt) return empty
  const start = new Date(plantedAt)
  const end = new Date(now)
  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth()
  if (anniversary(start, months) > now) months--
  const remaining = now - anniversary(start, months)
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days: Math.floor(remaining / DAY_MS),
    hours: Math.floor((remaining % DAY_MS) / HOUR_MS),
    minutes: Math.floor((remaining % HOUR_MS) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1000),
  }
}
