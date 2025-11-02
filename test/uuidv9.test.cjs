const assert = require('assert')
const {
    uuidv9
} = require('../dist/index.js')

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

describe('uuid-v9-cjs', () => {
    it('should work with CommonJS', async () => {
        const id1 = uuidv9()
        assert.strictEqual(uuidRegex.test(id1), true)
    })
})