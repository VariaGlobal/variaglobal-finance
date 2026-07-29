import type { AppUser, Entity, FilterChip, FilterKind, SavedView } from '@/lib/types'

export const entities: Entity[] = [
  { id: 'varia-global', name: 'Varia Global', legalName: 'Bisaria LLC' },
  { id: 'the-matchbox', name: 'The Matchbox', legalName: 'The Matchbox, Inc.' },
  { id: 'spyll-world', name: 'Spyll World', legalName: 'Bisaria Records LLC' },
  { id: 'spyll-publishing', name: 'Spyll Publishing', legalName: 'Bisaria Publishing LLC' },
  { id: 'the-ad-spend', name: 'The Ad Spend', legalName: 'Ad Spend Technologies, Inc.' },
]

/** Display-name lookup for the entity holding a relationship. */
export const entityName = (id: string) => entities.find((e) => e.id === id)?.name ?? id

export const users: AppUser[] = [
  { id: 'ani', name: 'Ani', role: 'owner', roleLabel: 'owner / approver', canApprove: true },
  { id: 'sydney', name: 'Sydney', role: 'finance', roleLabel: 'finance', canApprove: false },
  { id: 'lauraine', name: 'Lauraine', role: 'accountant', roleLabel: 'read-only accountant', canApprove: false },
]

export const savedViews: SavedView[] = [
  {
    id: 'view-money',
    name: 'Money decisions',
    chips: [{ id: 'sv1-status', kind: 'status', label: 'Needs decision', value: 'needs_decision' }],
  },
  {
    id: 'view-matchbox-july',
    name: 'Matchbox · July',
    chips: [
      { id: 'sv2-entity', kind: 'entity', label: 'The Matchbox', value: 'the-matchbox' },
      { id: 'sv2-period', kind: 'period', label: 'Jul 2026', value: '2026-07' },
    ],
  },
  {
    id: 'view-variances',
    name: 'Open variances',
    chips: [{ id: 'sv3-status', kind: 'status', label: 'Variance', value: 'variance' }],
  },
]

/**
 * Plain-English filter vocabulary. The filter input matches typed words
 * against these terms and compiles them into visible chips — never hidden
 * query logic.
 */
export interface VocabEntry {
  kind: FilterKind
  label: string
  value: string
  terms: string[] // lowercase match terms
}

export const filterVocabulary: VocabEntry[] = [
  // Entities
  { kind: 'entity', label: 'Varia Global', value: 'varia-global', terms: ['varia', 'global'] },
  { kind: 'entity', label: 'The Matchbox', value: 'the-matchbox', terms: ['matchbox'] },
  { kind: 'entity', label: 'Spyll World', value: 'spyll-world', terms: ['spyll'] },
  { kind: 'entity', label: 'The Ad Spend', value: 'the-ad-spend', terms: ['ad spend', 'adspend'] },
  // Clients
  { kind: 'client', label: 'eCommission', value: 'ecommission', terms: ['ecommission'] },
  { kind: 'client', label: 'Celigo', value: 'celigo', terms: ['celigo'] },
  { kind: 'client', label: 'Maxwell Social', value: 'maxwell-social', terms: ['maxwell'] },
  { kind: 'client', label: 'Pineapple Family', value: 'pineapple-family', terms: ['pineapple'] },
  { kind: 'client', label: 'HubSpot', value: 'hubspot', terms: ['hubspot'] },
  // People
  { kind: 'person', label: 'Megan Breyer', value: 'megan-breyer', terms: ['megan', 'breyer'] },
  { kind: 'person', label: 'Tess Fazio', value: 'tess-fazio', terms: ['tess', 'fazio'] },
  { kind: 'person', label: 'Sydney Allen', value: 'sydney-allen', terms: ['sydney', 'allen'] },
  { kind: 'person', label: 'Michael Hood', value: 'michael-hood', terms: ['michael', 'hood'] },
  // Periods
  { kind: 'period', label: 'Jul 2026', value: '2026-07', terms: ['july', 'jul'] },
  { kind: 'period', label: 'Jun 2026', value: '2026-06', terms: ['june', 'jun'] },
  { kind: 'period', label: 'May 2026', value: '2026-05', terms: ['may'] },
  // Statuses
  { kind: 'status', label: 'Prepared', value: 'prepared', terms: ['prepared'] },
  { kind: 'status', label: 'Suggestion', value: 'suggestion', terms: ['suggestion', 'suggested'] },
  { kind: 'status', label: 'Needs decision', value: 'needs_decision', terms: ['decision', 'decide'] },
  { kind: 'status', label: 'Variance', value: 'variance', terms: ['variance'] },
  { kind: 'status', label: 'Review', value: 'review', terms: ['review'] },
  { kind: 'status', label: 'Held', value: 'held', terms: ['held', 'hold'] },
]

/** Compile free text into filter chips by matching against the vocabulary. */
export function compileFilterText(text: string): FilterChip[] {
  const lower = text.toLowerCase()
  const chips: FilterChip[] = []
  for (const entry of filterVocabulary) {
    if (entry.terms.some((t) => lower.includes(t))) {
      chips.push({
        id: `chip-${entry.kind}-${entry.value}`,
        kind: entry.kind,
        label: entry.label,
        value: entry.value,
      })
    }
  }
  return chips
}
