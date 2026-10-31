import React, { CSSProperties, useEffect, useRef, useState } from 'react'

import { useIsMounted } from '../../hooks/useIsMounted'
import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { isPromise } from '../../util'
import { Button } from '../Button'
import { VisuallyHidden } from '../VisuallyHidden'

export interface LoadMoreProps {
  /**
   * Number of items on the screen
   */
  loaded: number

  /**
   * Number of items there are in all. With it, the component says how many are shown.
   */
  total?: number

  /**
   * Whether there are more items to load
   * @default `loaded < total`, or `true` without `total`
   */
  hasMore?: boolean

  /**
   * Loads the next items. While a returned promise is pending, the button shows a spinner.
   */
  onLoadMore(): void | Promise<unknown>

  /**
   * Shows the spinner, for loading controlled by the application
   */
  loading?: boolean

  /**
   * Element whose children are the items. After a load, the focus moves to the first new item, so keyboard users
   * continue from there.
   */
  listRef?: React.RefObject<HTMLElement>

  /**
   * @default "Load more", from the locale strings
   */
  label?: React.ReactNode

  style?: ExternalStyles
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]'

/**
 * A button at the end of a list that loads the next items, with the number of items shown. It is an accessible
 * alternative to infinite scrolling: the user decides when to load, the new items are announced and the focus
 * moves to the first of them.
 */
export function LoadMore(props: LoadMoreProps) {
  const { loaded, total, hasMore, onLoadMore, loading, listRef, label, style } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const isMounted = useIsMounted()
  const [pending, setPending] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  // Number of items when the user asked for more, to find the first new one
  const requestedAt = useRef<number>(null)

  const more = hasMore ?? (total === undefined || loaded < total)

  useEffect(() => {
    const before = requestedAt.current
    if (before === null || loaded <= before) {
      return
    }
    requestedAt.current = null
    setAnnouncement(fill(locale.loadMore.loaded, { count: loaded - before }))

    const item = listRef && listRef.current && (listRef.current.children[before] as HTMLElement)
    if (item) {
      const target = item.matches(focusableSelector) ? item : item.querySelector<HTMLElement>(focusableSelector)
      if (target) {
        target.focus()
      } else {
        item.setAttribute('tabindex', '-1')
        item.focus()
      }
    }
  }, [loaded, listRef, locale])

  const handleClick = () => {
    requestedAt.current = loaded
    const result = onLoadMore()
    if (isPromise(result)) {
      setPending(true)
      const done = () => isMounted.current && setPending(false)
      result.then(done, done)
    }
  }

  return (
    <div className={css(classes.root, style)}>
      {total !== undefined && (
        <p className={classes.count}>
          {more ? fill(locale.loadMore.showing, { loaded, total }) : fill(locale.loadMore.all, { total })}
        </p>
      )}
      {more && (
        <Button loading={loading || pending} aria-busy={loading || pending || undefined} onClick={handleClick}>
          {label ?? locale.loadMore.button}
        </Button>
      )}
      <VisuallyHidden role='status'>{announcement}</VisuallyHidden>
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0',
  } as CSSProperties,
  count: {
    margin: 0,
    color: theme.pallete.text.secondary,
  } as CSSProperties,
})
