import { ImageViewer, ImageViewerImage } from '@lemonade/ui'
import React, { useState } from 'react'

const picture = (label: string, from: string, to: string) =>
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
      `<rect width="1200" height="800" fill="url(#g)"/>` +
      `<circle cx="600" cy="360" r="140" fill="#FFFFFF" fill-opacity="0.35"/>` +
      `<text x="600" y="640" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#FFFFFF" ` +
      `text-anchor="middle">${label}</text></svg>`
  )

const photos: ImageViewerImage[] = [
  { src: picture('Front', '#5E7300', '#B8CC33'), alt: 'Front of the oak chair', caption: 'Oak chair, front view' },
  { src: picture('Side', '#2A5D9F', '#76A9E8'), alt: 'Side of the oak chair', caption: 'Side view' },
  { src: picture('Back', '#8C3B12', '#E39A5C'), alt: 'Back of the oak chair', caption: 'Back view' },
]

function ImageViewerDemo() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {photos.map((photo, photoIndex) => (
          <button
            key={photo.src}
            type='button'
            aria-label={`Open ${photo.alt}`}
            onClick={() => {
              setIndex(photoIndex)
              setOpen(true)
            }}
            style={{ padding: 0, border: '1px solid #D3D4DD', borderRadius: 4, cursor: 'zoom-in', lineHeight: 0 }}
          >
            <img src={photo.src} alt='' width={120} height={80} style={{ borderRadius: 3 }} />
          </button>
        ))}
      </div>
      <ImageViewer images={photos} open={open} index={index} onIndexChange={setIndex} onClose={() => setOpen(false)} />
    </>
  )
}

export default ImageViewerDemo
