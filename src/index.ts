let nodeCrypto:typeof import('crypto') | undefined
try {
  nodeCrypto = require('crypto')
} catch {}

export const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const calcChecksum = (hexString:string):string => { // CRC-8
    const data:number[] = hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    const polynomial:number = 0x07
    let crc: number = 0x00
    for (const byte of data) {
        crc ^= byte
        for (let i = 0; i < 8; i++) {
            if (crc & 0x80) {
                crc = (crc << 1) ^ polynomial
            } else {
                crc <<= 1
            }
        }
    }
    return (crc & 0xFF).toString(16).padStart(2, '0')
}

export const verifyChecksum = (uuid:string) => {
    const base16String = uuid.replace(/-/g, '').substring(0, 30)
    const crc = calcChecksum(base16String)
    return crc === uuid.substring(34, 36)
}

export const checkVersion = (uuid:string, version?:number) => {
    const versionDigit = uuid.slice(14, 15)
    const variantDigit = uuid.slice(19, 20)
    return (
        (!version || versionDigit === String(version)) &&
        (versionDigit === '9' || ('14'.indexOf(String(versionDigit)) > -1 && '89abAB'.indexOf(variantDigit) > -1))
    )
}

export const isUUID = (uuid:string) => typeof uuid === 'string' && uuidRegex.test(uuid)

interface validateUUIDv9Options {
    checksum?:boolean
    version?:boolean
}

export const isValidUUIDv9 = (uuid:string, options:validateUUIDv9Options) => {
    return (
        isUUID(uuid) &&
        (!options?.checksum || verifyChecksum(uuid)) &&
        (!options?.version || checkVersion(uuid))
    )
}

const randomBytes = (length:number):string => {
    let array
    // Deno and browsers
    if (typeof globalThis.crypto?.getRandomValues === "function") {
        array = new Uint8Array(length)
        globalThis.crypto.getRandomValues(array)
    }
    // Node
    else if (typeof nodeCrypto?.randomBytes === 'function') {
        array = nodeCrypto.randomBytes(length)
    }
    // Bun
    // @ts-expect-error
    else if (typeof Bun !== 'undefined' && typeof Bun.random === 'function') {
        // @ts-expect-error
        array = Bun.random(length)
    }
    // Fallback
    else {
        array = new Uint8Array(length)
        for (let i = 0; i < length; i++) {
            array[i] = Math.floor(Math.random() * 256)
        }
    }
    let string = ''
    for (const b of array) {
        string += b.toString(16).padStart(2, '0')
    }
    return string
}

const randomChar = (chars:string):string => {
    const randomIndex = Math.floor(Math.random() * chars.length)
    return chars.charAt(randomIndex)
}

const base16Regex = /^[0-9a-fA-F]+$/
const isBase16 = (str:string):boolean => base16Regex.test(str)

const validatePrefix = (prefix:string):void => {
    if (typeof prefix !== 'string') throw new Error('Prefix must be a string')
    if (prefix.length > 8) throw new Error('Prefix must be no more than 8 characters')
    if (!isBase16(prefix)) throw new Error('Prefix must be only hexadecimal characters')
}

const validateSuffix = (suffix:string):void => {
    if (typeof suffix !== 'string') throw new Error('Suffix must be a string')
    if (suffix.length > 4) throw new Error('Suffix must be no more than 4 characters')
    if (!isBase16(suffix)) throw new Error('Suffix must be only hexadecimal characters')
}

const addDashes = (str:string):string => {
    return `${str.substring(0, 8)}-${str.substring(8, 12)}-${str.substring(12, 16)}-${str.substring(16, 20)}-${str.substring(20)}`
}

interface UUIDv9Options {
    prefix?:string
    suffix?:string
    timestamp?:boolean|number|string|Date
    checksum?:boolean
    version?:boolean
    legacy?:boolean
}

const defaultOptions = {
    prefix: '',
    suffix: '',
    timestamp: true,
    checksum: false,
    version: false,
    legacy: false
}

const optionOrDefault = (name:'prefix'|'suffix'|'timestamp'|'checksum'|'version'|'legacy', options?:UUIDv9Options) => {
    if (!options || options[name] === undefined) {
        return defaultOptions[name]
    } else {
        return options[name]
    }
}

export const uuidv9 = (options?:UUIDv9Options) => {
    let prefix = String(optionOrDefault('prefix', options))
    let suffix = String(optionOrDefault('suffix', options))
    let timestamp = optionOrDefault('timestamp', options)
    let checksum = optionOrDefault('checksum', options)
    let version = optionOrDefault('version', options)
    let legacy = optionOrDefault('legacy', options)
    if (prefix) {
        validatePrefix(prefix)
        prefix = prefix.toLowerCase()
    }
    if (suffix) {
        validateSuffix(suffix)
        suffix = suffix.toLowerCase()
    }
    const center:string = timestamp instanceof Date ? timestamp.getTime().toString(16) : typeof timestamp === 'number' || typeof timestamp === 'string' ? new Date(timestamp).getTime().toString(16) : timestamp ? new Date().getTime().toString(16) : ''
    const randomLength = 32 - prefix.length - center.length - suffix.length - (checksum ? 2 : 0) - (legacy ? 2 : version ? 1 : 0)
    const random:string = randomBytes(Math.ceil(randomLength/2)).slice(0, randomLength)
    let joined:string = prefix + center + random + suffix
    if (legacy) {
        joined = joined.substring(0, 12) + (timestamp ? '1' : '4') + joined.substring(12, 15) + randomChar('89ab') + joined.substring(15)
    } else if (version) {
        joined = joined.substring(0, 12) + '9' + joined.substring(12)
    }
    if (checksum) {
        joined += calcChecksum(joined)
    }
    return addDashes(joined)
}