import { useEffect, useMemo, useState } from 'react'

const WORLD_BANK_INDICATORS = {
  forestAreaPct: 'AG.LND.FRST.ZS',
  threatenedMammals: 'EN.MAM.THRD.NO',
  threatenedBirds: 'EN.BIR.THRD.NO',
  threatenedPlants: 'EN.PLT.THRD.NO',
}

// Temporary fixed snapshot values until weather API reliability is restored.
const HARD_CODED_CLIMATE_BY_REGION = {
  Ladakh: { temperature: -1.8, precipitation: 0.1, snowfall: 1.2 },
  Himachal: { temperature: 11.4, precipitation: 0.6, snowfall: 0.0 },
  Uttarakhand: { temperature: 13.2, precipitation: 0.8, snowfall: 0.0 },
  Sikkim: { temperature: 9.7, precipitation: 1.1, snowfall: 0.0 },
}

function latestNonNullValue(rows) {
  return rows?.find((row) => row?.value !== null) ?? null
}

export default function useLiveConservationData(regions, species) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liveData, setLiveData] = useState({
    indicators: null,
    climate: [],
    gbif: [],
    lastUpdated: null,
  })

  const trackedNames = useMemo(() => species.slice(0, 6).map((item) => item.scientificName), [species])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchLiveData() {
      try {
        setLoading(true)
        setError('')

        const indicatorEntries = await Promise.all(
          Object.entries(WORLD_BANK_INDICATORS).map(async ([key, indicator]) => {
            const url = `https://api.worldbank.org/v2/country/IN/indicator/${indicator}?format=json&per_page=80`
            const response = await fetch(url, { signal: controller.signal })
            if (!response.ok) {
              throw new Error(`World Bank request failed for ${indicator}`)
            }

            const payload = await response.json()
            const latest = latestNonNullValue(payload?.[1] ?? [])
            return [key, latest ? { year: Number(latest.date), value: latest.value } : null]
          }),
        )

        const indicators = Object.fromEntries(indicatorEntries)

        const climate = regions.map((region) => {
          const fixed = HARD_CODED_CLIMATE_BY_REGION[region.name] ?? {
            temperature: null,
            precipitation: 0,
            snowfall: 0,
          }

          return {
            region: region.name,
            temperature: fixed.temperature,
            precipitation: fixed.precipitation,
            snowfall: fixed.snowfall,
          }
        })

        const gbif = await Promise.all(
          trackedNames.map(async (scientificName) => {
            const url = `https://api.gbif.org/v1/occurrence/search?scientificName=${encodeURIComponent(scientificName)}&country=IN&has_coordinate=true&limit=0`
            const response = await fetch(url, { signal: controller.signal })
            if (!response.ok) {
              throw new Error(`GBIF request failed for ${scientificName}`)
            }

            const payload = await response.json()
            return {
              scientificName,
              occurrenceCount: payload?.count ?? 0,
            }
          }),
        )

        setLiveData({
          indicators,
          climate,
          gbif,
          lastUpdated: new Date().toISOString(),
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to fetch live conservation data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchLiveData()

    return () => controller.abort()
  }, [regions, trackedNames])

  return { loading, error, liveData }
}
