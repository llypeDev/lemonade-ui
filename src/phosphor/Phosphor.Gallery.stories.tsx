import React, { CSSProperties, useMemo, useState } from 'react'

import { Text } from '../components/Text'
import { TextField } from '../components/TextField'
import { Theme, useStyles } from '../styles'

import { PhosphorIcon } from './createPhosphorIcon'
import * as generated from './generated'
import { PHOSPHOR_VERSION } from './generated/names'
import { PHOSPHOR_WEIGHTS, PhosphorIconProps } from './types'

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

// The generated index also re-exports deprecated aliases (e.g. `PhCircleWavyWarning` → `PhSealWarning`),
// so keep only the exports whose name matches the component's own display name: one entry per icon.
const icons = Object.keys(generated)
  .map((name) => ({ name, Icon: generated[name] as PhosphorIcon, key: normalize(name.slice(2)) }))
  .filter(({ name, Icon }) => Icon.displayName === name)

type GalleryProps = Pick<PhosphorIconProps, 'weight' | 'size' | 'color' | 'mirrored'>

function Gallery(props: GalleryProps) {
  const { weight, size, color, mirrored } = props
  const [query, setQuery] = useState('')
  const { classes } = useStyles(createStyles)

  const results = useMemo(() => {
    const search = normalize(query)
    return search ? icons.filter(({ key }) => key.includes(search)) : icons
  }, [query])

  return (
    <div>
      <TextField
        name='search'
        label='Search'
        placeholder={`Search ${icons.length} icons by name, e.g. arrow circle`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        clearable
      />

      <Text component='p' color='secondary' style={{ marginTop: '0.5rem' }}>
        {results.length} of {icons.length} icons · Phosphor v{PHOSPHOR_VERSION} · hover an icon to see its import
      </Text>

      <ul className={classes.grid}>
        {results.map(({ name, Icon }) => (
          <li key={name} className={classes.tile} title={`import { ${name} } from '@lemonade/ui/phosphor'`}>
            <Icon weight={weight} size={size} color={color} mirrored={mirrored} />
            <span className={classes.name}>
              {name.split(/(?=[A-Z])/).map((part, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <wbr />}
                  {part}
                </React.Fragment>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
    gap: '0.5rem',
    listStyle: 'none',
    margin: '1rem 0 0 0',
    padding: 0,
  } as CSSProperties,
  tile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0.5rem',
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.paper,
    color: theme.pallete.text.main,
  } as CSSProperties,
  name: {
    fontSize: '0.75rem',
    color: theme.pallete.text.secondary,
    textAlign: 'center',
    wordBreak: 'break-word',
  } as CSSProperties,
})

export default {
  title: 'Phosphor/Gallery',
  argTypes: {
    weight: { control: 'select', options: PHOSPHOR_WEIGHTS },
    size: { control: { type: 'range', min: 16, max: 96, step: 4 } },
    color: { control: 'color' },
    mirrored: { control: 'boolean' },
  },
  args: {
    weight: 'regular',
    size: 32,
    color: 'currentColor',
    mirrored: false,
  },
}

export const AllIcons = (args) => <Gallery {...args} />

// 1,512 icons make a huge, fragile screenshot: the other Phosphor stories cover rendering in the visual tests
AllIcons.parameters = { loki: { skip: true } }
