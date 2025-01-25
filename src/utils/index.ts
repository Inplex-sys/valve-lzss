function wordSwap(value: number): number {
	return ((value & 0xff00) >> 8) | ((value & 0x00ff) << 8);
}

function dwordSwap(value: number): number {
	return (
		((value >>> 24) & 0xff) |
		((value >>> 8) & 0xff00) |
		((value & 0xff00) << 8) |
		((value & 0xff) << 24)
	);
}

interface HashTableEntry {
	start: HashTableEntry | null;
	end: HashTableEntry | null;
	data: number | null;
	prev: HashTableEntry | null;
	next: HashTableEntry | null;
}

function buildHash(
	data: number,
	hashTable: HashTableEntry[],
	windowSize: number
): void {
	const targetIndex = data & (windowSize - 1);
	const target = hashTable[targetIndex];

	if (target.data !== null) {
		const list = hashTable[target.data];
		if (target.prev) {
			list.end = target.prev;
			target.prev.next = null;
		} else {
			list.end = null;
			list.start = null;
		}
	}

	const list = hashTable[targetIndex];
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

export { wordSwap, dwordSwap, buildHash };
