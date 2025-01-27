import { Buffer } from "buffer";

import LZSS from "../src/lzss";
import { describe, it, expect } from "bun:test";

describe("LZSS", () => {
	describe("isCompressed", () => {
		it("should return true for a compressed buffer", () => {
			const compressedBuffer = Buffer.from([
				0x4c, 0x5a, 0x53, 0x53, 0x00, 0x00, 0x00, 0x00,
			]);

			expect(LZSS.isCompressed(compressedBuffer)).toBe(true);
		});

		it("should return false for a non-compressed buffer", () => {
			const nonCompressedBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);

			expect(LZSS.isCompressed(nonCompressedBuffer)).toBe(false);
		});
	});

	describe("getActualSize", () => {
		it("should return the actual size for a compressed buffer", () => {
			const compressedBuffer = Buffer.from([
				0x4c, 0x5a, 0x53, 0x53, 0x10, 0x00, 0x00, 0x00,
			]);
			expect(LZSS.getActualSize(compressedBuffer)).toBe(16);
		});

		it("should return 0 for a non-compressed buffer", () => {
			const nonCompressedBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
			expect(LZSS.getActualSize(nonCompressedBuffer)).toBe(0);
		});
	});

	describe("compress", () => {
		it("should compress and return a buffer", () => {
			const inputBuffer = Buffer.from("aabcaabc");
			const lzss = new LZSS();
			const compressedBuffer = lzss.compress(inputBuffer);
			expect(compressedBuffer).not.toBeNull();
			expect(compressedBuffer).toBeInstanceOf(Buffer);
		});

		it("should return null for an input buffer that is too small", () => {
			const inputBuffer = Buffer.from("abc");
			const lzss = new LZSS();
			const compressedBuffer = lzss.compress(inputBuffer);
			expect(compressedBuffer).toBeNull();
		});
	});

	describe("uncompress", () => {
		it("should uncompress and return the original buffer", () => {
			const inputBuffer = Buffer.from("BdqmR9jRqLRAaj2Q");
			const lzss = new LZSS();
			const compressedBuffer = lzss.compress(inputBuffer);
			const uncompressedBuffer = lzss.uncompress(compressedBuffer!);

			expect(uncompressedBuffer).not.toBeNull();
			expect(uncompressedBuffer).toBeInstanceOf(Buffer);
			expect(uncompressedBuffer!.toString()).toBe(inputBuffer.toString());
		});

		it("should return null for a non-compressed buffer", () => {
			const nonCompressedBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
			const lzss = new LZSS();
			const uncompressedBuffer = lzss.uncompress(nonCompressedBuffer);
			expect(uncompressedBuffer).toBeNull();
		});
	});
});
