import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Icon, IconImage } from '../Icon'

export type TimelineItemType = 'normal' | 'info' | 'success' | 'alert' | 'danger'

export interface TimelineItem {
  /**
   * What happened, such as "Order shipped"
   */
  title: React.ReactNode

  /**
   * Details of the event
   */
  description?: React.ReactNode

  /**
   * When it happened, as shown to the user, such as "Oct 12, 9:41 AM"
   */
  time?: React.ReactNode

  /**
   * Machine-readable date of `time`, such as `2026-10-12T09:41`, for the `datetime` attribute
   */
  dateTime?: string

  /**
   * Icon in the marker. Without it, the marker is a dot.
   */
  icon?: IconImage

  /**
   * Color of the marker. Say the meaning in the title too, since not everyone sees colors.
   * @default 'normal'
   */
  type?: TimelineItemType

  key?: React.Key
}

export interface TimelineProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'style'> {
  items: TimelineItem[]
  style?: ExternalStyles
}

/**
 * Events in order of time, such as the status history of an order or the activity on a record.
 */
export function Timeline(props: TimelineProps) {
  const { items, style, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  return (
    <ol className={css(classes.list, style)} {...rest}>
      {items.map((item, index) => {
        const type = item.type ?? 'normal'

        return (
          <li key={item.key ?? index} className={classes.item}>
            <span className={css(classes.marker, classes[type], !item.icon && classes.dotMarker)} aria-hidden='true'>
              {item.icon ? <Icon icon={item.icon} size={1} /> : <span className={css(classes[type], classes.dot)} />}
            </span>
            <div className={classes.content}>
              <div className={classes.header}>
                <span className={classes.title}>{item.title}</span>
                {item.time && (
                  <time className={classes.time} dateTime={item.dateTime}>
                    {item.time}
                  </time>
                )}
              </div>
              {item.description && <div className={classes.description}>{item.description}</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const markerSize = 2

const createStyles = (theme: Theme) => ({
  list: {
    ...theme.typography.variant('main'),
    listStyle: 'none',
    margin: 0,
    padding: 0,
  } as CSSProperties,
  item: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: `${markerSize}rem 1fr`,
    columnGap: '1rem',
    paddingBottom: '1.5rem',
    '&:last-child': {
      paddingBottom: 0,
    },
    // Line from the center of this marker to the center of the next one, behind both
    '&:not(:last-child)::before': {
      content: '""',
      position: 'absolute',
      left: `calc(${markerSize / 2}rem - 1px)`,
      top: `${markerSize / 2}rem`,
      bottom: `-${markerSize / 2}rem`,
      width: 2,
      background: theme.pallete.divider,
    },
  } as CSSProperties,
  marker: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${markerSize}rem`,
    height: `${markerSize}rem`,
    borderRadius: '50%',
  } as CSSProperties,
  dotMarker: {
    background: 'transparent',
  } as CSSProperties,
  dot: {
    width: '0.75rem',
    height: '0.75rem',
    borderRadius: '50%',
    background: 'currentColor',
  } as CSSProperties,
  normal: {
    color: theme.pallete.gray.c40,
    background: theme.pallete.gray.c90,
  } as CSSProperties,
  info: {
    color: theme.pallete.status.info.main,
    background: theme.pallete.status.info.background,
  } as CSSProperties,
  success: {
    color: theme.pallete.status.success.main,
    background: theme.pallete.status.success.background,
  } as CSSProperties,
  alert: {
    color: theme.pallete.status.alert.main,
    background: theme.pallete.status.alert.background,
  } as CSSProperties,
  danger: {
    color: theme.pallete.status.danger.main,
    background: theme.pallete.status.danger.background,
  } as CSSProperties,
  content: {
    minWidth: 0,
  } as CSSProperties,
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: '0.5rem',
    // As tall as the marker, so a one line title is centered with it
    minHeight: `${markerSize}rem`,
  } as CSSProperties,
  title: {
    fontWeight: 'bold',
  } as CSSProperties,
  time: {
    color: theme.pallete.text.secondary,
    whiteSpace: 'nowrap',
  } as CSSProperties,
  description: {
    color: theme.pallete.text.main,
    overflowWrap: 'anywhere',
  } as CSSProperties,
})
