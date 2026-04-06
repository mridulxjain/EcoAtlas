export function trendDirection(points) {
  if (!points?.length) return 'flat'
  if (points.at(-1) > points[0]) return 'up'
  if (points.at(-1) < points[0]) return 'down'
  return 'flat'
}

export function computeTrackerMetrics(species) {
  const criticalCount = species.filter((item) => item.risk === 'Critical').length
  const endangeredCount = species.filter((item) => item.status === 'Endangered').length
  const decliningCount = species.filter((item) => trendDirection(item.trend) === 'down').length
  const stableCount = species.length - decliningCount
  const treeCount = species.filter((item) => item.type === 'Tree').length
  const animalCount = species.filter((item) => item.type === 'Animal').length

  const treeDecline = species.filter(
    (item) => item.type === 'Tree' && trendDirection(item.trend) === 'down',
  ).length
  const animalDecline = species.filter(
    (item) => item.type === 'Animal' && trendDirection(item.trend) === 'down',
  ).length

  return {
    criticalCount,
    endangeredCount,
    decliningCount,
    stableCount,
    treeCount,
    animalCount,
    treeDecline,
    animalDecline,
  }
}

export function computeCollapseIndex({
  warming,
  deforestation,
  humanImpact,
  glacierLoss,
  grazingPressure,
  policyStrength,
  climateSignal = 0,
}) {
  const impactScore =
    warming * 15 +
    deforestation * 0.35 +
    humanImpact * 0.24 +
    glacierLoss * 0.2 +
    grazingPressure * 0.17 +
    climateSignal * 4 -
    policyStrength * 0.22

  return Math.max(0, Math.min(100, Math.round(impactScore)))
}

export function projectSpeciesPopulation(species, stressors) {
  const {
    warming,
    deforestation,
    humanImpact,
    glacierLoss,
    grazingPressure,
    policyStrength,
    climateSignal = 0,
  } = stressors

  return species.map((item) => {
    const base = item.trend.at(-1)
    const pressure =
      warming * 0.09 +
      deforestation * 0.006 +
      humanImpact * 0.005 +
      glacierLoss * 0.004 +
      grazingPressure * 0.003 +
      climateSignal * 0.02

    const policyShield = 1 - policyStrength * 0.004
    const typeVulnerability = item.type === 'Tree' ? 1.06 : item.type === 'Plant' ? 1.1 : 1
    const resilience = item.risk === 'Critical' ? 0.42 : item.risk === 'High' ? 0.58 : 0.73
    const projected = Math.max(
      6,
      Math.round(base * (1 - pressure * resilience * typeVulnerability * policyShield)),
    )
    const change = Math.round(((projected - base) / base) * 100)
    return { ...item, projected, change }
  })
}

export function ecosystemStateFromIndex(collapseIndex) {
  if (collapseIndex < 35) return 'Buffering'
  if (collapseIndex < 60) return 'Stressed'
  if (collapseIndex < 80) return 'Critical'
  return 'Collapse Likely'
}
