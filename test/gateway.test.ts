
import Gateway from '../src/gateway'

const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')
const GatewayMessages = require('./gateway.messages').default



describe('gateway', () => {

  test('happy', async () => {
    const seneca = Seneca().test().use('promisify').use(Gateway)
  })

  test('messages', async () => {
    const seneca = Seneca().test().use('promisify').use(Gateway)
    await (SenecaMsgTest(seneca, GatewayMessages)())
  })

})

