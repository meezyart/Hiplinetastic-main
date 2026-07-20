const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.resolve(__dirname, '..')

test('shared embed dialog exposes the required accessibility hooks', () => {
  const markup = fs.readFileSync(
    path.join(root, 'src/includes/partials/embedDialog.njk'),
    'utf8'
  )

  assert.match(markup, /role="dialog"/)
  assert.match(markup, /aria-modal="true"/)
  assert.match(markup, /aria-labelledby="embed-dialog-title"/)
  assert.match(markup, /data-embed-dialog-close/)
  assert.match(markup, /data-embed-dialog-body/)
  assert.match(markup, /Open checkout in a new tab/)
})

test('shared embed dialog uses a reduced-motion-safe opening animation', () => {
  const styles = fs.readFileSync(
    path.join(root, 'src', 'assets', 'styles', '_momence-integrations.scss'),
    'utf8'
  )

  assert.match(styles, /@keyframes momence-dialog-pop/)
  assert.match(
    styles,
    /\.embed-dialog:not\(\[hidden\]\) \.embed-dialog__panel\s*\{[\s\S]*animation:\s*momence-dialog-pop/
  )
  assert.match(styles, /@media \(prefers-reduced-motion: no-preference\)/)
})
