import { useEffect, useMemo, useState } from 'react'

const WORLD_BANK_INDICATORS = {
  forestAreaPct: 'AG.LND.FRST.ZS',
  threatenedMammals: 'EN.MAM.THRD.NO',
  threatenedBirds: 'EN.BIR.THRD.NO',
  threatenedPlants: 'EN.PLT.THRD.NO',
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

        const climate = await Promise.all(
          regions.map(async (region) => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}&longitude=${region.lng}&current=temperature_2m,precipitation,snowfall&timezone=auto`
            const response = await fetch(url, { signal: controller.signal })
            if (!response.ok) {
              throw new Error(`Open-Meteo request failed for ${region.name}`)
            }

            const payload = await response.json()
            return {
              region: region.name,
              temperature: payload?.current?.temperature_2m ?? null,
              precipitation: payload?.current?.precipitation ?? 0,
              snowfall: payload?.current?.snowfall ?? 0,
            }
          }),
        )

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
