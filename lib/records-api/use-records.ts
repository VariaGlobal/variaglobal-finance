'use client'

/**
 * Tiny SWR-style data layer for the live Records API. No external deps.
 *
 * Every hook returns { data, source, loading, error }:
 *   - source: 'live'      → data came from app/api/records/*
 *   - source: 'fallback'  → the endpoint 404'd or errored; we rendered the
 *                           bundled fixture instead. Hubs MUST badge this so
 *                           mock data is never mistaken for real records.
 *
 * A module-level cache keeps results across mounts (SWR-ish) so switching
 * tabs doesn't re-flash skeletons.
 */

import { useEffect, useState } from 'react'
import type { DataSource } from '@/lib/records-api/types'

export interface RecordsResult<T> {
  data: T
  source: DataSource
  loading: boolean
  error: Error | null
}

interface CacheEntry<T> {
  data: T
  source: DataSource
}

const cache = new Map<string, CacheEntry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    // A 200 that returns the HTML app shell means the route isn't mounted.
    throw new Error(`${url} → non-JSON response`)
  }
  return res.json() as Promise<T>
}

/**
 * Fetch `url`, mapping the raw JSON to `T`. On any failure, resolve with
 * `fallback` and mark the source accordingly — the UI never hard-fails.
 */
export function useRecordsResource<Raw, T>(
  key: string,
  url: string,
  map: (raw: Raw) => T,
  fallback: T,
): RecordsResult<T> {
  const cached = cache.get(key) as CacheEntry<T> | undefined
  const [state, setState] = useState<RecordsResult<T>>(
    cached
      ? { data: cached.data, source: cached.source, loading: false, error: null }
      : { data: fallback, source: 'fallback', loading: true, error: null },
  )

  useEffect(() => {
    let active = true
    if (cache.has(key)) {
      const hit = cache.get(key) as CacheEntry<T>
      setState({ data: hit.data, source: hit.source, loading: false, error: null })
      return
    }

    let promise = inflight.get(key) as Promise<CacheEntry<T>> | undefined
    if (!promise) {
      promise = fetchJson<Raw>(url)
        .then((raw) => {
          const entry: CacheEntry<T> = { data: map(raw), source: 'live' }
          cache.set(key, entry)
          return entry
        })
        .catch(() => {
          // Endpoint missing/errored — fall back to fixtures, but do NOT
          // cache the fallback so a later mount can still upgrade to live.
          const entry: CacheEntry<T> = { data: fallback, source: 'fallback' }
          return entry
        })
        .finally(() => {
          inflight.delete(key)
        })
      inflight.set(key, promise)
    }

    setState((s) => ({ ...s, loading: true }))
    promise.then((entry) => {
      if (!active) return
      setState({ data: entry.data, source: entry.source, loading: false, error: null })
    })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, url])

  return state
}

/** Prime the module cache outside React (used for summary prefetching). */
export function primeCache<T>(key: string, data: T, source: DataSource) {
  cache.set(key, { data, source })
}

export function readCache<T>(key: string): CacheEntry<T> | undefined {
  return cache.get(key) as CacheEntry<T> | undefined
}
