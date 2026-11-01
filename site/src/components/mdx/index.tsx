import { focusBoxShadow, Heading, Link as UiLink, Text, Theme, useStyles } from '@lemonade/ui'
import { gray } from '@lemonade/ui/styles/colors'
import { useIntl } from 'gatsby-plugin-intl'
import React, { useEffect, useRef, useState } from 'react'
import { CSSProperties } from 'react'

import { Image as UiImage } from '../Image'

export function Paragraph(props: any) {
  const { classes } = useStyles(createStyles)
  return <Text component='p' style={classes.paragraph} {...props} />
}

export function createHeading(level: number) {
  return (props: any) => {
    const { classes, css } = useStyles(createStyles)
    return <Heading level={level} {...props} style={css(props.style, classes.heading)} />
  }
}

export function Link(props: any) {
  const { classes } = useStyles(createStyles)
  return <UiLink style={classes.link} {...props} />
}

export function Image(props: any) {
  const { classes } = useStyles(createStyles)
  return <UiImage className={classes.image} {...props} />
}

export function UnorderedList(props: any) {
  const { classes } = useStyles(createStyles)
  return <ul className={classes.list} {...props} />
}

export function OrderedList(props: any) {
  const { classes } = useStyles(createStyles)
  return <ol className={classes.list} {...props} />
}

export function Blockquote(props: any) {
  const { classes } = useStyles(createStyles)
  return <blockquote className={classes.blockquote} {...props} />
}

export function Table(props: any) {
  const { classes } = useStyles(createStyles)
  const intl = useIntl()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(false)

  // A wide table scrolls inside its own box instead of making the whole page wider. While it scrolls, the box takes
  // the focus, so keyboard users can scroll it with the arrow keys.
  useEffect(() => {
    const wrapper = wrapperRef.current
    const check = () => setScrollable(wrapper.scrollWidth > wrapper.clientWidth)
    const observer = new ResizeObserver(check)
    observer.observe(wrapper)
    observer.observe(wrapper.firstElementChild)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={classes.tableWrapper}
      role={scrollable ? 'region' : undefined}
      aria-label={scrollable ? intl.formatMessage({ id: 'scrollable-table' }) : undefined}
      tabIndex={scrollable ? 0 : undefined}
    >
      <table className={classes.table} {...props} />
    </div>
  )
}

export function Pre(props: any) {
  const { className, ...rest } = props
  const { classes } = useStyles(createStyles)
  return <pre className={`${className} ${classes.pre}`} {...rest} />
}

export function Code(props: any) {
  const { className, ...rest } = props
  const { classes } = useStyles(createStyles)
  return <code className={`${className} ${classes.code}`} {...rest} />
}

const createStyles = (theme: Theme) => ({
  paragraph: {
    fontSize: '1rem',
    marginBottom: '2rem',
  } as CSSProperties,
  link: {
    fontSize: '1em',
  } as CSSProperties,
  heading: {
    marginBottom: '2rem',
  } as CSSProperties,
  list: {
    fontSize: '1rem',
    margin: '0 0 2rem 0',
    lineHeight: 1.5,
  } as CSSProperties,
  image: {
    maxWidth: '100%',
    marginBottom: '2rem',
  } as CSSProperties,
  blockquote: {
    position: 'relative',
    p: {
      color: theme.pallete.primary.main,
      fontStyle: 'italic',
      fontSize: '1.25rem',
    },
    marginLeft: '7rem',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '-6rem',
      top: '0.75rem',
      width: 78,
      height: 2,
      borderTop: `2px solid ${theme.pallete.primary.c80}`,
    },
  } as CSSProperties,
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '2rem',
    '&:focus': {
      outline: 'none',
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  table: {
    fontSize: '1rem',
    borderCollapse: 'collapse',
    width: '100%',

    'td, th': {
      borderBottom: `1px solid ${theme.pallete.divider}`,
      textAlign: 'left',
      padding: '1rem 0',
      '&:not(:last-child)': {
        paddingRight: '2rem',
      },
    },
  } as CSSProperties,
  pre: {
    fontSize: '15px !important',
    marginBottom: '2rem !important',
    border: `1px solid ${theme.pallete.divider} !important`,
    background: `${gray.c10} !important`,
  } as CSSProperties,
  code: {
    fontSize: '15px !important',
    padding: '0.125rem 0.25rem !important',
    lineHeight: '1.25 !important',
    background: `${gray.c10} !important`,
  } as CSSProperties,
})
