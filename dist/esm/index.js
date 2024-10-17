export const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
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
export const verifyChecksum = (uuid) => {
    const base16String = uuid.replace(/-/g, '').substring(0, 30);
    const crc = calcChecksum(base16String);
    return crc === uuid.substring(34, 36);
};
export const checkVersion = (uuid, version) => {
    const versionDigit = uuid.slice(14, 15);
    const variantDigit = uuid.slice(19, 20);
    return ((!version || versionDigit === String(version)) &&
        (versionDigit === '9' || ('14'.indexOf(String(versionDigit)) > -1 && '89abAB'.indexOf(variantDigit) > -1)));
};
export const isUUID = (uuid) => typeof uuid === 'string' && uuidRegex.test(uuid);
export const isValidUUIDv9 = (uuid, options) => {
    return (isUUID(uuid) &&
        (!(options === null || options === void 0 ? void 0 : options.checksum) || verifyChecksum(uuid)) &&
        (!(options === null || options === void 0 ? void 0 : options.version) || checkVersion(uuid)));
};
const randomBytes = (count) => {
    let str = '';
    for (let i = 0; i < count; i++) {
        const r = (Math.random() * 16) | 0;
        str += r.toString(16);
    }
    return str;
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
const addDashes = (str) => {
    return `${str.substring(0, 8)}-${str.substring(8, 12)}-${str.substring(12, 16)}-${str.substring(16, 20)}-${str.substring(20)}`;
};
const defaultOptions = {
    prefix: '',
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
export const uuidv9 = (options) => {
    let prefix = String(optionOrDefault('prefix', options));
    let timestamp = optionOrDefault('timestamp', options);
    let checksum = optionOrDefault('checksum', options);
    let version = optionOrDefault('version', options);
    let legacy = optionOrDefault('legacy', options);
    if (prefix) {
        validatePrefix(prefix);
        prefix = prefix.toLowerCase();
    }
    const center = timestamp instanceof Date ? timestamp.getTime().toString(16) : typeof timestamp === 'number' || typeof timestamp === 'string' ? new Date(timestamp).getTime().toString(16) : timestamp ? new Date().getTime().toString(16) : '';
    const suffix = randomBytes(32 - prefix.length - center.length - (checksum ? 2 : 0) - (legacy ? 2 : version ? 1 : 0));
    let joined = prefix + center + suffix;
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
export default {
    uuidv9,
    isValidUUIDv9,
    isUUID,
    verifyChecksum,
    checkVersion
};
