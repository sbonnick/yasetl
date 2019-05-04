const simplePlugin = require('./simple-plugin')

class extendedPlugin extends simplePlugin {

    constructor() {
        super()
    }

    foo() {
        return 'bar';
    }
}

module.exports = extendedPlugin