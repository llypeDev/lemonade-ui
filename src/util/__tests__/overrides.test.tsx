import { render } from '@testing-library/react'
import React, { useEffect } from 'react'

import { Step } from '../../components/Stepper/Step'
import { Stepper } from '../../components/Stepper/Stepper'
import { getComponents } from '../overrides'

describe('getComponents', () => {
  it('should return the components given, as they are, over the default ones', () => {
    const Root = React.forwardRef<HTMLDivElement>((props, ref) => <div ref={ref} {...props} />)
    const Icon = React.memo(() => <svg />)

    const components = getComponents<any>({ Root, Icon }, { Root: 'div', Icon: null, Label: 'span' })
    expect(components.Root).toBe(Root)
    expect(components.Icon).toBe(Icon)
    expect(components.Label).toBe('span')
  })

  it('should keep the default components for missing overrides', () => {
    expect(
      getComponents<any>(undefined, { Root: 'div' })
    ).toEqual({ Root: 'div' })
    expect(getComponents<any>({ Root: undefined }, { Root: 'div' })).toEqual({ Root: 'div' })
  })

  it('should not mount the overridden components again on each render', () => {
    const mounts = jest.fn()
    const Root = React.forwardRef<HTMLDivElement>((props, ref) => {
      useEffect(() => mounts(), [])
      return <div ref={ref} {...props} />
    })

    const { rerender } = render(
      <Stepper overrides={{ Root }}>
        <Step title='First' overrides={{ Root }} />
      </Stepper>
    )
    const count = mounts.mock.calls.length

    rerender(
      <Stepper overrides={{ Root }}>
        <Step title='First' overrides={{ Root }} />
      </Stepper>
    )
    expect(mounts).toHaveBeenCalledTimes(count)
  })
})
