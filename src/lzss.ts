class LZSS {
	private windowSize: number;
	private hashTable: { start: any; end: any }[];
	private hashTarget: { data: any; prev: any; next: any }[];

	constructor(windowSize: number = 65536) {
		this.windowSize = windowSize;
		this.hashTable = new Array(256)
			.fill(null)
			.map(() => ({ start: null, end: null }));
		this.hashTarget = new Array(windowSize)
			.fill(null)
			.map(() => ({ data: null, prev: null, next: null }));
	}

	static isCompressed(input: Buffer): boolean {
		const header = input.slice(0, 4);
		return (
			header[0] === 0x4c &&
			header[1] === 0x5a &&
			header[2] === 0x53 &&
			header[3] === 0x53
		);
	}

	static getActualSize(input: Buffer): number {
		if (!this.isCompressed(input)) return 0;
		return input.readUInt32LE(4);
	}

	private buildHash(data: Buffer): void {
		const index = data[0] & (this.windowSize - 1);
		const target = this.hashTarget[index];

		if (target.data) {
			const list = this.hashTable[target.data[0]];
			if (target.prev) {
				list.end = target.prev;
				target.prev.next = null;
			} else {
				list.end = null;
				list.start = null;
			}
		}

		const list = this.hashTable[data[0]];
		target.data = data;
		target.prev = null;
		target.next = list.start;

		if (list.start) {
			list.start.prev = target;
		} else {
			list.end = target;
		}
		list.start = target;
	}

	private compressNoAlloc(
		input: Buffer,
		outputBuffer: Buffer[]
	): Buffer | null {
		const inputLength = input.length;
		if (inputLength <= 3) return null; // Adjusted the minimum length check

		const header = Buffer.alloc(8);
		header.writeUInt32LE(0x4c5a5353, 0); // LZSS ID
		header.writeUInt32LE(inputLength, 4);
		outputBuffer.push(header);

		let output = Buffer.alloc(inputLength);
		let outputIndex = 0;
		let lookAhead = 0;

		while (lookAhead < inputLength) {
			const windowStart = Math.max(0, lookAhead - this.windowSize);
			const lookAheadLength = Math.min(inputLength - lookAhead, 16);
			let bestMatchLength = 0;
			let bestMatchPosition = -1;

			for (let i = windowStart; i < lookAhead; i++) {
				let matchLength = 0;
				while (
					matchLength < lookAheadLength &&
					input[i + matchLength] === input[lookAhead + matchLength]
				) {
					matchLength++;
				}
				if (matchLength > bestMatchLength) {
					bestMatchLength = matchLength;
					bestMatchPosition = i;
				}
			}

			if (bestMatchLength >= 3) {
				output[outputIndex++] = (bestMatchPosition - windowStart) >> 4;
				output[outputIndex++] =
					((bestMatchPosition - windowStart) << 4) |
					(bestMatchLength - 3);
				lookAhead += bestMatchLength;
			} else {
				output[outputIndex++] = input[lookAhead++];
			}

			this.buildHash(input.slice(lookAhead - 1, lookAhead));
		}

		return output.slice(0, outputIndex);
	}

	compress(input: Buffer): Buffer | null {
		const outputBuffer: Buffer[] = [];
		const compressedData = this.compressNoAlloc(input, outputBuffer);
		if (compressedData) {
			return Buffer.concat(outputBuffer);
		}
		return null;
	}

	uncompress(input: Buffer): Buffer | null {
		const actualSize = LZSS.getActualSize(input);
		if (!actualSize) return null;

		const output = Buffer.alloc(actualSize);
		let outputIndex = 0;
		let inputIndex = 8; // Skip header

		while (inputIndex < input.length) {
			const cmdByte = input[inputIndex++];
			for (let i = 0; i < 8; i++) {
				if (cmdByte & (1 << i)) {
					const position =
						(input[inputIndex++] << 4) | (input[inputIndex] >> 4);
					const length = (input[inputIndex++] & 0x0f) + 3;
					const sourceIndex = outputIndex - position - 1;

					for (let j = 0; j < length; j++) {
						output[outputIndex++] = output[sourceIndex + j];
					}
				} else {
					output[outputIndex++] = input[inputIndex++];
				}
				if (outputIndex >= actualSize) break;
			}
		}

		return output;
	}
}

export default LZSS;
