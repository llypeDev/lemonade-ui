import { PhosphorEntry } from './data'

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

/** Scores how well a single search term matches an icon. 0 means no match. */
function scoreTerm(entry: PhosphorEntry, term: string): number {
  const name = entry.name
  const words = name.split('-')

  if (name === term) return 100
  if (/^(u\+)?[0-9a-f]{4,5}$/.test(term) && entry.codepoint.toString(16) === term.replace('u+', '')) return 95
  if (name.startsWith(term)) return 80
  if (words.some((word) => word === term)) return 75
  if (words.some((word) => word.startsWith(term))) return 70
  if (entry.alias && entry.alias.includes(term)) return 60
  if (name.includes(term)) return 55

  let best = 0
  for (const rawTag of entry.tags) {
    const tag = normalize(rawTag.replace(/\*/g, ''))
    if (tag === term) best = Math.max(best, 50)
    else if (tag.startsWith(term)) best = Math.max(best, 40)
    else if (tag.includes(term)) best = Math.max(best, 30)
  }
  if (best) return best

  if (entry.categories.some((category) => normalize(category).includes(term))) return 20
  return 0
}

/**
 * Fuzzy-ish search over names, aliases, tags, categories and codepoints.
 * Every term of the query must match (AND); results are ordered by relevance, then by name.
 */
export function searchIcons(icons: PhosphorEntry[], query: string, category?: string): PhosphorEntry[] {
  const pool = category ? icons.filter((entry) => entry.categories.includes(category)) : icons
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return pool

  const scored: Array<{ entry: PhosphorEntry; score: number }> = []
  for (const entry of pool) {
    let total = 0
    let matched = true
    for (const term of terms) {
      const score = scoreTerm(entry, term)
      if (!score) {
        matched = false
        break
      }
      total += score
    }
    if (matched) scored.push({ entry, score: total })
  }

  return scored.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name)).map((item) => item.entry)
}
