import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { Banner } from './Banner'

describe('Banner', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Banner
        type='alert'
        title='Your plan expires in 3 days.'
        actions={<a href='/billing'>Renew plan</a>}
        onClose={jest.fn()}
      >
        Renew it to keep your projects.
      </Banner>
    )
    expect(container).toMatchSnapshot()
  })

  it('should show the title, the text and the actions', () => {
    const { container, getByRole } = render(
      <Banner title='Scheduled maintenance.' actions={<a href='/status'>Learn more</a>}>
        The system will be offline on Sunday from 10 PM.
      </Banner>
    )
    expect(container).toHaveTextContent('Scheduled maintenance.The system will be offline on Sunday from 10 PM.')
    expect(getByRole('link', { name: 'Learn more' })).toBeInTheDocument()
  })

  it('should close with the close button', () => {
    const onClose = jest.fn()
    const { getByRole } = render(<Banner onClose={onClose}>Welcome!</Banner>)

    fireEvent.click(getByRole('button', { name: 'Close announcement' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not have a close button without onClose', () => {
    const { queryByRole } = render(<Banner>Welcome!</Banner>)
    expect(queryByRole('button')).toBeNull()
  })

  it('should pass other props, such as a role for a banner shown later', () => {
    const { getByRole } = render(<Banner role='status'>Saved</Banner>)
    expect(getByRole('status')).toHaveTextContent('Saved')
  })
})
