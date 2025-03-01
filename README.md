# LZSS Compression Library

A TypeScript implementation of the LZSS (Lempel-Ziv-Storer-Szymanski) compression algorithm. LZSS is a lossless data compression algorithm that improves upon the LZ77 algorithm by not encoding matches if encoding would produce more output than leaving the data unencoded.

## Features

-   Fast compression and decompression
-   Works with any binary data via `Uint8Array`
-   Zero dependencies
-   Written in TypeScript
-   Full test coverage

## Installation

```bash
bun install valve-lzss
```

## Usage Examples

### Basic Compression

```typescript
import LZSS from "valve-lzss";

const lzss = new LZSS();

// Create some sample data
const data = new Uint8Array([1, 2, 3, 4, 5, 5, 5, 5, 5]);

// Compress the data
const compressed = lzss.compress(data);

// Decompress back
const decompressed = lzss.decompress(compressed);

console.log("Original size:", data.length);
console.log("Compressed size:", compressed.length);
console.log(
	"Decompressed matches original:",
	decompressed.every((byte, i) => byte === data[i])
);
```

### Compressing Files

```typescript
import LZSS from "valve-lzss";
import { readFileSync, writeFileSync } from "fs";

const lzss = new LZSS();

// Read a file
const fileData = readFileSync("example.txt");
const inputData = new Uint8Array(fileData);

// Compress
const compressed = lzss.compress(inputData);

// Save compressed data
writeFileSync("example.txt.lzss", compressed);

// Later decompress
const compressedFile = readFileSync("example.txt.lzss");
const decompressed = lzss.decompress(new Uint8Array(compressedFile));
writeFileSync("example.decompressed.txt", decompressed);
```

### Compression Parameters

The LZSS implementation uses these default parameters which can be referenced (but not modified):

```typescript
const lzss = new LZSS();

console.log(lzss.WINDOW_SIZE); // 4096 bytes sliding window
console.log(lzss.LOOKAHEAD_SIZE); // 18 bytes lookahead buffer
console.log(lzss.MIN_MATCH); // 3 bytes minimum match length
```

## API Reference

###

LZSS

Class

#### Constructor

-

new LZSS()

: Creates a new LZSS compressor instance

#### Methods

-

compress(input: Uint8Array): Uint8Array

-   Compresses the input data
-   Returns compressed data as Uint8Array

-

decompress(input: Uint8Array): Uint8Array

-   Decompresses previously compressed data
-   Returns original data as Uint8Array

#### Properties

-

readonly WINDOW_SIZE

: Size of the sliding window (4096)

-

readonly LOOKAHEAD_SIZE

: Size of lookahead buffer (18)

-

readonly MIN_MATCH

: Minimum match length (3)

## Testing

The library includes comprehensive tests. To run them:

```bash
bun test
```

## Performance Considerations

-   The compression ratio depends heavily on the input data's redundancy
-   Best compression is achieved with repetitive data
-   The sliding window size of 4096 bytes limits the distance for back-references

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Acknowledgements

This project was created using `bun init` in bun v1.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
