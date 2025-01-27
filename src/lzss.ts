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
		if (inputLength <= 3) return null;

		const header = Buffer.alloc(8);
		header.writeUInt32LE(0x53535a4c, 0);
		header.writeUInt32LE(inputLength, 4);
		outputBuffer.push(header);

		let output = Buffer.alloc(inputLength);
		let outputIndex = 0;
		let lookAhead = 0;
		let putCmdByte = 0;
		let pCmdByte: number | null = null;

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

			if (!putCmdByte) {
				pCmdByte = outputIndex++;
				output[pCmdByte] = 0;
			}

			putCmdByte = (putCmdByte + 1) & 0x07;

			if (bestMatchLength >= 3) {
				output[pCmdByte || 0] = (output[pCmdByte || 0] >> 1) | 0x80;
				output[outputIndex++] = (bestMatchPosition - windowStart) >> 4;
				output[outputIndex++] =
					((bestMatchPosition - windowStart) << 4) |
					(bestMatchLength - 3);
				lookAhead += bestMatchLength;
			} else {
				output[pCmdByte || 0] = output[pCmdByte || 0] >> 1;
				output[outputIndex++] = input[lookAhead++];
			}

			this.buildHash(input.slice(lookAhead - 1, lookAhead));
		}

		if (!putCmdByte) {
			output[outputIndex++] = 0x01;
		} else {
			output[pCmdByte!] = (output[pCmdByte!] >> 1) | 0x80;
		}

		output[outputIndex++] = 0;
		output[outputIndex++] = 0;

		return output.slice(0, outputIndex);
	}

	compress(input: Buffer): Buffer | null {
		const outputBuffer: Buffer[] = [];
		const compressedData = this.compressNoAlloc(input, outputBuffer);
		if (compressedData) {
			outputBuffer.push(compressedData);
			return Buffer.concat(outputBuffer);
		}

		return null;
	}

	uncompress(input: Buffer): Buffer | null {
		const actualSize = LZSS.getActualSize(input);
		if (!actualSize) return null;

		let pInput = 8;
		let pOutput = 0;
		let totalBytes = 0;
		let cmdByte = 0;
		let getCmdByte = 0;

		const output = Buffer.alloc(actualSize);

		while (true) {
			if (!getCmdByte) {
				cmdByte = input[pInput++];
			}
			getCmdByte = (getCmdByte + 1) & 0x07;

			if (cmdByte & 0x01) {
				let position = input[pInput++] << 4;
				position |= input[pInput] >> 4;
				let count = (input[pInput++] & 0x0f) + 1;
				if (count === 1) {
					break;
				}
				let pSource = pOutput - position - 1;
				for (let i = 0; i < count; i++) {
					output[pOutput++] = output[pSource++];
				}
				totalBytes += count;
			} else {
				output[pOutput++] = input[pInput++];
				totalBytes++;
			}
			cmdByte = cmdByte >> 1;
		}

		if (totalBytes !== actualSize) {
			return null;
		}

		return output;
	}
}

export default LZSS;
