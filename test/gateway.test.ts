
import Gateway from '../src/gateway'

const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')
const GatewayMessages = require('./gateway.messages').default



describe('gateway', () => {

  test('happy', async () => {
    const seneca = Seneca({ legacy: false }).test().use('promisify').use(Gateway)
    await seneca.ready()
  })

  test('messages', async () => {
    const seneca = Seneca({ legacy: false }).test().use('promisify').use(Gateway)
    await (SenecaMsgTest(seneca, GatewayMessages)())
  })

  test('handler', async () => {
    const seneca = Seneca({ legacy: false })
      .test()
      .use('promisify')
      .use(Gateway, {
        custom: {
          z: 3
        }
      })

    seneca.message('foo:1', async (msg: any, meta: any) => ({
      q: msg.q,
      ay: msg.y,
      ax: meta.custom.x,
      az: meta.custom.z,
      safe: meta.custom.safe
    }))
    seneca.act('sys:gateway,add:hook,hook:custom', { action: { x: 1 } })
    seneca.act('sys:gateway,add:hook,hook:fixed',
      { action: (fixed: any) => fixed.y = 2 })

    await seneca.ready()
    let handler = seneca.export('gateway/handler')
    let result = await handler({ foo: 1, q: 99 })
    expect(result.out.meta$.id).toBeDefined()
    expect(result.out).toMatchObject({ q: 99, ay: 2, ax: 1, az: 3, safe: false })


    // Can't make unsafe safe!
    result = await handler({ foo: 1, q: 99, custom$: { safe: true } })
    expect(result.out).toMatchObject({ q: 99, ay: 2, ax: 1, az: 3, safe: false })
  })


  test('tag', async () => {
    const seneca = Seneca({ legacy: false }).test().use('promisify').use({
      define: Gateway, tag: 'foo'
    })
    await seneca.ready()
    // console.log(seneca.list_plugins())
    // console.log(seneca.list('sys:gateway'))
    expect(seneca.list('sys:gateway')).toEqual([
      { add: 'hook', sys: 'gateway', tag: 'foo' },
      { get: 'hooks', sys: 'gateway', tag: 'foo' }
    ])
  })


  test('gateway-result', async () => {
    const s0 = Seneca({ legacy: false })
      .test()
      .quiet()
      .use('promisify')
      .use(Gateway, {
        error: {
          message: true,
          details: true,
        }
      })
      .message('foo:1', async (msg: any) => ({
        x: msg.x
      }))
      .message('bar:1', async (_msg: any) => { throw new Error('bar') })

    await s0.ready()
    let handler0 = s0.export('gateway/handler')

    let result = await handler0({ foo: 1, x: 2 })
    result.out.meta$.id = 'METAID'
    result.meta = { pattern: result.meta.pattern }

    expect(result).toEqual({
      error: false,
      meta: {
        pattern: 'foo:1'
      },
      gateway$: {},
      out: {
        x: 2,
        meta$: {
          id: 'METAID'
        },
      },
    })


    result = await handler0({ bar: 1 })
    result.out.meta$.id = 'METAID'
    result.meta = { pattern: result.meta.pattern }

    expect(result).toEqual({
      error: true,
      meta: {
        pattern: 'bar:1'
      },
      gateway$: {},
      out: {
        error$: {
          name: 'Error',
          message: 'bar',
        },
        meta$: {
          id: "METAID",
        },
      },
    })

    // undefs removed
    expect(Object.keys(result.out.error$)).toEqual(['name', 'message'])

    const s1 = Seneca({ legacy: false })
      .test()
      .quiet()
      .use('promisify')
      .use(Gateway)
      .message('bar:1', async (_msg: any) => { throw new Error('bar') })

    await s1.ready()
    let handler1 = s1.export('gateway/handler')

    result = await handler1({ bar: 1 })
    result.out.meta$.id = 'METAID'
    result.meta = { pattern: result.meta.pattern }

    expect(result).toEqual({
      error: true,
      meta: {
        pattern: 'bar:1'
      },
      gateway$: {},
      out: {
        error$: {
          name: 'Error',
        },
        meta$: {
          id: "METAID",
        },
      },
    })

  })
})

