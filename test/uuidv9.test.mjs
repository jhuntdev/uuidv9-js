// const assert = require('assert')
// const {
//     uuidv9,
//     isValidUUIDv9,
//     verifyChecksum,
//     isUUID
// } = require('../dist/cjs')

import assert from 'assert'
import {
    uuidv9,
    isValidUUIDv9,
    verifyChecksum,
    isUUID
} from '../dist/esm/index.js'

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const uuidV1Regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-1[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
const uuidV4Regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
const uuidV9Regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-9[0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

let sleepTimeout
const sleep = (ms) => {
    clearInterval(sleepTimeout)
    return new Promise(resolve => sleepTimeout = setTimeout(resolve, ms))
}

describe('uuid-v9', () => {
    it('should validate as a UUID', async () => {
        const id1 = uuidv9()
        const id2 = uuidv9({ prefix: 'a1b2c3d4' })
        const id3 = uuidv9({ prefix: 'a1b2c3d4', timestamp: false })
        const id4 = uuidv9({ prefix: 'a1b2c3d4', checksum: true })
        const id5 = uuidv9({ prefix: 'a1b2c3d4', checksum: true, version: true })
        const id6 = uuidv9({ prefix: 'a1b2c3d4', checksum: true, legacy: true })
        assert.strictEqual(uuidRegex.test(id1), true)
        assert.strictEqual(uuidRegex.test(id2), true)
        assert.strictEqual(uuidRegex.test(id3), true)
        assert.strictEqual(uuidRegex.test(id4), true)
        assert.strictEqual(uuidRegex.test(id5), true)
        assert.strictEqual(uuidRegex.test(id6), true)
    })
    it('should generate sequential UUIDs', async () => {
        const id1 = uuidv9()
        await sleep(2)
        const id2 = uuidv9()
        await sleep(2)
        const id3 = uuidv9()
        assert.strictEqual(id1 < id2, true)
        assert.strictEqual(id2 < id3, true)
    })
    it('should generate sequential UUIDs with a prefix', async () => {
        const id1 = uuidv9({ prefix: 'a1b2c3d4' })
        await sleep(2)
        const id2 = uuidv9({ prefix: 'a1b2c3d4' })
        await sleep(2)
        const id3 = uuidv9({ prefix: 'a1b2c3d4' })
        assert.strictEqual(id1 < id2, true)
        assert.strictEqual(id2 < id3, true)
        assert.strictEqual(id1.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(id2.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(id3.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(id1.substring(14, 18), id2.substring(14, 18))
        assert.strictEqual(id2.substring(14, 18), id3.substring(14, 18))
    })
    it('should generate non-sequential UUIDs', async () => {
        const idS = uuidv9({ timestamp: false })
        await sleep(2)
        const idNs = uuidv9({ timestamp: false })
        assert.strictEqual(idS.substring(0, 4) !== idNs.substring(0, 4), true)
    })
    it('should generate non-sequential UUIDs with a prefix', async () => {
        const idS = uuidv9({ prefix: 'a1b2c3d4', timestamp: false })
        await sleep(2)
        const idNs = uuidv9({ prefix: 'a1b2c3d4', timestamp: false })
        assert.strictEqual(idS.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(idNs.substring(0, 8), 'a1b2c3d4')
        assert.strictEqual(idS.substring(14, 18) !== idNs.substring(14, 18), true)
    })
    it('should generate UUIDs with a checksum', async () => {
        const id1 = uuidv9({ checksum: true })
        const id2 = uuidv9({ timestamp: false, checksum: true })
        assert.strictEqual(uuidRegex.test(id1), true)
        assert.strictEqual(uuidRegex.test(id2), true)
        assert.strictEqual(verifyChecksum(id1), true)
        assert.strictEqual(verifyChecksum(id2), true)
    })
    it('should generate UUIDs with a version', async () => {
        const id1 = uuidv9({ version: true })
        const id2 = uuidv9({ timestamp: false, version: true })
        assert.strictEqual(uuidRegex.test(id1), true)
        assert.strictEqual(uuidRegex.test(id2), true)
        assert.strictEqual(uuidV9Regex.test(id1), true)
        assert.strictEqual(uuidV9Regex.test(id2), true)
    })
    it('should generate backward compatible UUIDs', async () => {
        const id1 = uuidv9({ checksum: true, legacy: true })
        const id2 = uuidv9({ prefix: 'a1b2c3d4', legacy: true })
        const id3 = uuidv9({ timestamp: false, legacy: true })
        const id4 = uuidv9({ prefix: 'a1b2c3d4', timestamp: false, legacy: true })
        assert.strictEqual(uuidRegex.test(id1), true)
        assert.strictEqual(uuidRegex.test(id2), true)
        assert.strictEqual(uuidRegex.test(id3), true)
        assert.strictEqual(uuidRegex.test(id4), true)
        assert.strictEqual(uuidV1Regex.test(id1), true)
        assert.strictEqual(uuidV1Regex.test(id2), true)
        assert.strictEqual(uuidV4Regex.test(id3), true)
        assert.strictEqual(uuidV4Regex.test(id4), true)
    })
    it('should correctly validate and verify checksum', async () => {
        const id1 = uuidv9({ checksum: true })
        const id2 = uuidv9({ timestamp: false, checksum: true })
        const id3 = uuidv9({ prefix: 'a1b2c3d4', checksum: true })
        const id4 = uuidv9({ prefix: 'a1b2c3d4', timestamp: false, checksum: true })
        const id5 = uuidv9({ checksum: true, version: true })
        const id6 = uuidv9({ checksum: true, legacy: true })
        const id7 = uuidv9({ timestamp: false, checksum: true, legacy: true })
        assert.strictEqual(isUUID(id1), true)
        assert.strictEqual(isUUID('not-a-real-uuid'), false)
        assert.strictEqual(isValidUUIDv9(id1, { checksum: true }), true)
        assert.strictEqual(isValidUUIDv9(id2, { checksum: true }), true)
        assert.strictEqual(isValidUUIDv9(id3, { checksum: true }), true)
        assert.strictEqual(isValidUUIDv9(id4, { checksum: true }), true)
        assert.strictEqual(isValidUUIDv9(id5, { checksum: true, version: true }), true)
        assert.strictEqual(isValidUUIDv9(id6, { checksum: true, version: true }), true)
        assert.strictEqual(isValidUUIDv9(id7, { checksum: true, version: true }), true)
        assert.strictEqual(verifyChecksum(id1), true)
        assert.strictEqual(verifyChecksum(id2), true)
        assert.strictEqual(verifyChecksum(id3), true)
        assert.strictEqual(verifyChecksum(id4), true)
        assert.strictEqual(verifyChecksum(id5), true)
        assert.strictEqual(verifyChecksum(id6), true)
        assert.strictEqual(verifyChecksum(id7), true)
    })
})