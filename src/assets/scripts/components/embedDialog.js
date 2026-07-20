import { createFocusTrap } from 'focus-trap'

export const initEmbedDialog = () => {
  const root = document.querySelector('[data-embed-dialog]')
  if (!root) return

  const panel = root.querySelector('[role="dialog"]')
  const body = root.querySelector('[data-embed-dialog-body]')
  const title = root.querySelector('[data-embed-dialog-title]')
  const fallback = root.querySelector('[data-embed-dialog-fallback]')
  let trigger = null

  const finishClose = () => {
    root.hidden = true
    document.body.classList.remove('embed-dialog-open')
    body.replaceChildren()
    if (trigger) trigger.focus()
    trigger = null
  }

  const trap = createFocusTrap(panel, {
    escapeDeactivates: true,
    clickOutsideDeactivates: false,
    fallbackFocus: panel,
    onDeactivate: finishClose
  })

  const close = () => {
    if (!root.hidden) trap.deactivate()
  }

  const open = link => {
    const url = link.dataset.embedDialogUrl
    if (!url) return

    trigger = link
    title.textContent = link.dataset.embedDialogTitle || 'Secure checkout'
    fallback.href = link.href

    const frame = document.createElement('iframe')
    frame.src = url
    frame.title = title.textContent
    frame.loading = 'eager'
    frame.referrerPolicy = 'strict-origin-when-cross-origin'
    frame.allow = 'payment; fullscreen'
    frame.setAttribute('data-embed-dialog-frame', '')
    body.replaceChildren(frame)
    root.hidden = false
    document.body.classList.add('embed-dialog-open')
    trap.activate()
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-embed-dialog-url]')
    if (link) {
      event.preventDefault()
      open(link)
      return
    }

    if (event.target.closest('[data-embed-dialog-close]')) close()
  })
}
