import { Button, Icon, lightTheme, Theme, Tooltip, useStyles } from '@lemonade/ui'
import { changeLocale, useIntl } from 'gatsby-plugin-intl'
import React from 'react'

import { LemonadeLogo } from './LemonadeLogo'
import { LocaleLink } from './LocaleLink'
import { SIDE_NAV_WIDTH } from './SideNav'

interface AppHeaderProps {
  navOpen: boolean
  switchTheme(): void
  onNavChange(open: boolean): void
}

export function AppHeader(props: AppHeaderProps) {
  const { navOpen, onNavChange, switchTheme } = props
  const { css, classes, theme } = useStyles(createStyles)
  const intl = useIntl()

  const changeNavState = (open: boolean) => () => onNavChange(open)

  const handleLocaleChange = (lang: string) => () => {
    changeLocale(lang)
  }

  return (
    <header className={classes.header}>
      <div className={classes.menuIcon}>
        <Button
          skin='ghost'
          size='small'
          onClick={changeNavState(!navOpen)}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
        >
          {!navOpen ? <Icon icon='hamburguerMenu' /> : <Icon icon='timesDefault' />}
        </Button>
      </div>

      <div className={classes.logo}>
        <LocaleLink to='/' style={{ display: 'inline-block' }}>
          <LemonadeLogo aria-label='Lemonade' style={{ height: '2.5rem' }} />
        </LocaleLink>
      </div>

      <div className={classes.toolbar}>
        <Tooltip text='English'>
          <Button
            skin='ghost'
            size='small'
            style={css(intl.locale === 'en' && classes.toolbarActive)}
            onClick={handleLocaleChange('en')}
          >
            EN
          </Button>
        </Tooltip>
        <Tooltip text='Português'>
          <Button
            skin='ghost'
            size='small'
            style={css(intl.locale === 'pt' && classes.toolbarActive)}
            onClick={handleLocaleChange('pt')}
          >
            PT
          </Button>
        </Tooltip>
        <div className={classes.toolbarSeparator} />
        <Tooltip
          text={
            theme === lightTheme
              ? intl.formatMessage({ id: 'switch-to-dark' })
              : intl.formatMessage({ id: 'switch-to-light' })
          }
        >
          <Button skin='ghost' size='small' onClick={switchTheme}>
            <Icon icon='lightbulbFilled' />
          </Button>
        </Tooltip>
      </div>
    </header>
  )
}

export const APP_HEADER_HEIGHT = 76

const createStyles = (theme: Theme) => ({
  header: {
    background: theme.pallete.surface.main,
    padding: '1rem 2rem',
    boxShadow: theme.shadows.outer[60],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
    position: 'fixed',
    width: '100%',
  } as React.CSSProperties,
  menuIcon: {
    display: 'none',

    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
  },
  logo: {
    borderRight: `1px solid ${theme.pallete.divider}`,
    width: `calc(${SIDE_NAV_WIDTH}px - 2rem)`,
    padding: '0 1rem 0 2.75rem',

    [theme.breakpoints.down('md')]: {
      borderRight: 'none',
      width: 'auto',
      paddingRight: 0,
      paddingLeft: 0,
    },
  } as React.CSSProperties,
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    '& > *': {
      margin: '0 0.25rem',
    },
  },
  toolbarSeparator: {
    background: theme.pallete.divider,
    width: '1px',
    height: '2rem',
  },
  toolbarActive: {
    border: `1px solid ${theme.pallete.divider}`,
    background: theme.pallete.gray.c90,
  },
})
