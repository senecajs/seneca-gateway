# Changes

## 2.0.0 2026-11-20

First entry of this change log. Earlier versions are on npm and in the git history.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (was
  `>=3||>=4.0.0-rc2`). Seneca 3 users stay on `@seneca/gateway@1`.
* Node.js 24 or later (`engines.node` `>=24`, was `>=14`).
* The peer dependency `seneca-promisify` is removed. Seneca 4 has
  promises built in, and the tests no longer load the plugin (D4).
* The option defaults are built with the validator that Seneca passes to
  the plugin: `defaults` is now a function of `{ valid }` (B1). The
  plugin no longer requires `seneca` itself, so a second copy of Seneca
  can no longer build the defaults. The option values are unchanged.
* Seneca 4 closes plain-object option defaults. `custom`, `fixed` and
  `allow` stay open, but an unknown key in `timeout`, `error` or `debug`
  now stops the plugin with `invalid_plugin_option` (B13).
* TypeScript: the types are built against the Seneca 4 declarations.
  The plugin function is typed `this: Seneca.Instance` (B10).
