import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Heading } from '../Heading'
import { Icon, IconImage } from '../Icon'

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'style'> {
  /**
   * Short sentence that says what is missing, such as "No orders found"
   */
  title: React.ReactNode

  /**
   * What happened and what the user can do next
   */
  description?: React.ReactNode

  /**
   * Icon shown above the title. Use `image` for an illustration instead.
   */
  icon?: IconImage

  /**
   * Illustration shown above the title, in place of the icon
   */
  image?: React.ReactNode

  /**
   * Buttons or links that help the user move on, such as "Clear filters"
   */
  actions?: React.ReactNode

  /**
   * Level of the title heading, to fit the outline of the page
   * @default 3
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6

  style?: ExternalStyles
}

/**
 * Message for a place that has no content yet, such as an empty list, a search without results or a
 * first use, with a way forward.
 */
export function EmptyState(props: EmptyStateProps) {
  const { title, description, icon, image, actions, headingLevel = 3, style, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  return (
    <div className={css(classes.root, style)} {...rest}>
      {image ? (
        <div className={classes.image}>{image}</div>
      ) : (
        icon && (
          <span className={classes.iconBox}>
            <Icon icon={icon} size={2} />
          </span>
        )
      )}
      <Heading level={headingLevel} fontWeight='bold' style={classes.title}>
        {title}
      </Heading>
      {description && <div className={classes.description}>{description}</div>}
      {actions && <div className={classes.actions}>{actions}</div>}
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem 1rem',
  } as CSSProperties,
  iconBox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '4rem',
    height: '4rem',
    marginBottom: '1rem',
    borderRadius: '50%',
    background: theme.pallete.surface.background,
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  image: {
    marginBottom: '1rem',
    maxWidth: '100%',
  } as CSSProperties,
  title: {
    margin: 0,
  } as CSSProperties,
  description: {
    maxWidth: '28rem',
    marginTop: '0.5rem',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
  } as CSSProperties,
})
