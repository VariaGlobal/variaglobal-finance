import type { WorkItem } from '@/lib/types'
import { buildRealWorkItems } from '@/lib/data/queue'

/**
 * REAL queue data — derived from the payroll engine over the two extracted
 * cycles (2026-06-H2, 2026-07-H1) with rulings RUL-001..004. The v0 demo
 * items were retired when the engine landed. Every number is precomputed
 * upstream; components never do math.
 */
export const workItems: WorkItem[] = buildRealWorkItems()
