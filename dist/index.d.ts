export declare const uuidRegex: RegExp;
export declare const verifyChecksum: (uuid: string) => boolean;
export declare const checkVersion: (uuid: string, version?: number) => boolean;
export declare const isUUID: (uuid: string) => boolean;
interface validateUUIDv9Options {
    checksum?: boolean;
    version?: boolean;
}
export declare const isValidUUIDv9: (uuid: string, options: validateUUIDv9Options) => boolean;
interface UUIDv9Options {
    prefix?: string;
    timestamp?: boolean | number | string | Date;
    checksum?: boolean;
    version?: boolean;
    legacy?: boolean;
}
export declare const uuidv9: (options?: UUIDv9Options) => string;
declare const _default: {
    uuidv9: (options?: UUIDv9Options | undefined) => string;
    isValidUUIDv9: (uuid: string, options: validateUUIDv9Options) => boolean;
    isUUID: (uuid: string) => boolean;
    verifyChecksum: (uuid: string) => boolean;
    checkVersion: (uuid: string, version?: number | undefined) => boolean;
};
export default _default;
