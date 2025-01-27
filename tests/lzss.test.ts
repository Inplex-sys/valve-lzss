import { describe, beforeEach, it, expect } from "bun:test";

import LZSS from "../src/main";

describe("LZSS", () => {
	let lzss: LZSS;

	beforeEach(() => {
		lzss = new LZSS();
	});

	it("should compress and decompress data correctly", () => {
		const input = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const compressed = lzss.compress(input);
		const decompressed = lzss.decompress(compressed);
		expect(decompressed).toEqual(input);
	});

	it("should handle empty input", () => {
		const input = new Uint8Array([]);
		const compressed = lzss.compress(input);
		const decompressed = lzss.decompress(compressed);
		expect(decompressed).toEqual(input);
	});

	it("should handle repetitive input", () => {
		const input = new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
		const compressed = lzss.compress(input);
		const decompressed = lzss.decompress(compressed);
		expect(decompressed).toEqual(input);
	});

	it("should handle non-repetitive input", () => {
		const input = new Uint8Array([
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
		]);
		const compressed = lzss.compress(input);
		const decompressed = lzss.decompress(compressed);
		expect(decompressed).toEqual(input);
	});
});
