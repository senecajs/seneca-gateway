
export default function gateway(this: any, options: any) {
  const seneca: any = this
  const root: any = seneca.root
  const tu: any = seneca.export('transport/utils')

  const modifier_names = [
    // Functions to modify the custom object in Seneca message meta$ descriptions
    'custom',

    // Functions to modify the fixed arguments to Seneca messages
    'fixed',

    // Functions to modify the seneca request delegate
    'delegate',

    // Functions to modify the action or message
    'action',

    // Functions to modify the result
    'result'
  ]

  const modifiers: any = modifier_names.reduce((a: any, n) => (a[n] = [], a), {})

  seneca.message('sys:gateway,add:hook', async function add_hook(msg: any) {
    let name: string = msg.name
    let action: (...params: any[]) => any = msg.action

    if (null != action) {
      let mods = modifiers[name] || []
      mods.push(action)
      return { ok: true, name, count: mods.length }
    }
    else {
      return { ok: false, why: 'no-action' }
    }
  })


  seneca.message('sys:gateway,get:hooks', async function get_hook(msg: any) {
    let name: string = msg.name
    let mods = modifiers[name] || []
    return { ok: true, name, count: mods.length, hooks: mods }
  })


  // Handle inbound JSON, converting it into a message, and submitting to Seneca.
  async function action_handler(json: any) {
    const seneca = prepare_seneca(json)
    const msg = tu.internalize_msg(seneca, json)

    return await new Promise(resolve => {
      var out = null
      for (var i = 0; i < modifiers.action.length; i++) {
        out = modifiers.action[i].call(seneca, msg)
        if (out) {
          return resolve(out)
        }
      }

      seneca.act(msg, function(this: any, err: any, out: any, meta: any) {
        for (var i = 0; i < modifiers.result.length; i++) {
          modifiers.result[i].call(seneca, out, msg, err, meta)
        }

        if (err && !options.debug) {
          err.stack = null
        }

        var out = tu.externalize_reply(this, err, out, meta)

        // Don't expose internal activity unless debugging
        if (!options.debug) {
          out.meta$ = {
            id: out.meta$.id
          }
        }

        resolve(out)
      })
    })
  }


  function prepare_seneca(json: any) {
    let i, mod

    let custom: any = {}
    for (i = 0; i < modifiers.custom.length; i++) {
      mod = modifiers.custom[i]
      if ('object' === typeof (mod)) {
        seneca.util.deep(custom, json)
      }
      else {
        mod(custom, json)
      }
    }


    let fixed = {}
    for (i = 0; i < modifiers.fixed.length; i++) {
      mod = modifiers.fixed[i]
      if ('object' === typeof (mod)) {
        seneca.util.deep(fixed, json)
      }
      else {
        mod(fixed, json)
      }
    }


    const delegate = root.delegate(fixed, { custom: custom })

    for (i = 0; i < modifiers.delegate.length; i++) {
      modifiers.delegate[i](delegate, json)
    }

    return delegate
  }


  return {
    exports: {
      action_handler: action_handler
    }
  }
}

