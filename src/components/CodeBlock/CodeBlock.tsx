import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { CopyButton } from '../CopyButton'
import { monospaceFontFamily } from '../Kbd/Kbd'

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'title'> {
  /**
   * The code, as text
   */
  code: string

  /**
   * Language of the code, such as `bash` or `json`, shown in the header when there is no title
   */
  language?: string

  /**
   * Title in the header, such as the name of a file
   */
  title?: React.ReactNode

  /**
   * Shows a button that copies the code
   * @default true
   */
  copyable?: boolean

  /**
   * Numbers the lines
   * @default false
   */
  showLineNumbers?: boolean

  /**
   * Breaks long lines instead of scrolling sideways
   * @default false
   */
  wrap?: boolean

  /**
   * Height above which the code scrolls, as a CSS value or pixels
   */
  maxHeight?: number | string

  style?: ExternalStyles
}

/**
 * Block of code, such as a command, a configuration or a response of an API, with a button that copies it.
 * It shows the code as it is, without syntax highlighting.
 */
export function CodeBlock(props: CodeBlockProps) {
  const {
    code,
    language,
    title,
    copyable = true,
    showLineNumbers = false,
    wrap = false,
    maxHeight,
    style,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, wrap, maxHeight)
  const heading = title ?? language
  const lines = code.replace(/\n$/, '').split('\n')

  return (
    <div className={css(classes.root, style)} {...rest}>
      {(heading || copyable) && (
        <div className={classes.header}>
          <span className={classes.title}>{heading}</span>
          {copyable && <CopyButton text={code} size='small' skin='ghost' />}
        </div>
      )}
      {/* The code can scroll, so it takes the focus to scroll by keyboard */}
      <pre
        className={classes.pre}
        tabIndex={0}
        aria-label={typeof heading === 'string' ? heading : locale.codeBlock.label}
        data-language={language}
      >
        <code className={css(classes.code, showLineNumbers && classes.numbered)}>
          {showLineNumbers
            ? lines.map((line, index) => (
                <span key={index} className={classes.line}>
                  {line}
                  {index < lines.length - 1 && '\n'}
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  )
}

const createStyles = (theme: Theme, wrap: boolean, maxHeight: number | string) => ({
  root: {
    ...theme.typography.variant('main'),
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.paper,
    background: theme.pallete.surface.background,
    overflow: 'hidden',
    minWidth: 0,
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    minHeight: '2.5rem',
    padding: '0.25rem 0.25rem 0.25rem 1rem',
    boxSizing: 'border-box',
    borderBottom: `1px solid ${theme.pallete.divider}`,
    background: theme.pallete.surface.main,
  } as CSSProperties,
  title: {
    color: theme.pallete.text.secondary,
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as CSSProperties,
  pre: {
    margin: 0,
    padding: '0.75rem 1rem',
    overflow: 'auto',
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
    outline: 'none',
    '&:focus-visible': {
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
    },
  } as CSSProperties,
  code: {
    display: 'block',
    fontFamily: monospaceFontFamily,
    fontSize: '0.8125rem',
    lineHeight: 1.6,
    color: theme.pallete.text.main,
    whiteSpace: wrap ? 'pre-wrap' : 'pre',
    overflowWrap: wrap ? 'anywhere' : 'normal',
    tabSize: 2,
  } as CSSProperties,
  numbered: {
    counterReset: 'line',
  } as CSSProperties,
  line: {
    counterIncrement: 'line',
    '&::before': {
      content: 'counter(line)',
      display: 'inline-block',
      width: '2rem',
      marginRight: '1rem',
      textAlign: 'right',
      color: theme.pallete.text.secondary,
      userSelect: 'none',
    },
  } as CSSProperties,
})
