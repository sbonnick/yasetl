const Passthrough = require('../../../../src/plugins/writers/passthrough')

describe('Writer Passthrough', () => {
  describe('items()', () => {
    it('will return the items on the config when passed through', async () => {
      const items = ['row one', 'row two']
      const passthrough = new Passthrough({})
      passthrough.items(items, {})
      expect(passthrough.config.items).toEqual(items)
    })

    it('will return the items on the config when passed through and joined with existing configs', async () => {
      const initConfig = ['config one']
      const items = ['row one', 'row two']
      const passthrough = new Passthrough({ items: initConfig })
      passthrough.items(items, {})
      expect(passthrough.config.items).toEqual([...initConfig, ...items])
    })

    it('will return the items on the config when passed through and joined with override configs', async () => {
      const initConfig = ['config one']
      const items = ['row one', 'row two']
      const overrideConfig = ['config two']
      const passthrough = new Passthrough({ items: initConfig })
      passthrough.items(items, { items: overrideConfig })
      expect(passthrough.config.items).toEqual([...overrideConfig, ...items])
    })
  })
})