class LZSS {
	private readonly WINDOW_SIZE = 4096;
	private readonly LOOKAHEAD_SIZE = 18;
	private readonly MIN_MATCH = 3;
	private readonly WINDOW_MASK = this.WINDOW_SIZE - 1;

	compress(input: Uint8Array): Uint8Array {
		const buffer = new Array<number>(this.WINDOW_SIZE);
		const output: number[] = [];
		let pos = 0;
		let bufferPos = 0;

		while (pos < input.length) {
			let bestLength = 0;
			let bestOffset = 0;

			// Find longest match
			for (let i = 1; i <= this.WINDOW_SIZE; i++) {
				const maxLength = Math.min(
					this.LOOKAHEAD_SIZE,
					input.length - pos
				);
				let currentLength = 0;

				while (
					currentLength < maxLength &&
					input[pos + currentLength] ===
						buffer[
							(bufferPos - i + currentLength) & this.WINDOW_MASK
						]
				) {
					currentLength++;
				}

				if (currentLength > bestLength) {
					bestLength = currentLength;
					bestOffset = i;
				}
			}

			if (bestLength >= this.MIN_MATCH) {
				output.push(1);
				output.push(bestOffset >> 8);
				output.push(bestOffset & 0xff);
				output.push(bestLength);

				for (let i = 0; i < bestLength; i++) {
					buffer[bufferPos] = input[pos + i];
					bufferPos = (bufferPos + 1) & this.WINDOW_MASK;
				}
				pos += bestLength;
			} else {
				output.push(0);
				output.push(input[pos]);
				buffer[bufferPos] = input[pos];
				bufferPos = (bufferPos + 1) & this.WINDOW_MASK;
				pos++;
			}
		}

		return new Uint8Array(output);
	}

	decompress(input: Uint8Array): Uint8Array {
		const buffer = new Array<number>(this.WINDOW_SIZE);
		const output: number[] = [];
		let pos = 0;
		let bufferPos = 0;

		while (pos < input.length) {
			const flag = input[pos++];

			if (flag === 1) {
				const offset = (input[pos] << 8) | input[pos + 1];
				const length = input[pos + 2];
				pos += 3;

				for (let i = 0; i < length; i++) {
					const value =
						buffer[(bufferPos - offset + i) & this.WINDOW_MASK];
					output.push(value);
					buffer[bufferPos] = value;
					bufferPos = (bufferPos + 1) & this.WINDOW_MASK;
				}
			} else {
				const value = input[pos++];
				output.push(value);
				buffer[bufferPos] = value;
				bufferPos = (bufferPos + 1) & this.WINDOW_MASK;
			}
		}

		return new Uint8Array(output);
	}
}

export default LZSS;
