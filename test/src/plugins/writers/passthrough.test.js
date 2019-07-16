const Passthrough = require('../../../../src/plugins/writers/passthrough')
const chai = require('chai')
const chaiPromise = require('chai-as-promised')

chai.use(chaiPromise)
const expect = chai.expect

describe('Writer Passthrough', () => {
  describe('items()', () => {
    it('will return the items on the config when passed through', async function () {
      const items = ['row one', 'row two']
      const passthrough = new Passthrough({})
      passthrough.items(items, {})
      expect(passthrough.config.items).to.be.eql(items)
    })

    it('will return the items on the config when passed through and joined with existing configs', async function () {
      const initConfig = ['config one']
      const items = ['row one', 'row two']
      const passthrough = new Passthrough({ items: initConfig })
      passthrough.items(items, {})
      expect(passthrough.config.items).to.be.eql([...initConfig, ...items])
    })

    it('will return the items on the config when passed through and joined with override configs', async function () {
      const initConfig = ['config one']
      const items = ['row one', 'row two']
      const overrideConfig = ['config two']
      const passthrough = new Passthrough({ items: initConfig })
      passthrough.items(items, { items: overrideConfig })
      expect(passthrough.config.items).to.be.eql([...overrideConfig, ...items])
    })
  })
})