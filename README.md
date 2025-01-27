# LZSS Compression Library

```diff
- Passing 7/8 tests
```

This project implements the LZSS compression algorithm in TypeScript. It provides functionality to compress and decompress data using the LZSS algorithm.

## Installation

To install the dependencies, run:

```bash
bun install
```

## Usage

To run the project, use:

```bash
bun run main.ts
```

## API

### `LZSS`

#### Methods

-   `static isCompressed(input: Buffer): boolean`

    -   Checks if the input buffer is compressed using LZSS.

-   `static getActualSize(input: Buffer): number`

    -   Returns the actual size of the uncompressed data.

-   `compress(input: Buffer): Buffer | null`

    -   Compresses the input buffer and returns the compressed data.

-   `uncompress(input: Buffer): Buffer | null`
    -   Uncompresses the input buffer and returns the original data.

## Testing

To run the tests, use:

```bash
bun test
```

## Project Structure

-   `src/lzss.ts`: Contains the implementation of the LZSS compression algorithm.
-   `src/utils/index.ts`: Utility functions used by the LZSS algorithm.
-   `tests/lzss.test.ts`: Unit tests for the LZSS compression algorithm.

## License

This project is licensed under the MIT License.

## Acknowledgements

This project was created using `bun init` in bun v1.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
