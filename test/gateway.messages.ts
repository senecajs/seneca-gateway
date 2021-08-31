

const SenecaMsgTest = require('seneca-msg-test')


const custom_z = (custom: any) => custom.z = 2

export default {
  print: false,
  pattern: 'sys:gateway',
  allow: { missing: true },

  calls: [
    {
      pattern: 'add:hook',
      params: { name: 'custom', action: custom_z },
      out: { ok: true, name: 'custom', count: 1 }
    },
    {
      print: false,
      pattern: 'get:hooks',
      params: { name: 'custom' },
      out: { ok: true, name: 'custom', count: 1, hooks: [custom_z] }
    },
  ]

}
