import React from 'react'

export interface HighlightProps {
  text: string
  words: string[]
}

// Words are searched as typed, so characters such as `(` or `+` match themselves
const escapeRegExp = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Marks the words of a search in a text, such as the results of a search field. The text is rendered as text,
 * never as HTML, so it may come from the user.
 */
export function Highlight(props: HighlightProps) {
  const { text, words } = props

  const validWords = words
    .filter((w) => !!w)
    .map((w) => w.trim())
    .filter((w) => !!w)

  if (validWords.length <= 0) {
    return <span>{text}</span>
  }

  // With a capturing group, the matches are at the odd positions of the split
  const regex = new RegExp(`(${validWords.map(escapeRegExp).join('|')})`, 'gi')
  const parts = text.split(regex)

  return <span>{parts.map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part))}</span>
}
