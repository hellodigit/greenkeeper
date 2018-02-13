const { test } = require('tap')
const { cleanCache, requireFresh } = require('../helpers/module-cache-helpers')

test('initial pr content', async t => {
  t.beforeEach(() => {
    delete process.env.HOOKS_HOST
    cleanCache('../../lib/env')
    return Promise.resolve()
  })

  t.test('includes set up guide for hooks if secret was provided', async t => {
    t.plan(1)
    const content = requireFresh('../../content/initial-pr')

    const prContent = content({ghRepo: 'finnp/abc', secret: 'S3CR3T'})
    t.includes(prContent, 'https://hooks.greenkeeper.io/npm', 'includes the link to the hooks endpoint')
  })

  t.test('includes the link to the custom hooks host', async t => {
    t.plan(1)
    process.env.HOOKS_HOST = 'custom-hooks-host.com'
    const content = requireFresh('../../content/initial-pr')

    const prContent = content({ghRepo: 'finnp/abc', secret: 'S3CR3T'})
    t.includes(prContent, 'custom-hooks-host.com', 'includes the link to the custom hooks endpoint')
  })
})
