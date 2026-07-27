import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/db/schema'

/** Lazy client — never connects at build time, only when a request needs it. */
export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set — provision Neon env vars on the Vercel project')
  return drizzle(neon(url), { schema })
}

export type Db = ReturnType<typeof getDb>
