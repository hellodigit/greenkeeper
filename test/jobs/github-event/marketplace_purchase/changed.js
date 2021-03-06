const dbs = require('../../../../lib/dbs')
const removeIfExists = require('../../../helpers/remove-if-exists.js')
const changePurchase = require('../../../../jobs/github-event/marketplace_purchase/changed')

describe('marketplace changed', async () => {
  test('change entry in payments database', async () => {
    const { payments } = await dbs()
    await payments.put({
      _id: '444',
      plan: 'team'
    })

    const newJobs = await changePurchase({
      marketplace_purchase: {
        account: {
          type: 'Organization',
          id: 444,
          login: 'GitHub'
        },
        plan: {
          id: 9,
          name: 'Open Source',
          description: 'A really, super professional-grade CI solution',
          monthly_price_in_cents: 9999,
          yearly_price_in_cents: 11998,
          price_model: 'flat-rate',
          unit_name: null,
          bullets: [
            'This is the first bullet of the plan',
            'This is the second bullet of the plan'
          ]
        }
      }
    })

    expect(newJobs).toBeFalsy()

    const payment = await payments.get('444')
    expect(payment.plan).toEqual('opensource')
  })

  afterAll(async () => {
    const { payments } = await dbs()
    await removeIfExists(payments, '444')
  })
})
