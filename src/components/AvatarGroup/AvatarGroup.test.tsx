import { render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'
import { Avatar } from '../Avatar'

import { AvatarGroup } from './AvatarGroup'

const team = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha', 'Elisa Melo', 'Fábio Cruz']

describe('AvatarGroup', () => {
  it('should render correctly', () => {
    const { container } = render(
      <AvatarGroup aria-label='Team' max={3}>
        {team.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    )
    expect(container).toMatchSnapshot()
  })

  it('should show every avatar when they fit', () => {
    const { getByRole, getAllByRole } = render(
      <AvatarGroup aria-label='Team' max={4}>
        {team.slice(0, 4).map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    )

    expect(getByRole('group', { name: 'Team' })).toBeInTheDocument()
    expect(getAllByRole('img')).toHaveLength(4)
  })

  it('should sum up the avatars that do not fit, with their names', () => {
    const { getAllByRole, getByRole } = render(
      <AvatarGroup aria-label='Team' max={4}>
        {team.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    )

    expect(getAllByRole('img')).toHaveLength(4)
    const more = getByRole('img', { name: '3 more: Diego Rocha, Elisa Melo, Fábio Cruz' })
    expect(more).toHaveTextContent('+3')
    expect(more).toHaveAttribute('title', 'Diego Rocha, Elisa Melo, Fábio Cruz')
  })

  it('should give the size to every avatar', () => {
    const { container, rerender } = render(
      <AvatarGroup size='large'>
        <Avatar name='Ana Souza' />
      </AvatarGroup>
    )
    const large = container.querySelector('[role="img"]').className

    rerender(
      <AvatarGroup size='small'>
        <Avatar name='Ana Souza' />
      </AvatarGroup>
    )
    expect(container.querySelector('[role="img"]').className).not.toBe(large)
  })

  it('should translate the summary', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <AvatarGroup max={2}>
          {team.slice(0, 3).map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
      </LocaleContext.Provider>
    )
    expect(getByRole('img', { name: 'mais 2: Bruno Lima, Carla Dias' })).toBeInTheDocument()
  })
})
