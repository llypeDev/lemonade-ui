import { SerializedStyles } from '@emotion/core'
import React, { CSSProperties, ReactElement } from 'react'
import { Theme, useStyles } from '../../../styles'
import { Icon, IconImage } from '../../Icon'

export interface BoxProps {
  styles?: SerializedStyles
  icon?: IconImage
  rotation?: '0' | '90'
  label: string
  children: ReactElement

  /**
   * Level of the heading with the label. It looks the same at any level, so it can follow the headings of the page.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

export function Box(props: BoxProps) {
  const { styles, icon, rotation, label, children, headingLevel } = props

  const { classes, css } = useStyles(createStyles)
  const HeadingTag = `h${headingLevel}` as 'h4'

  return (
    <div className={classes.wrapper}>
      <div className={classes.panel}>
        <HeadingTag className={classes.header}>
          {icon && (
            <Icon
              icon={icon}
              style={css`
                transform: rotate(${rotation}deg);
              `}
            />
          )}
          {label}
        </HeadingTag>
      </div>
      <div className={css(classes.children, styles)}>{children}</div>
    </div>
  )
}

Box.defaultProps = {
  rotation: '0',
  headingLevel: 4,
} as Partial<BoxProps>

const createStyles = (theme: Theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // The size the global styles give to an h4, at any level
    margin: 0,
    fontSize: '0.875rem',
  } as CSSProperties,

  panel: {
    backgroundColor: theme.pallete.gray.c90,
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,

  wrapper: {
    border: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,

  children: {
    minHeight: '7.18rem',
  } as CSSProperties,
})
