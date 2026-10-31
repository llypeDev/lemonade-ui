import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { format } from '../../util/byte'
import { Icon } from '../Icon'
import { Progress } from '../Progress/Progress'

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

/**
 * The files a user added, such as with a `FileUploader` with `multiple`, each with its size, the progress of its
 * upload, and buttons to remove it or to try again when the upload fails.
 */
export function FileList(props: FileListProps) {
  const { files, onRemove, onRetry, style } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)

  if (files.length === 0) {
    return null
  }

  return (
    <ul className={css(classes.list, style)}>
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
                status === 'error' ? 'exclamationTriangleOutline' : status === 'done' ? 'checkCircleOutline' : 'upload'
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
                type='button'
                className={classes.button}
                aria-label={`${locale.fileUploader.retry}: ${file.name}`}
                title={locale.fileUploader.retry}
                onClick={() => onRetry(file.id)}
              >
                <Icon icon='redo' size={1.25} />
              </button>
            )}
            {onRemove && (
              <button
                type='button'
                className={classes.button}
                aria-label={fill(locale.fileUploader.remove, { file: file.name })}
                title={fill(locale.fileUploader.remove, { file: file.name })}
                onClick={() => onRemove(file.id)}
              >
                <Icon icon='timesDefault' size={1.25} />
              </button>
            )}
          </li>
        )
      })}
    </ul>
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
  } as CSSProperties,
})
