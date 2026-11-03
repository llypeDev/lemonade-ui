import React, { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { format } from '../../util/byte'
import { Icon } from '../Icon'
import { Progress } from '../Progress/Progress'
import { VisuallyHidden } from '../VisuallyHidden'

export type FileListStatus = 'uploading' | 'done' | 'error'

export interface FileListItem {
  /**
   * Unique id of the file, passed to `onRemove` and `onRetry`
   */
  id: string

  name: string

  /**
   * Size in bytes
   */
  size?: number

  /**
   * @default 'done'
   */
  status?: FileListStatus

  /**
   * Percentage of the upload, from 0 to 100, while uploading
   */
  progress?: number

  /**
   * Why the upload failed, such as "The server did not answer"
   */
  error?: string
}

export interface FileListProps {
  files: FileListItem[]

  /**
   * Shows a button to remove each file
   */
  onRemove?(id: string): void

  /**
   * Shows a button to upload again the files that failed
   */
  onRetry?(id: string): void

  style?: ExternalStyles
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

// The layout effect does nothing in server rendering, and React warns about it there
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Elements reached with Tab, in the order of the page
const tabbables = () =>
  Array.from(document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')).filter(
    (element) => element.tabIndex >= 0 && !(element as HTMLButtonElement).disabled
  )

// Focuses the first element that takes the focus, skipping those that cannot, such as hidden ones
const focusFirst = (elements: HTMLElement[]) =>
  elements.some((element) => {
    element && document.contains(element) && element.focus()
    return !!element && document.activeElement === element
  })

// An action the list waits for: the application removes the file, or uploads it again, now or later
interface PendingAction {
  id: string
  name: string
  retry: boolean
  ids: string[]
  index: number
  hadFocus: boolean

  // The elements reached with Tab just before and just after the list, for when no file is left
  outside: HTMLElement[]
}

/**
 * The files a user added, such as with a `FileUploader` with `multiple`, each with its size, the progress of its
 * upload, and buttons to remove it or to try again when the upload fails.
 */
export function FileList(props: FileListProps) {
  const { files, onRemove, onRetry, style } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const [announcement, setAnnouncement] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const pending = useRef<PendingAction>(null)
  const removeButtons = useRef<Record<string, HTMLButtonElement>>({})
  const retryButtons = useRef<Record<string, HTMLButtonElement>>({})

  const ids = files.map((file) => file.id)

  const start = (e: React.MouseEvent<HTMLButtonElement>, file: FileListItem, retry: boolean) => {
    // A click focuses the button in most browsers, but not in Safari: the focus moves only if it was there
    const hadFocus = e.currentTarget === document.activeElement
    const list = listRef.current
    const around = hadFocus ? tabbables().filter((element) => !list.contains(element)) : []
    const after = around.filter((element) => list.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
    const before = around.filter((element) => !after.includes(element))

    pending.current = {
      id: file.id,
      name: file.name,
      retry,
      ids,
      index: ids.indexOf(file.id),
      hadFocus,
      outside: [before[before.length - 1], after[0]].filter(Boolean),
    }
  }

  // Once the application removes the file, the removal is announced. The focus, lost with the button, moves to
  // the same file after a retry, else to the next file, else to the previous one, else next to the list, such as
  // to the FileUploader before it.
  useIsomorphicLayoutEffect(() => {
    const action = pending.current
    const file = action && files.find((other) => other.id === action.id)
    // A removed file is still in the list, or a retried one has still failed: the application has not done it yet
    const waiting = file && (!action.retry || (file.status ?? 'done') === 'error')
    if (!action || waiting) {
      return
    }
    pending.current = null
    !action.retry && setAnnouncement(fill(locale.fileUploader.removed, { file: action.name }))

    const active = document.activeElement
    if (!action.hadFocus || (active && active !== document.body)) {
      return
    }
    const nearby = [
      ...(action.retry ? [action.id] : []),
      ...action.ids.slice(action.index + 1),
      ...action.ids.slice(0, action.index).reverse(),
    ]
    focusFirst([...nearby.map((id) => removeButtons.current[id] || retryButtons.current[id]), ...action.outside])
  })

  // The announcements need a live region that is already on the page, also once the last file is gone
  const liveRegion = onRemove ? <VisuallyHidden role='status'>{announcement}</VisuallyHidden> : null

  if (files.length === 0) {
    return liveRegion
  }

  return (
    <>
      <ul ref={listRef} className={css(classes.list, style)}>
        {files.map((file) => {
          const status = file.status ?? 'done'
          const statusText =
            status === 'uploading'
              ? `${locale.fileUploader.uploading}${file.progress !== undefined ? ` ${Math.round(file.progress)}%` : ''}`
              : status === 'error'
              ? file.error
                ? `${locale.fileUploader.failed}: ${file.error}`
                : locale.fileUploader.failed
              : locale.fileUploader.done

          return (
            <li key={file.id} className={css(classes.item, status === 'error' && classes.failed)}>
              <Icon
                icon={
                  status === 'error'
                    ? 'exclamationTriangleOutline'
                    : status === 'done'
                    ? 'checkCircleOutline'
                    : 'upload'
                }
                size={1.25}
                style={css(classes.icon, status === 'done' && classes.doneIcon)}
              />
              <div className={classes.details}>
                <div className={classes.top}>
                  <span className={classes.name}>{file.name}</span>
                  {file.size !== undefined && <span className={classes.size}>{format(file.size, 0)}</span>}
                </div>
                {status === 'uploading' && file.progress !== undefined && (
                  <Progress value={file.progress} style={classes.progress} />
                )}
                <span className={classes.status}>{statusText}</span>
              </div>
              {status === 'error' && onRetry && (
                <button
                  ref={(element) => {
                    retryButtons.current[file.id] = element
                  }}
                  type='button'
                  className={classes.button}
                  aria-label={`${locale.fileUploader.retry}: ${file.name}`}
                  title={locale.fileUploader.retry}
                  onClick={(e) => {
                    start(e, file, true)
                    onRetry(file.id)
                  }}
                >
                  <Icon icon='redo' size={1.25} />
                </button>
              )}
              {onRemove && (
                <button
                  ref={(element) => {
                    removeButtons.current[file.id] = element
                  }}
                  type='button'
                  className={classes.button}
                  aria-label={fill(locale.fileUploader.remove, { file: file.name })}
                  title={fill(locale.fileUploader.remove, { file: file.name })}
                  onClick={(e) => {
                    start(e, file, false)
                    onRemove(file.id)
                  }}
                >
                  <Icon icon='timesDefault' size={1.25} />
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {liveRegion}
    </>
  )
}

const createStyles = (theme: Theme) => ({
  list: {
    ...theme.typography.variant('main'),
    listStyle: 'none',
    margin: '0.5rem 0 0',
    padding: 0,
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.paper,
  } as CSSProperties,
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 0.5rem 0.75rem 1rem',
    '& + &': {
      borderTop: `1px solid ${theme.pallete.divider}`,
    },
  } as CSSProperties,
  failed: {
    background: theme.pallete.status.danger.background,
  } as CSSProperties,
  icon: {
    flexShrink: 0,
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  doneIcon: {
    color: theme.pallete.status.success.main,
  } as CSSProperties,
  details: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  } as CSSProperties,
  top: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
  } as CSSProperties,
  name: {
    fontWeight: 'bold',
    overflowWrap: 'anywhere',
  } as CSSProperties,
  size: {
    flexShrink: 0,
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  progress: {
    width: '100%',
  } as CSSProperties,
  status: {
    color: theme.pallete.text.secondary,
    fontSize: '0.875rem',
  } as CSSProperties,
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '2rem',
    height: '2rem',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: theme.radius.button,
    background: 'transparent',
    color: theme.pallete.text.secondary,
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      background: theme.pallete.surface.background,
      color: theme.pallete.text.main,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
    // Only the keyboard shows the ring, not a click. Browsers without :focus-visible drop this rule and show it.
    '&:focus:not(:focus-visible)': {
      boxShadow: 'none',
    },
  } as CSSProperties,
})
