import React, { CSSProperties, useEffect, useMemo, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { randomStr } from '../../util/string'

export interface TableOfContentsItem {
  /**
   * Id of the section the link goes to
   */
  id: string

  label: React.ReactNode

  /**
   * Level of the section, such as 2 for an `h2`. Deeper levels are indented.
   * @default 2
   */
  level?: number
}

export interface TableOfContentsProps {
  /**
   * The sections. Without them, the links come from the headings that `headings` finds in the page.
   */
  items?: TableOfContentsItem[]

  /**
   * CSS selector of the headings to list, such as `main h2, main h3`. Headings without an id get one from their
   * text.
   * @default 'h2, h3'
   */
  headings?: string

  /**
   * Height of what covers the top of the page, such as a fixed header, in pixels. A section counts as current
   * once its heading passes below it, and the links scroll the heading to just under it.
   * @default 0
   */
  offset?: number

  /**
   * Element that scrolls, when it is not the page
   */
  scrollContainer?: HTMLElement | null

  /**
   * Title of the navigation
   * @default "On this page", from the locale strings
   */
  label?: string

  style?: ExternalStyles
}

const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')

// Gives each heading without an id one made from its text, so the links can point to it
const collectHeadings = (selector: string): TableOfContentsItem[] =>
  Array.from(document.querySelectorAll<HTMLElement>(selector)).map((heading) => {
    if (!heading.id) {
      const base = slug(heading.textContent) || 'section'
      let id = base
      for (let count = 2; document.getElementById(id); count++) {
        id = `${base}-${count}`
      }
      heading.id = id
    }
    const level = /^H(\d)$/.exec(heading.tagName)
    return { id: heading.id, label: heading.textContent, level: level ? parseInt(level[1], 10) : 2 }
  })

const reducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Links to the sections of a long page, such as "On this page", that mark the section the user is reading as
 * the page scrolls. Put it beside the content, usually in a sticky column.
 */
export function TableOfContents(props: TableOfContentsProps) {
  const { items, headings = 'h2, h3', offset = 0, scrollContainer, label, style } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const titleId = useMemo(() => `table-of-contents-${randomStr()}`, [])
  const [found, setFound] = useState<TableOfContentsItem[]>([])
  const [activeId, setActiveId] = useState<string>(null)

  useEffect(() => {
    if (!items) {
      setFound(collectHeadings(headings))
    }
  }, [items, headings])

  const sections = items ?? found
  const minLevel = sections.reduce((min, section) => Math.min(min, section.level ?? 2), Infinity)

  // The current section is the last one whose heading has reached the top
  useEffect(() => {
    const target: HTMLElement | Window = scrollContainer ?? window
    let frame: number = null

    const update = () => {
      frame = null
      const top = (scrollContainer ? scrollContainer.getBoundingClientRect().top : 0) + offset
      let current: string = null
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.getBoundingClientRect().top <= top + 8) {
          current = section.id
        }
      }

      // At the end of the page, the last sections may never reach the top
      const scroller = scrollContainer ?? document.documentElement
      const atBottom =
        scroller.scrollHeight > scroller.clientHeight &&
        Math.ceil((scrollContainer ? scrollContainer.scrollTop : window.pageYOffset) + scroller.clientHeight) >=
          scroller.scrollHeight
      if (atBottom && sections.length > 0) {
        current = sections[sections.length - 1].id
      }

      setActiveId(current ?? (sections.length > 0 ? sections[0].id : null))
    }

    const schedule = () => {
      if (frame === null) {
        frame = requestAnimationFrame(update)
      }
    }

    update()
    target.addEventListener('scroll', schedule)
    window.addEventListener('resize', schedule)
    return () => {
      frame !== null && cancelAnimationFrame(frame)
      target.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [sections, offset, scrollContainer])

  const handleClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const element = document.getElementById(id)
    if (!element || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      return
    }

    e.preventDefault()
    const behavior = reducedMotion() ? 'auto' : 'smooth'
    if (scrollContainer) {
      const top =
        element.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop
      scrollContainer.scrollTo && scrollContainer.scrollTo({ top: top - offset, behavior })
    } else {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - offset, behavior })
    }

    // The heading takes the focus, so the keyboard and screen readers continue from the section
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1')
    }
    element.focus({ preventScroll: true })
    window.history.replaceState(null, '', `#${id}`)
    setActiveId(id)
  }

  if (sections.length === 0) {
    return null
  }

  return (
    <nav aria-labelledby={titleId} className={css(classes.root, style)}>
      <p id={titleId} className={classes.title}>
        {label ?? locale.tableOfContents.label}
      </p>
      <ul className={classes.list}>
        {sections.map((section) => {
          const active = section.id === activeId
          const depth = Math.max(0, (section.level ?? 2) - minLevel)
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={css(classes.link, active && classes.active)}
                style={{ paddingLeft: `${0.75 + depth}rem` }}
                aria-current={active ? 'location' : undefined}
                onClick={handleClick(section.id)}
              >
                {section.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
  } as CSSProperties,
  title: {
    margin: '0 0 0.5rem',
    fontWeight: 'bold',
  } as CSSProperties,
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    borderLeft: `2px solid ${theme.pallete.divider}`,
  } as CSSProperties,
  link: {
    display: 'block',
    marginLeft: -2,
    padding: '0.25rem 0.5rem 0.25rem 0.75rem',
    borderLeft: '2px solid transparent',
    color: theme.pallete.text.secondary,
    textDecoration: 'none',
    outline: 'none',
    transition: 'color .2s, border-color .2s',
    '&:hover': {
      color: theme.pallete.text.main,
      textDecoration: 'underline',
    },
    '&:focus': {
      borderRadius: theme.radius.input,
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  active: {
    borderLeftColor: theme.pallete.primary.main,
    color: theme.pallete.primary.main,
    fontWeight: 'bold',
    '&:hover': {
      color: theme.pallete.primary.main,
    },
  } as CSSProperties,
})
