'use strict';

let nodeCrypto;
try {
    nodeCrypto = require('crypto');
}
catch (_a) { }
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const calcChecksum = (hexString) => {
    const data = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    const polynomial = 0x07;
    let crc = 0x00;
    for (const byte of data) {
        crc ^= byte;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x80) {
                crc = (crc << 1) ^ polynomial;
            }
            else {
                crc <<= 1;
            }
        }
    }
    return (crc & 0xFF).toString(16).padStart(2, '0');
};
const verifyChecksum = (uuid) => {
    const base16String = uuid.replace(/-/g, '').substring(0, 30);
    const crc = calcChecksum(base16String);
    return crc === uuid.substring(34, 36);
};
const checkVersion = (uuid, version) => {
    const versionDigit = uuid.slice(14, 15);
    const variantDigit = uuid.slice(19, 20);
    return ((!version || versionDigit === String(version)) &&
        (versionDigit === '9' || ('14'.indexOf(String(versionDigit)) > -1 && '89abAB'.indexOf(variantDigit) > -1)));
};
const isUUID = (uuid) => typeof uuid === 'string' && uuidRegex.test(uuid);
const isValidUUIDv9 = (uuid, options) => {
    return (isUUID(uuid) &&
        (!(options === null || options === void 0 ? void 0 : options.checksum) || verifyChecksum(uuid)) &&
        (!(options === null || options === void 0 ? void 0 : options.version) || checkVersion(uuid)));
};
const randomBytes = (length) => {
    var _a;
    let array;
    // Deno and browsers
    if (typeof ((_a = globalThis.crypto) === null || _a === void 0 ? void 0 : _a.getRandomValues) === "function") {
        array = new Uint8Array(length);
        globalThis.crypto.getRandomValues(array);
    }
    // Node
    else if (typeof (nodeCrypto === null || nodeCrypto === void 0 ? void 0 : nodeCrypto.randomBytes) === 'function') {
        array = nodeCrypto.randomBytes(length);
    }
    // Bun
    // @ts-expect-error
    else if (typeof Bun !== 'undefined' && typeof Bun.random === 'function') {
        // @ts-expect-error
        array = Bun.random(length);
    }
    // Fallback
    else {
        array = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
    }
    let string = '';
    for (const b of array) {
        string += b.toString(16).padStart(2, '0');
    }
    return string;
};
const randomChar = (chars) => {
    const randomIndex = Math.floor(Math.random() * chars.length);
    return chars.charAt(randomIndex);
};
const base16Regex = /^[0-9a-fA-F]+$/;
const isBase16 = (str) => base16Regex.test(str);
const validatePrefix = (prefix) => {
    if (typeof prefix !== 'string')
        throw new Error('Prefix must be a string');
    if (prefix.length > 8)
        throw new Error('Prefix must be no more than 8 characters');
    if (!isBase16(prefix))
        throw new Error('Prefix must be only hexadecimal characters');
};
const validateSuffix = (suffix) => {
    if (typeof suffix !== 'string')
        throw new Error('Suffix must be a string');
    if (suffix.length > 4)
        throw new Error('Suffix must be no more than 4 characters');
    if (!isBase16(suffix))
        throw new Error('Suffix must be only hexadecimal characters');
};
const addDashes = (str) => {
    return `${str.substring(0, 8)}-${str.substring(8, 12)}-${str.substring(12, 16)}-${str.substring(16, 20)}-${str.substring(20)}`;
};
const defaultOptions = {
    prefix: '',
    suffix: '',
    timestamp: true,
    checksum: false,
    version: false,
    legacy: false
};
const optionOrDefault = (name, options) => {
    if (!options || options[name] === undefined) {
        return defaultOptions[name];
    }
    else {
        return options[name];
    }
};
const uuidv9 = (options) => {
    let prefix = String(optionOrDefault('prefix', options));
    let suffix = String(optionOrDefault('suffix', options));
    let timestamp = optionOrDefault('timestamp', options);
    let checksum = optionOrDefault('checksum', options);
    let version = optionOrDefault('version', options);
    let legacy = optionOrDefault('legacy', options);
    if (prefix) {
        validatePrefix(prefix);
        prefix = prefix.toLowerCase();
    }
    if (suffix) {
        validateSuffix(suffix);
        suffix = suffix.toLowerCase();
    }
    const center = timestamp instanceof Date ? timestamp.getTime().toString(16) : typeof timestamp === 'number' || typeof timestamp === 'string' ? new Date(timestamp).getTime().toString(16) : timestamp ? new Date().getTime().toString(16) : '';
    const randomLength = 32 - prefix.length - center.length - suffix.length - (checksum ? 2 : 0) - (legacy ? 2 : version ? 1 : 0);
    const random = randomBytes(Math.ceil(randomLength / 2)).slice(0, randomLength);
    let joined = prefix + center + random + suffix;
    if (legacy) {
        joined = joined.substring(0, 12) + (timestamp ? '1' : '4') + joined.substring(12, 15) + randomChar('89ab') + joined.substring(15);
    }
    else if (version) {
        joined = joined.substring(0, 12) + '9' + joined.substring(12);
    }
    if (checksum) {
        joined += calcChecksum(joined);
    }
    return addDashes(joined);
};

exports.checkVersion = checkVersion;
exports.isUUID = isUUID;
exports.isValidUUIDv9 = isValidUUIDv9;
exports.uuidRegex = uuidRegex;
exports.uuidv9 = uuidv9;
exports.verifyChecksum = verifyChecksum;
