import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { ImageViewer, ImageViewerProps } from './ImageViewer'

const photos = [
  { src: '/front.jpg', alt: 'Front of the chair', caption: 'Oak chair, front' },
  { src: '/side.jpg', alt: 'Side of the chair' },
  { src: '/back.jpg', alt: 'Back of the chair' },
]

const Gallery = (props: Partial<ImageViewerProps>) => {
  const [open, setOpen] = useState(props.open ?? false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open photos</button>
      <ImageViewer images={photos} {...props} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

const image = () => document.querySelector('img')

describe('ImageViewer', () => {
  it('should render correctly', () => {
    render(<ImageViewer images={photos} open onClose={jest.fn()} />)
    expect(document.body).toMatchSnapshot()
  })

  it('should render nothing when closed', () => {
    const { queryByRole } = render(<ImageViewer images={photos} open={false} onClose={jest.fn()} />)
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should open as a modal dialog with the focus on the close button', () => {
    const { getByRole } = render(<Gallery />)
    fireEvent.click(getByRole('button', { name: 'Open photos' }))

    const dialog = getByRole('dialog', { name: 'Image viewer' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(getByRole('button', { name: 'Close' })).toHaveFocus()
    expect(image()).toHaveAttribute('alt', 'Front of the chair')
    expect(dialog).toHaveTextContent('1 of 3')
    expect(dialog).toHaveTextContent('Oak chair, front')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('should go through the images with the buttons and the arrow keys', () => {
    const onIndexChange = jest.fn()
    const { getByRole } = render(<Gallery open onIndexChange={onIndexChange} />)
    const dialog = getByRole('dialog')

    expect(getByRole('button', { name: 'Previous image' })).toBeDisabled()
    fireEvent.click(getByRole('button', { name: 'Next image' }))
    expect(image()).toHaveAttribute('alt', 'Side of the chair')
    expect(getByRole('status')).toHaveTextContent('2 of 3. Side of the chair')

    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(image()).toHaveAttribute('alt', 'Back of the chair')
    expect(getByRole('button', { name: 'Next image' })).toBeDisabled()

    fireEvent.keyDown(dialog, { key: 'Home' })
    expect(image()).toHaveAttribute('alt', 'Front of the chair')
    expect(onIndexChange.mock.calls).toEqual([[1], [2], [0]])
  })

  it('should zoom with the buttons, the keys, the wheel and a double click', () => {
    const { getByRole } = render(<Gallery open />)
    const dialog = getByRole('dialog')

    expect(getByRole('button', { name: 'Zoom out' })).toBeDisabled()
    fireEvent.click(getByRole('button', { name: 'Zoom in' }))
    expect(image().style.transform).toBe('translate(0px, 0px) scale(1.5)')

    fireEvent.keyDown(dialog, { key: '+' })
    expect(image().style.transform).toContain('scale(2)')

    fireEvent.wheel(image(), { deltaY: 100 })
    expect(image().style.transform).toContain('scale(1.5)')

    fireEvent.keyDown(dialog, { key: '0' })
    expect(image().style.transform).toContain('scale(1)')

    fireEvent.doubleClick(image())
    expect(image().style.transform).toContain('scale(2)')
    fireEvent.click(getByRole('button', { name: 'Fit to screen' }))
    expect(image().style.transform).toBe('translate(0px, 0px) scale(1)')
  })

  it('should move a zoomed image with the arrow keys instead of changing image', () => {
    const { getByRole } = render(<Gallery open />)
    const dialog = getByRole('dialog')

    fireEvent.keyDown(dialog, { key: '+' })
    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    fireEvent.keyDown(dialog, { key: 'ArrowUp' })
    expect(image()).toHaveAttribute('alt', 'Front of the chair')
    expect(image().style.transform).toBe('translate(-50px, 50px) scale(1.5)')
  })

  it('should start the next image fitted to the screen', () => {
    const { getByRole } = render(<Gallery open />)
    fireEvent.click(getByRole('button', { name: 'Zoom in' }))
    fireEvent.click(getByRole('button', { name: 'Next image' }))
    expect(image().style.transform).toBe('translate(0px, 0px) scale(1)')
  })

  it('should close with Escape, the close button and a click around the image, and give the focus back', () => {
    const { getByRole, queryByRole } = render(<Gallery />)
    const opener = getByRole('button', { name: 'Open photos' })

    opener.focus()
    fireEvent.click(opener)
    fireEvent.keyDown(getByRole('dialog'), { key: 'Escape' })
    expect(queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).toBe('')

    fireEvent.click(opener)
    fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(opener)
    fireEvent.click(image())
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(image().parentElement)
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should hide the arrows and the counter for a single image', () => {
    const { queryByRole, getByRole } = render(<ImageViewer images={[photos[0]]} open onClose={jest.fn()} />)
    expect(queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument()
    expect(getByRole('dialog')).not.toHaveTextContent('1 of 1')
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <ImageViewer images={photos} open onClose={jest.fn()} />
      </LocaleContext.Provider>
    )
    expect(getByRole('dialog', { name: 'Visualizador de imagens' })).toHaveTextContent('1 de 3')
    expect(getByRole('button', { name: 'Próxima imagem' })).toBeInTheDocument()
  })
})
