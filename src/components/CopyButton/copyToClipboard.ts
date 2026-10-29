/**
 * Writes the text to the clipboard. Falls back to a selected `textarea` and the `copy` command where the
 * Clipboard API is missing, such as on pages served over plain HTTP.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  }

  const previousFocus = document.activeElement as HTMLElement | null
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    if (!document.execCommand || !document.execCommand('copy')) {
      throw new Error('The browser refused to copy the text')
    }
  } finally {
    document.body.removeChild(textarea)
    previousFocus && previousFocus.focus()
  }
}
