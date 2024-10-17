# UUID v9

## Fast, lightweight, zero-dependency JavaScript/TypeScript implementation of UUID version 9

The v9 UUID supports both sequential (time-based) and non-sequential (random) UUIDs with an optional prefix of up to four bytes, an optional checksum, and sufficient randomness to avoid collisions. It uses the UNIX timestamp for sequential UUIDs and CRC-8 for checksums. A version digit can be added if desired, but is omitted by default.

To learn more about UUID v9, please visit the website: https://uuidv9.jhunt.dev

## Installation

Install UUID v9 from npm

With npm:
```bash
npm install --save uuid-v9
```
or using yarn:
```bash
yarn add uuid-v9
```

## Usage

```javascript
import { uuidv9, isValidUUIDv9 } from 'uuid-v9' 

const orderedId = uuidv9()
const prefixedOrderedId = uuidv9({ prefix: 'a1b2c3d4' })
const unorderedId = uuidv9({ timestamp: false })
const prefixedUnorderedId = uuidv9({ prefix: 'a1b2c3d4', timestamp: false })
const orderedIdWithChecksum = uuidv9({ checksum: true })
const orderedIdWithVersion = uuidv9({ version: true })
const orderedIdWithLegacyMode = uuidv9({ legacy: true })

const isValid = isValidUUIDv9(orderedId)
const isValidWithChecksum = isValidUUIDv9(orderedIdWithChecksum, { checksum: true })
const isValidWithVersion = isValidUUIDv9(orderedIdWithVersion, { version: true })
```

## Backward Compatibility

Some UUID validators check for specific features of v1 or v4 UUIDs. This causes some valid v9 UUIDs to appear invalid. Three possible workarounds are:

1) Use the built-in validator (recommended)
2) Use legacy mode*
3) Bypass the validator (not recommended)

_*Legacy mode adds version and variant digits to immitate v1 or v4 UUIDs depending on the presence of a timestamp._

## License

This project is licensed under the [MIT License](LICENSE).