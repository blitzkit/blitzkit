import { decompress } from "lz4js";

export class IdArray {
  constructor(
    private array: Uint32Array = new Uint32Array(),
    private _size = array.length,
  ) {}

  get(index: number) {
    return this.array[index];
  }

  push(id: number) {
    if (this._size === this.array.length) {
      const bigger = new Uint32Array(
        this.array.length === 0 ? 1 : this.array.length * 2,
      );

      bigger.set(this.array);
      this.array = bigger;
    }

    this.array[this._size++] = id;
  }

  sort() {
    this.array.subarray(0, this._size).sort();
  }

  size() {
    return this._size;
  }

  toBytes() {
    return new Uint8Array(
      this.array.buffer,
      this.array.byteOffset,
      this._size * Uint32Array.BYTES_PER_ELEMENT,
    );
  }

  toArray() {
    return Array.from(this.array.subarray(0, this._size));
  }

  static fromBytes(bytes: Uint8Array) {
    if (bytes.byteLength % Uint32Array.BYTES_PER_ELEMENT !== 0) {
      throw new Error("Misaligned bytes");
    }

    const size = bytes.byteLength / Uint32Array.BYTES_PER_ELEMENT;
    const capacity = this.nextPowerOf2(size);

    const values = new Uint32Array(bytes.buffer, bytes.byteOffset, size);

    const uintArray = new Uint32Array(capacity);
    uintArray.set(values);

    return new IdArray(uintArray, size);
  }

  static fromCompressed(bytes: Uint8Array) {
    const decompressed = decompress(bytes);
    return this.fromBytes(decompressed);
  }

  static fromArray(array: number[]) {
    const uintArray = new Uint32Array(this.nextPowerOf2(array.length));

    uintArray.set(array);

    return new IdArray(uintArray, array.length);
  }

  private static nextPowerOf2(value: number): number {
    if (value <= 1) return 1;
    return 2 ** Math.ceil(Math.log2(value));
  }
}
