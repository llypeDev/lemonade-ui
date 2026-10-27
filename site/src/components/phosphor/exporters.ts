/** Browser helpers used by the explorer to copy and download icons. */

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  // Fallback for insecure contexts (e.g. local network previews)
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!ok) throw new Error('Clipboard is not available')
}

export const canCopyImages = () =>
  typeof window !== 'undefined' &&
  !!navigator.clipboard &&
  typeof (navigator.clipboard as any).write === 'function' &&
  typeof (window as any).ClipboardItem === 'function'

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function svgBlob(svg: string) {
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
}

/** Rasterizes an SVG string into a PNG of `size`×`size` pixels (scaled for crisp output on HiDPI screens). */
export function svgToPng(svg: string, size: number, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(svgBlob(svg))

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size * scale
      canvas.height = size * scale
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas is not supported'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create PNG'))), 'image/png')
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not render SVG'))
    }
    image.src = url
  })
}

export async function copyPng(svg: string, size: number) {
  const blob = await svgToPng(svg, size)
  const ClipboardItemCtor = (window as any).ClipboardItem
  await (navigator.clipboard as any).write([new ClipboardItemCtor({ 'image/png': blob })])
}
